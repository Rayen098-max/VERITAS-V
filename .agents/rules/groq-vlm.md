# Groq Vision APIs

## Constraints
1. **Image Payload Limits**: The Groq Vision API imposes strict limits on the number of images per request. When generating or preparing multi-frame prompts for models like `Qwen`, **never pass more than 3 images** in a single API call to avoid `400 BadRequestError: Too many images provided`. If there are more than 3 frames, you must subsample or limit the selection to at most 3 images.
2. **Base64 Payload Protocols**: When passing base64-encoded image strings to Groq (which uses the OpenAI-compatible client), a raw base64 string will fail with an `unsupported protocol` error. You must explicitly prepend the base64 string with the standard protocol header inside the `url` object, like this: `{"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_string}"}}`.
