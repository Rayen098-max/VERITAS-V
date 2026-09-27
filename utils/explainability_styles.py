import logging

# Common style signature: (records: list[dict]) -> (json_records: list[dict], markdown: str)
#
# `records` is the pre-joined list this module expects as input — each item already merged
# from causal.json + verification.json + captions.json by generate_explainability_report.py:
#   {
#     "scene_id": str,
#     "claim": str,
#     "verdict": str,
#     "confidence": str,
#     "reasoning": str,
#     "evidence": {"frame_files": list[str], "start_time": float, "end_time": float},
#   }


def structured_style(records, **kwargs):
    '''Deterministically assemble the final annotated narrative — pure formatting, no reasoning
    required. Every claim is kept and visibly flagged with its verdict; only a real "contradicted"
    verdict marks a claim as excluded from the clean narrative view (see included_in_narrative).'''

    json_records = []
    md_lines = ["## Explained Narrative", ""]

    for r in records:
        included = r["verdict"] != "contradicted"
        json_records.append({
            "scene_id": r["scene_id"],
            "claim": r["claim"],
            "verdict": r["verdict"],
            "confidence": r["confidence"],
            "evidence": r["evidence"],
            "included_in_narrative": included,
        })

        ev = r["evidence"]
        n_frames = len(ev["frame_files"])
        tag = "" if included else " EXCLUDED -"
        md_lines.append(
            f"{r['claim']} [confidence: {r['confidence']} -{tag} {r['verdict'].upper()}] "
            f"`({ev['start_time']:.2f}s-{ev['end_time']:.2f}s, {n_frames} frames)`"
        )
        if ev.get('action_summary') or ev.get('detected_elements'):
            md_lines.append(f"> **Action Summary**: {ev.get('action_summary', '')}")
            md_lines.append(f"> **Elements**: {ev.get('detected_elements', {})}")
        md_lines.append("")

    return json_records, "\n".join(md_lines).rstrip() + "\n"


# LLM-enhanced narrative style — structurally complete, generation stubbed pending an API key.
#
# To make this real, will need:
#   - Provider/model selection via EXPLAINABILITY_LLM_PROVIDER (e.g. "openai" or "anthropic") and
#     EXPLAINABILITY_LLM_MODEL (e.g. "gpt-4o-mini" or "claude-...").
#   - API key env var depending on provider, e.g. OPENAI_API_KEY (already exists in this project).
#   - Prompt structure: pass the same joined `records` list (claim + verdict + evidence per scene)
#     and ask the model to rewrite the surviving (non-excluded) claims into a smoother narrative
#     paragraph, while still citing evidence per sentence (e.g. inline "[scene_003, 11.6-26.6s]"
#     markers) and explicitly preserving/labeling any flagged claims rather than silently dropping
#     them — the model must not improve readability at the cost of hiding what was unverified.

def narrative_llm_style(records, **kwargs):
    '''Rewrite the explained narrative into smoother prose via a real LLM. Not yet implemented.'''

    # provider = os.getenv("EXPLAINABILITY_LLM_PROVIDER", "openai")
    # model = os.getenv("EXPLAINABILITY_LLM_MODEL", "gpt-4o-mini")
    # api_key = os.getenv("OPENAI_API_KEY")  # or provider-specific key
    #
    # prompt = (
    #     "Rewrite the following per-scene claims into a smooth narrative paragraph. Keep an "
    #     "inline evidence citation after each sentence (scene id + time range). Do not drop or "
    #     "silently smooth over any claim flagged as unverified/unverifiable/contradicted — "
    #     "keep its flag visible.\n\n" + json.dumps(records, indent=2)
    # )
    # response = <call provider chat completion API with prompt>
    # return <parsed json_records, markdown>

    raise NotImplementedError(
        "LLM-enhanced explainability style not yet implemented — requires an API key (OpenAI/Anthropic/etc.), see README."
    )


STYLES = {
    "structured": structured_style,
    "narrative_llm": narrative_llm_style,
}


def get_style(name):
    '''Look up an explainability style function by name.'''

    if name not in STYLES:
        raise ValueError(f"Unknown EXPLAINABILITY_STYLE: {name!r}. Valid options: {list(STYLES)}")
    return STYLES[name]
