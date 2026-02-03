# detector_ml.py

from transformers import pipeline

# Load once at startup (production practice)
audio_classifier = pipeline(
    task="audio-classification",
    model="MelodyMachine/Deepfake-audio-detection-V2"
)

def ml_detect(audio_path: str):
    """
    Uses a pre-trained Hugging Face model to detect AI-generated voice.
    """
    results = audio_classifier(audio_path)
    top_result = results[0]

    label = top_result["label"].lower()
    score = float(top_result["score"])

    if "fake" in label or "ai" in label:
        return (
            "AI_GENERATED",
            score,
            "Synthetic voice patterns detected by deep learning model"
        )
    else:
        return (
            "HUMAN",
            score,
            "Natural human speech characteristics detected"
        )
