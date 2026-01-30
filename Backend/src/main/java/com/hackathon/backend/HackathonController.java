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

        // 1. SECURITY CHECK
        if (apiKey == null || !apiKey.equals(SECRET_API_KEY)) {
            System.out.println("❌ BLOCKED: Invalid API Key.");
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Unauthorized. Invalid 'x-api-key'."));
        }

        // 2. INPUT CHECK
        if (!payload.containsKey("audio_data")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Missing 'audio_data' in JSON body."));
        }

        // --- 👇 NEW CODE STARTS HERE 👇 ---
        String base64Data = payload.get("audio_data");

        System.out.println("👀 VERIFICATION:");
        System.out.println("   1. Received Data Size: " + base64Data.length() + " chars");

        // Only print the first 20 characters (so we don't crash the console)
        if (base64Data.length() > 20) {
            System.out.println("   2. Preview: " + base64Data.substring(0, 20) + "...");
        }
        // --- 👆 NEW CODE ENDS HERE 👆 ---

        // 3. FORWARD TO PYTHON
        try {
            RestTemplate restTemplate = new RestTemplate();
            System.out.println("🚀 Forwarding to Python AI...");

            Map<String, Object> pythonResponse = restTemplate.postForObject(PYTHON_API_URL, payload, Map.class);

            System.out.println("📥 Python Replied: " + pythonResponse);
            return ResponseEntity.ok(pythonResponse);

        } catch (Exception e) {
            // 4. FALLBACK
            System.out.println("⚠️ Python unreachable. Using Fallback.");

            Map<String, Object> fallback = new HashMap<>();
            fallback.put("status", "success");
            fallback.put("language", "Unknown");
            fallback.put("classification", "HUMAN");
            fallback.put("confidenceScore", 0.0);
            fallback.put("explanation", "System offline. Unable to analyze.");

            return ResponseEntity.ok(fallback);
        }
    }
}