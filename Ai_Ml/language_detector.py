# language_detector.py
import whisper

# Load Whisper model once (important for performance)
_whisper_model = whisper.load_model("small")

# Map Whisper language codes to required language names
LANGUAGE_MAP = {
    "en": "English",
    "hi": "Hindi",
    "ta": "Tamil",
    "te": "Telugu",
    "ml": "Malayalam",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "pt": "Portuguese",
    "ru": "Russian",
    "ar": "Arabic",
    "id": "Indonesian",
    "ja": "Japanese",
    "ko": "Korean",
    "zh": "Chinese",
    "it": "Italian",
    "tr": "Turkish",
    "ur": "Urdu",
    "bn": "Bengali",
    "pa": "Punjabi",
    "mr": "Marathi",
    "gu": "Gujarati",
    "kn": "Kannada",
    "or": "Odia"
}

def detect_language(audio_path: str) -> str:
    """
    Detect spoken language from an audio file using Whisper.
    Returns one of the supported language names or 'Unknown'.
    """

    try:
        # Transcribe only for language detection (no text needed)
        result = _whisper_model.transcribe(
            audio_path,
            task="transcribe",
            fp16=False   # IMPORTANT for CPU systems
        )

        lang_code = result.get("language")

        # Convert language code to readable name
        return LANGUAGE_MAP.get(lang_code, "Unknown")

    except Exception as e:
        # Never crash the API because of language detection
        print(f"⚠️ Whisper language detection failed: {e}")
        return "Unknown"