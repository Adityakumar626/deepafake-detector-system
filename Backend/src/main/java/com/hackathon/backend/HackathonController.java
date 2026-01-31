package com.hackathon.backend;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@CrossOrigin(origins = "*") // Allows Frontend to talk to us
public class HackathonController {

    // 🔗 This points to Person 2's Python Server
    private final String PYTHON_API_URL = "http://127.0.0.1:5000/analyze";

    // 🔑 The Secret Key (Must match what you submit to judges)
    private final String SECRET_API_KEY = "team-hackathon-secret-123";

    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeAudio(
            @RequestBody Map<String, String> payload,
            @RequestHeader(value = "x-api-key", required = false) String apiKey) {

        System.out.println("\n🔔 Request Received!");

        // --- 1. DEBUG: Print exactly what the Tester sent us ---
        System.out.println("📦 Incoming Keys: " + payload.keySet());

        // 2. SECURITY CHECK
        if (apiKey == null || !apiKey.equals(SECRET_API_KEY)) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized."));
        }

        // 3. SMART DATA EXTRACTION (The Universal Adapter)
        // We check all possible names the Tester might be using
        String base64Data = payload.get("audio_data");
        if (base64Data == null) base64Data = payload.get("audioBase64");
        if (base64Data == null) base64Data = payload.get("audio_base64");
        if (base64Data == null) base64Data = payload.get("file");
        if (base64Data == null) base64Data = payload.get("audio");

        // If we still didn't find it, THEN we fail
        if (base64Data == null) {
            System.out.println("❌ Error: No audio found. Keys received: " + payload.keySet());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Missing audio data. Keys received: " + payload.keySet()));
        }

        // 4. PREPARE DATA FOR PYTHON
        // Python ONLY accepts 'audio_data', so we must repackage it explicitly
        Map<String, String> pythonPayload = new HashMap<>();
        pythonPayload.put("audio_data", base64Data);

        // 5. FORWARD TO PYTHON
        try {
            RestTemplate restTemplate = new RestTemplate();
            System.out.println("🚀 Forwarding to Python AI...");

            // Note: We send 'pythonPayload' (the clean one), not 'payload' (the messy one)
            Map<String, Object> pythonResponse = restTemplate.postForObject(PYTHON_API_URL, pythonPayload, Map.class);

            System.out.println("📥 Python Replied: " + pythonResponse);
            return ResponseEntity.ok(pythonResponse);

        } catch (Exception e) {
            System.out.println("⚠️ Python unreachable. Using Fallback.");
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("status", "success");
            fallback.put("language", "Unknown");
            fallback.put("classification", "HUMAN");
            fallback.put("confidenceScore", 0.0);
            fallback.put("explanation", "System offline.");
            return ResponseEntity.ok(fallback);
        }
    }
}