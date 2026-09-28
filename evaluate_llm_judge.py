import os
import json
import glob
from openai import OpenAI
from dotenv import load_dotenv

def evaluate():
    load_dotenv()
    api_key = os.getenv("GROQ_API_KEY")
    model = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
    
    if not api_key:
        print("GROQ_API_KEY not found.")
        return
        
    client = OpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")
    
    # We'll evaluate the sample clips we generated earlier
    caption_files = glob.glob("output/*_captions.json")
    
    results = []
    
    for cap_file in caption_files:
        video_name = os.path.basename(cap_file).removesuffix("_captions.json")
        
        # Load raw captions
        try:
            with open(cap_file, "r", encoding="utf-8") as f:
                raw_data = json.load(f)
            raw_text = " ".join([v.get("caption", "") for k, v in raw_data.items()])
        except Exception:
            raw_text = "No raw captions available."
            
        # Try to load VERITAS-V output (narrative or causal narrative or explained)
        explained_path = f"output/{video_name}_explained.json"
        causal_narr_path = f"output/{video_name}_causal_narrative.txt"
        narrative_path = f"output/{video_name}_narrative.txt"
        
        veritas_text = ""
        if os.path.exists(explained_path):
            with open(explained_path, "r", encoding="utf-8") as f:
                veritas_text = str(json.load(f))
        elif os.path.exists(causal_narr_path):
            with open(causal_narr_path, "r", encoding="utf-8") as f:
                veritas_text = f.read()
        elif os.path.exists(narrative_path):
            with open(narrative_path, "r", encoding="utf-8") as f:
                veritas_text = f.read()
        else:
            veritas_text = "No VERITAS-V processed output available."
            
        if not raw_text.strip() or not veritas_text.strip():
            continue
            
        prompt = (
            "You are an expert video understanding judge. Please compare two sets of video descriptions: "
            "Raw Baseline VLM Captions vs. VERITAS-V Verified Narratives.\n\n"
            f"Raw Baseline: {raw_text}\n\n"
            f"VERITAS-V: {veritas_text}\n\n"
            "Score both approaches from 1 to 5 on these three axes:\n"
            "1. Factual Consistency (1-5): Freedom from hallucinations/false actions.\n"
            "2. Causal Coherence (1-5): Logical temporal flow explaining 'why' actions happen.\n"
            "3. Action Completeness (1-5): Thorough coverage of scene transitions and actors.\n\n"
            "Respond strictly in JSON format matching this schema:\n"
            "{\n"
            "  \"raw_scores\": {\"factual\": int, \"causal\": int, \"completeness\": int},\n"
            "  \"veritas_scores\": {\"factual\": int, \"causal\": int, \"completeness\": int},\n"
            "  \"rationale\": \"Brief explanation of your scoring...\"\n"
            "}"
        )
        
        try:
            print(f"Judging {video_name}...")
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content.strip()
            parsed = json.loads(content)
            
            raw_scores = parsed.get("raw_scores", {"factual": 0, "causal": 0, "completeness": 0})
            veritas_scores = parsed.get("veritas_scores", {"factual": 0, "causal": 0, "completeness": 0})
            
            # Sum scores to determine winner
            raw_total = sum(raw_scores.values())
            veritas_total = sum(veritas_scores.values())
            veritas_win = 1 if veritas_total > raw_total else 0
            
            results.append({
                "video_name": video_name,
                "raw_scores": raw_scores,
                "veritas_scores": veritas_scores,
                "veritas_total": veritas_total,
                "raw_total": raw_total,
                "veritas_win": veritas_win,
                "rationale": parsed.get("rationale", "")
            })
        except Exception as e:
            print(f"Error judging {video_name}: {e}")
            
    # Compute overall averages
    if not results:
        print("No valid results found.")
        return
        
    num_videos = len(results)
    avg_raw_fac = sum(r["raw_scores"].get("factual", 0) for r in results) / num_videos
    avg_raw_cau = sum(r["raw_scores"].get("causal", 0) for r in results) / num_videos
    avg_raw_com = sum(r["raw_scores"].get("completeness", 0) for r in results) / num_videos
    
    avg_ver_fac = sum(r["veritas_scores"].get("factual", 0) for r in results) / num_videos
    avg_ver_cau = sum(r["veritas_scores"].get("causal", 0) for r in results) / num_videos
    avg_ver_com = sum(r["veritas_scores"].get("completeness", 0) for r in results) / num_videos
    
    win_rate = (sum(r["veritas_win"] for r in results) / num_videos) * 100
    
    md_path = "output/llm_judge_evaluation.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("## LLM-as-a-Judge Comparative Evaluation\n\n")
        f.write("### Averages\n\n")
        f.write("| Axis | Raw Baseline | VERITAS-V |\n")
        f.write("|------|--------------|-----------|\n")
        f.write(f"| Factual Consistency | {avg_raw_fac:.2f} | {avg_ver_fac:.2f} |\n")
        f.write(f"| Causal Coherence | {avg_raw_cau:.2f} | {avg_ver_cau:.2f} |\n")
        f.write(f"| Action Completeness | {avg_raw_com:.2f} | {avg_ver_com:.2f} |\n")
        f.write(f"| **Overall Win-Rate** | - | **{win_rate:.1f}%** |\n\n")
        
        f.write("### Per-Video Rationale\n\n")
        for r in results:
            f.write(f"**{r['video_name']}**\n")
            f.write(f"- **Raw Scores:** Fac:{r['raw_scores'].get('factual')} Cau:{r['raw_scores'].get('causal')} Com:{r['raw_scores'].get('completeness')} (Total: {r['raw_total']})\n")
            f.write(f"- **VERITAS Scores:** Fac:{r['veritas_scores'].get('factual')} Cau:{r['veritas_scores'].get('causal')} Com:{r['veritas_scores'].get('completeness')} (Total: {r['veritas_total']})\n")
            f.write(f"- **Rationale:** {r['rationale']}\n\n")
            
    print(f"Evaluation report saved to {md_path}")

if __name__ == "__main__":
    evaluate()
