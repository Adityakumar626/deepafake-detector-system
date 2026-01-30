import { useState, useRef } from "react";
import {
  Mic,
  Square,
  Loader2,
  ShieldCheck,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";

function App() {
  const [status, setStatus] = useState("idle"); // idle, recording, loading, success, error
  const [result, setResult] = useState(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  // --- LOGIC ---

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        processAndSend(audioBlob);
      };

      mediaRecorder.current.start();
      setStatus("recording");
    } catch (err) {
      alert("Please allow microphone access!");
    }
  };

  const stopRecording = () => {
    mediaRecorder.current.stop();
    setStatus("loading");
  };

  const processAndSend = (blob) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64String = reader.result.split(",")[1];
      sendToServer(base64String);
    };
  };

  const sendToServer = async (base64Data) => {
    try {
      const response = await fetch(
        "https://ungrateful-noninflationary-pinkie.ngrok-free.dev/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "team-hackathon-secret-123",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ audio_data: base64Data }),
        },
      );

      const data = await response.json();
      setResult(data);

      // If Person 2 returns "AI_GENERATED", we show error. If "HUMAN", success.
      setStatus(data.classification_result === "HUMAN" ? "success" : "error");
    } catch (err) {
      console.error(err);
      alert("Java Backend not found! Ensure Person 4's server is on.");
      setStatus("idle");
    }
  };

  // --- UI ---

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-blue-400 tracking-tight">
        Deepfake Detector
      </h1>

      <div className="bg-slate-800 p-10 rounded-3xl shadow-2xl border border-slate-700 flex flex-col items-center w-full max-w-md">
        {/* IDLE STATE */}
        {status === "idle" && (
          <button
            onClick={startRecording}
            className="bg-blue-600 hover:bg-blue-500 p-8 rounded-full transition-all shadow-lg shadow-blue-900/40"
          >
            <Mic size={48} />
          </button>
        )}

        {/* RECORDING STATE */}
        {status === "recording" && (
          <button
            onClick={stopRecording}
            className="bg-red-600 hover:bg-red-500 p-8 rounded-full animate-pulse shadow-lg shadow-red-900/40"
          >
            <Square size={48} />
          </button>
        )}

        {/* LOADING STATE */}
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <Loader2 size={64} className="animate-spin text-blue-400" />
            <p className="mt-4 font-semibold">Analyzing Voice Patterns...</p>
          </div>
        )}

        {/* SUCCESS STATE (HUMAN) */}
        {status === "success" && (
          <div className="flex flex-col items-center text-green-400">
            <ShieldCheck size={80} />
            <h2 className="text-2xl font-bold mt-4">Verified Human</h2>
            <p className="text-slate-400">
              Confidence: {(result?.confidence_score * 100).toFixed(1)}%
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-6 flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <RefreshCcw size={16} /> Scan Another
            </button>
          </div>
        )}

        {/* ERROR STATE (AI) */}
        {status === "error" && (
          <div className="flex flex-col items-center text-red-500">
            <AlertCircle size={80} />
            <h2 className="text-2xl font-bold mt-4">Deepfake Detected</h2>
            <p className="text-slate-400">
              Probability: {(result?.confidence_score * 100).toFixed(1)}%
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-6 flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <RefreshCcw size={16} /> Try Again
            </button>
          </div>
        )}

        <p className="mt-8 text-slate-500 text-xs font-mono uppercase tracking-widest">
          {status === "idle" ? "System Ready" : status}
        </p>
      </div>
    </div>
  );
}

export default App;
