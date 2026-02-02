# app.py
from flask import Flask, request, jsonify
import os

# Keep your existing imports!
from decoder import decode_audio
from detector_signal import signal_detect
from config import SUPPORTED_LANGUAGES

app = Flask(__name__)

USE_ML = os.getenv("USE_ML", "true").strip().lower() in {"1", "true", "yes", "y"}

@app.route("/analyze", methods=["POST"])
def analyze_voice():
    # 1. DEBUG PRINT (See exactly what Java sends in the terminal)
    print("\n----- 📩 NEW REQUEST RECEIVED -----")
    
    try:
        data = request.get_json()
        print(f"📦 Payload Keys: {list(data.keys())}")  # Debug line

        if not data:
            return jsonify({"status": "error", "message": "Empty JSON"}), 400

        # --- FIX STARTS HERE ---
        
        # 2. UNIVERSAL ADAPTER (Accept 'audio_data' OR 'audioBase64')
        audio_base64 = data.get("audioBase64") or data.get("audio_data")

        # 3. USE DEFAULTS (Don't crash if Java forgets Language/Format)
        language = data.get("language", "English")       # Default to English
        audio_format = data.get("audioFormat", "mp3")    # Default to mp3

        # 4. RELAXED VALIDATION (Only fail if Audio is missing)
        if not audio_base64:
            print("❌ Error: Audio data missing!")
            return jsonify({
                "status": "error", 
                "message": "Missing audio data. (Checked 'audio_data' and 'audioBase64')"
            }), 400

        # --- FIX ENDS HERE ---

        # The rest of your logic remains the same...
        
        # Decode audio
        audio_path = decode_audio(audio_base64)
        print(f"✅ Audio decoded to: {audio_path}")

        try:
            # Detection logic
            if USE_ML:
                try:
                    from detector_ml import ml_detect
                    classification, confidence, explanation = ml_detect(audio_path)
                except Exception as e:
                    print(f"⚠️ ML Failed ({e}), switching to Signal Analysis.")
                    classification, confidence, explanation = signal_detect(audio_path)
            else:
                classification, confidence, explanation = signal_detect(audio_path)
        
        finally:
            # Cleanup file
            if os.path.exists(audio_path):
                os.remove(audio_path)
                print("🧹 Cleaned up temporary file.")

        # Final response
        response = {
            "status": "success",
            "language": language,
            "classification": classification,
            "confidenceScore": round(float(confidence), 2),
            "explanation": explanation
        }
        print(f"🚀 Sending Response: {response['classification']}")
        return jsonify(response)

    except ValueError as ve:
        print(f"❌ ValueError: {ve}")
        return jsonify({"status": "error", "message": "Invalid Audio Format"}), 400
    except Exception as e:
        print(f"❌ Server Error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    print("🐍 Python AI Service Running on Port 5000...")
    app.run(host="0.0.0.0", port=5000)