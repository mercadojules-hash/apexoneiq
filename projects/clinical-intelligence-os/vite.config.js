import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const ELEVENLABS_STREAM_URL = "https://api.elevenlabs.io/v1/text-to-speech";

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 24000) {
        reject(new Error("Voice request is too large."));
        req.destroy();
      }
    });

    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function elevenLabsVoiceProxy(configuredApiKey) {
  const handleVoiceRequest = async (req, res) => {
    if (req.method === "GET") {
      sendJson(res, 200, { configured: Boolean(configuredApiKey || process.env.ELEVENLABS_API_KEY) });
      return;
    }

    if (req.method !== "POST") {
      sendJson(res, 405, { error: "Method not allowed." });
      return;
    }

    const apiKey = configuredApiKey || process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      sendJson(res, 503, { error: "Missing ELEVENLABS_API_KEY." });
      return;
    }

    try {
      const { text, voiceId, modelId = "eleven_multilingual_v2" } = await readJsonBody(req);

      if (!text || !voiceId) {
        sendJson(res, 400, { error: "Text and voiceId are required." });
        return;
      }

      const upstream = await fetch(
        `${ELEVENLABS_STREAM_URL}/${encodeURIComponent(voiceId)}/stream?output_format=mp3_44100_128&optimize_streaming_latency=2`,
        {
          method: "POST",
          headers: {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": apiKey
          },
          body: JSON.stringify({
            text,
            model_id: modelId,
            voice_settings: {
              stability: 0.62,
              similarity_boost: 0.82,
              style: 0.18,
              use_speaker_boost: true
            }
          })
        }
      );

      if (!upstream.ok) {
        const message = await upstream.text();
        sendJson(res, upstream.status, { error: message || "ElevenLabs request failed." });
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", upstream.headers.get("content-type") || "audio/mpeg");
      res.setHeader("Cache-Control", "private, max-age=3600");

      if (upstream.body) {
        const reader = upstream.body.getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(Buffer.from(value));
        }
      }

      res.end();
    } catch (error) {
      sendJson(res, 500, { error: error.message || "Voice generation failed." });
    }
  };

  return {
    name: "clinical-elevenlabs-voice-proxy",
    configureServer(server) {
      server.middlewares.use("/api/voice/elevenlabs", handleVoiceRequest);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/voice/elevenlabs", handleVoiceRequest);
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), elevenLabsVoiceProxy(env.ELEVENLABS_API_KEY)]
  };
});
