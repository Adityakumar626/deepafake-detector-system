# config.py

SUPPORTED_LANGUAGES = {
    "Tamil",
    "English",
    "Hindi",
    "Malayalam",
    "Telugu"
}

# Thresholds for fallback logic (not hardcoded results, only signals)
SPECTRAL_FLATNESS_THRESHOLD = 0.25
PITCH_VARIANCE_THRESHOLD = 20.0
ZCR_THRESHOLD = 0.12
CENTROID_THRESHOLD = 0.45
ROLLOFF_THRESHOLD = 0.6
AI_SCORE_THRESHOLD = 1.1
CONFIDENCE_MIN = 0.55
CONFIDENCE_MAX = 0.9
