# server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import tempfile
import os

app = Flask(__name__)
CORS(app)

# Choose model: "tiny","base","small","medium","large"
# base = good balance of speed & accuracy
MODEL_NAME = "base"

print(f"Loading Whisper model '{MODEL_NAME}' (this may download the model)...")
model = whisper.load_model(MODEL_NAME)
print("Whisper model loaded.")

@app.route("/stt", methods=["POST"])
def stt():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file uploaded"}), 400

    audio_file = request.files["audio"]

    # Save the uploaded file to a stable temp file with correct suffix
    suffix = os.path.splitext(audio_file.filename)[1] or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp_path = tmp.name
        audio_file.save(tmp_path)

    try:
        # Whisper will call ffmpeg internally to read the file
        # Force language=None (auto-detect) or set language="en" if desired
        result = model.transcribe(tmp_path, fp16=False)  # fp16=False safer on CPU
        text = result.get("text", "").strip()
        return jsonify({"text": text})
    except Exception as e:
        return jsonify({"error": f"Transcription failed: {e}"}), 500
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass

if __name__ == "__main__":
    # Run on localhost:5000
    app.run(host="127.0.0.1", port=5000, debug=True)
