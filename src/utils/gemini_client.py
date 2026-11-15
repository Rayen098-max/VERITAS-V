import os
import sys
import json
import base64
import logging
import urllib.request
import urllib.error

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

def get_gemini_key():
    return os.getenv("GEMINI_API_KEY", "").strip()

def get_gemini_model():
    return os.getenv("GEMINI_VISION_MODEL", "gemini-3-flash-preview").strip()

def execute_gemini_vision(prompt: str, image_paths: list, json_mode: bool = True) -> str:
    """
    Executes a multimodal vision request against the Google Gemini API using pure REST,
    ensuring zero external gRPC dependencies and reliable Windows Python execution.
    """
    api_key = get_gemini_key()
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured in .env")

    model = get_gemini_model()
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

    parts = [{"text": prompt}]

    # Attach images as base64 inline_data
    for p in image_paths:
        if os.path.exists(p) and os.path.getsize(p) > 0:
            with open(p, "rb") as f:
                b64_bytes = base64.b64encode(f.read()).decode("utf-8")
            parts.append({
                "inline_data": {
                    "mime_type": "image/jpeg",
                    "data": b64_bytes
                }
            })

    payload = {
        "contents": [{"parts": parts}]
    }

    if json_mode:
        payload["generationConfig"] = {
            "response_mime_type": "application/json"
        }

    req_data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=req_data,
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            candidates = data.get("candidates", [])
            if not candidates:
                raise ValueError("No candidates returned from Gemini API")
            text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            return text.strip()
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        logging.error(f"Gemini API HTTP {e.code}: {err_msg}")
        raise RuntimeError(f"Gemini API HTTP Error {e.code}: {err_msg}")
    except Exception as e:
        logging.error(f"Gemini API execution failed: {e}")
        raise e
