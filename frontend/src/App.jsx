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
    const payload = { audio_data: base64Data };

    try {
      const response = await fetch(
        "https://ungrateful-noninflationary-pinkie.ngrok-free.dev/analyze", // ⚠️ Check URL path! Is it /analyze or /api/analyze?
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "69420",
            "x-api-key": "team-hackathon-secret-123",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) throw new Error("Server response was not OK");

      const data = await response.json();
      console.log("✅ Backend Replied:", data);

      const resultType = data.classification?.trim().toUpperCase();

      setStatus(resultType === "HUMAN" ? "success" : "error");
      setResult(data);
    } catch (error) {
      console.error("The specific error is:", error.message);
      alert("Connection error: " + error.message);
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
              Confidence: {(result?.confidenceScore * 100).toFixed(1)}%
            </p>
            <p className="text-slate-400">Explanation: {result?.explanation}</p>
            <p className="text-slate-400">Language: {result?.language}</p>
            {/* ... button ... */}
          </div>
        )}

        {/* ERROR STATE (AI) */}
        {status === "error" && (
          <div className="flex flex-col items-center text-red-500">
            <AlertCircle size={80} />
            <h2 className="text-2xl font-bold mt-4">Deepfake Detected</h2>
            <div className="text-center">
              <p className="text-slate-400">
                Probability: {(result?.confidenceScore * 100).toFixed(1)}%
              </p>
              <p className="text-slate-400">
                Explanation:{" "}
                {result?.explanation?.split(" ").slice(0, 3).join(" ")}
              </p>
              <p className="text-slate-400">Language: {result?.language}</p>
            </div>
            {/* ... button ... */}
          </div>
        )}

        <p
          className={`mt-8 text-sm font-mono uppercase tracking-widest transition-all duration-500 ${
            status === "success"
              ? "text-green-500 font-bold"
              : status === "error"
                ? "text-red-500 font-bold animate-slow-blink"
                : "text-slate-500"
          }`}
        >
          {status === "idle" ? "System Ready" : status}
        </p>
      </div>
    </div>
  );
}

export default App;
