# Engineering Guardrails

These rules were learned during the development of the VERITAS pipeline and must be strictly followed to prevent recurring errors.

## 1. Python File I/O (Encoding)
- **Rule:** Always explicitly specify `encoding="utf-8"` when reading or writing text and JSON files in Python (e.g., `open(path, "w", encoding="utf-8")`).
- **Rationale:** Prevents `charmap` UnicodeEncodeErrors on Windows, ensuring cross-platform text processing stability.

## 2. LLM API `json_object` Mode
- **Rule:** When calling OpenAI-compatible APIs (like Groq) with `response_format={"type": "json_object"}`, you MUST prompt the model to return a top-level JSON object/dictionary (e.g., `{"items": [...]}`). 
- **Constraint:** NEVER prompt the model to return a raw JSON array (`[...]`), as this will trigger a `400 BadRequest` validation failure on the provider side.
