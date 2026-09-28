import os
import json
import logging
from utils.chat_gpt_utils import caption_scene_with_images, safe_json_extract

# Common backend signature: (frame_paths: dict, transcript: str, **kwargs) -> (caption: str, keywords: list[str])

def gpt4o_backend(frame_paths, transcript, api_key=None, model=None, retries=10, **kwargs):
    '''Caption a scene using the real OpenAI GPT-4o API (non-batch path).'''

    return caption_scene_with_images(frame_paths, api_key, transcript, model, retries)


def mock_backend(frame_paths, transcript, scene_id=None, **kwargs):
    '''Deterministic fake caption/keywords for pipeline testing without any API calls.'''

    return {
        "caption": f"Mock caption for {scene_id}",
        "action_summary": f"Mock action for {scene_id}",
        "detected_elements": {
            "primary_actor": "mock actor",
            "objects": ["mock_obj1", "mock_obj2"],
            "environment": "mock env"
        },
        "keywords": ["mock", "scene", scene_id]
    }


# Qwen2.5-VL backend — locally-hosted VLM captioning, requires GPU environment (Colab/Kaggle).
#
#   - Package: `transformers` (>=4.49, with Qwen2.5-VL support) + `qwen-vl-utils` for image/video
#     preprocessing, and `accelerate` for device placement. Install via GPU-enabled environment.
#   - GPU VRAM: ~16-20GB for the 7B model in bf16 (the smallest commonly-used Qwen2.5-VL size);
#     the 3B variant fits in ~8-10GB if VRAM is tighter. Not viable on CPU-only.
#   - Env vars: QWEN25VL_MODEL_PATH (local path or HF repo id, default
#     "Qwen/Qwen2.5-VL-3B-Instruct"), QWEN25VL_DEVICE ("cuda" / "cuda:0" / "cpu", default "cuda"),
#     and QWEN25VL_MAX_NEW_TOKENS to bound generation length (default 300).

_qwen_model = None
_qwen_processor = None

QWEN_PROMPT = (
    "Analyze the following transcript and images. "
    "Return a detailed JSON response describing this scene. "
    "Do not infer beyond what is visible and within the transcript text. "
    "Provide the response in the following JSON format:\n"
    "{\n"
    '  "caption": "1-2 sentence detailed visual description.",\n'
    '  "action_summary": "Short 3-5 word summary of the main action.",\n'
    '  "detected_elements": {\n'
    '    "primary_actor": "Main subject or person",\n'
    '    "objects": ["List", "of", "visible", "objects"],\n'
    '    "environment": "Setting or background"\n'
    '  },\n'
    '  "keywords": ["keyword1", "keyword2", "keyword3"]\n'
    "}"
    "\n\nTranscript:\n{transcript}"
)


def _load_qwen_model():
    '''Lazily load and cache the Qwen2.5-VL model + processor.'''

    global _qwen_model, _qwen_processor

    from transformers import Qwen2_5_VLForConditionalGeneration, AutoProcessor
    import torch

    model_path = os.getenv("QWEN25VL_MODEL_PATH", "Qwen/Qwen2.5-VL-3B-Instruct")
    device = os.getenv("QWEN25VL_DEVICE", "cuda")

    logging.info(f"Loading Qwen2.5-VL model {model_path!r} on {device!r}...")
    _qwen_model = Qwen2_5_VLForConditionalGeneration.from_pretrained(
        model_path,
        torch_dtype=torch.bfloat16,
        device_map=device,
    )
    _qwen_processor = AutoProcessor.from_pretrained(model_path)


def qwen25vl_backend(frame_paths, transcript, **kwargs):
    '''Caption a scene using a locally-hosted Qwen2.5-VL model.'''

    from qwen_vl_utils import process_vision_info

    global _qwen_model, _qwen_processor

    if _qwen_model is None:
        _load_qwen_model()

    image_content = [
        {"type": "image", "image": path}
        for path in frame_paths.values()
        if os.path.exists(path)
    ]
    if not image_content:
        logging.warning("No existing frame images found for scene; skipping Qwen2.5-VL captioning.")
        return None

    prompt = QWEN_PROMPT.format(transcript=transcript or "")
    messages = [
        {
            "role": "user",
            "content": image_content + [{"type": "text", "text": prompt}],
        }
    ]

    text = _qwen_processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    image_inputs, video_inputs = process_vision_info(messages)

    inputs = _qwen_processor(
        text=[text],
        images=image_inputs,
        videos=video_inputs,
        padding=True,
        return_tensors="pt",
    ).to(_qwen_model.device)

    max_new_tokens = int(os.getenv("QWEN25VL_MAX_NEW_TOKENS", "300"))
    generated_ids = _qwen_model.generate(**inputs, max_new_tokens=max_new_tokens)
    generated_ids_trimmed = [
        out_ids[len(in_ids):] for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
    ]
    output_text = _qwen_processor.batch_decode(
        generated_ids_trimmed, skip_special_tokens=True, clean_up_special_tokens=False
    )
    content = output_text[0].strip()

    try:
        obj = json.loads(safe_json_extract(content))
        caption = (obj.get("caption") or "").strip()
        keywords = obj.get("keywords", [])
        if isinstance(keywords, str):
            keywords = [kw.strip() for kw in keywords.split(",") if kw.strip()]
        elif isinstance(keywords, list):
            keywords = [str(kw).strip() for kw in keywords if str(kw).strip()]
        else:
            keywords = []
        
        return {
            "caption": caption,
            "action_summary": obj.get("action_summary", ""),
            "detected_elements": obj.get("detected_elements", {}),
            "keywords": keywords
        }
    except Exception as e:
        logging.warning(f"Qwen2.5-VL output was not valid JSON ({e}); falling back to raw text as caption.")
        return {
            "caption": content,
            "action_summary": "",
            "detected_elements": {},
            "keywords": []
        }


def groq_backend(frame_paths, transcript, **kwargs):
    '''Caption a scene using Groq Vision API with failover.'''
    from utils.groq_client import execute_with_groq_failover
    from utils.chat_gpt_utils import build_prompt_and_images, safe_json_extract
    
    prompt, images = build_prompt_and_images(transcript, frame_paths)
    model = os.getenv("GROQ_VISION_MODEL", "llama-3.2-11b-vision-preview")
    
    def _call(client):
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": [{"type": "text", "text": prompt}] + images}],
            max_tokens=400,
            response_format={"type": "json_object"}
        )
        return response.choices[0].message.content.strip()

    content = execute_with_groq_failover(_call)
    obj = json.loads(safe_json_extract(content))
    caption = (obj.get("caption") or "").strip()
    keywords = obj.get("keywords", [])
    if isinstance(keywords, str):
        keywords = [kw.strip() for kw in keywords.split(",") if kw.strip()]
    elif isinstance(keywords, list):
        keywords = [str(kw).strip() for kw in keywords if str(kw).strip()]
    else:
        keywords = []
        
    return {
        "caption": caption,
        "action_summary": obj.get("action_summary", ""),
        "detected_elements": obj.get("detected_elements", {}),
        "keywords": keywords
    }

BACKENDS = {
    "gpt4o": gpt4o_backend,
    "qwen25vl": qwen25vl_backend,
    "mock": mock_backend,
    "groq": groq_backend,
}


def get_backend(name):
    '''Look up a captioning backend function by name.'''

    if name not in BACKENDS:
        raise ValueError(f"Unknown CAPTIONING_BACKEND: {name!r}. Valid options: {list(BACKENDS)}")
    return BACKENDS[name]
