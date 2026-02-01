# detector_signal.py

import librosa
import numpy as np
from config import SPECTRAL_FLATNESS_THRESHOLD

def signal_detect(audio_path: str):
    try:
        y, sr = librosa.load(audio_path, sr=None, mono=True)

        flatness = np.mean(librosa.feature.spectral_flatness(y=y))

        if flatness > SPECTRAL_FLATNESS_THRESHOLD:
            return (
                "AI_GENERATED",
                0.65,
                "High spectral flatness indicates synthetic audio"
            )
        else:
            return (
                "HUMAN",
                0.65,
                "Natural harmonic structure detected"
            )

    except Exception:
        # FINAL SAFETY NET (never crash API)
        return (
            "HUMAN",
            0.5,
            "Audio could not be reliably analyzed; defaulting to human-like characteristics"
        )
