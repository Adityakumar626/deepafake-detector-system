# decoder.py

import base64
import tempfile

def decode_audio(audio_base64: str) -> str:
    """
    Decodes Base64 MP3 audio and saves to a temporary file.
    Audio content is NOT modified.
    """
    try:
        audio_bytes = base64.b64decode(audio_base64, validate=True)
    except Exception as exc:
        raise ValueError("Invalid Base64 audio data") from exc

    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as f:
        f.write(audio_bytes)
        filename = f.name

    return filename
