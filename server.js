import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 5173);
const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-pro";
const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

async function handleExplain(req, res) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const body = JSON.parse(await readBody(req) || "{}");

  if (!apiKey) {
    sendJson(res, 200, {
      provider: "fallback",
      model,
      explanation: body.fallbackExplanation || "",
      note: "AI API key is not set; using local rule explanation."
    });
    return;
  }

  const language = body.language || "ja";
  const candidates = Array.isArray(body.candidates) ? body.candidates.slice(0, 5) : [];
  const prompt = [
    "You are a wine recommendation explainer for a structured product catalog.",
    "The ranking is already decided by deterministic rules. Do not recommend products outside the provided candidates.",
    "Explain why the top recommendation fits the user, compare it briefly with the alternates, and mention any caveat.",
    "Return concise, natural language only. Do not invent facts, stock status, discounts, awards, or flavors.",
    `Response language: ${language}.`,
    "",
    `User request: ${body.userText || ""}`,
    `Rule signals: ${JSON.stringify(body.signals || {})}`,
    `Candidates: ${JSON.stringify(candidates)}`
  ].join("\n");

  const upstream = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You explain catalog-grounded wine recommendations." },
        { role: "user", content: prompt }
      ],
      thinking: { type: "enabled" },
      reasoning_effort: "medium",
      stream: false
    })
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    sendJson(res, upstream.status, { error: "AI request failed", detail: text });
    return;
  }

  const data = await upstream.json();
  sendJson(res, 200, {
    provider: "ai",
    model,
    explanation: data?.choices?.[0]?.message?.content || ""
  });
}

async function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  const requested = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = path.normalize(path.join(__dirname, requested));

  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/explain") {
      await handleExplain(req, res);
      return;
    }
    if (req.method === "GET") {
      await serveStatic(req, res);
      return;
    }
    res.writeHead(405);
    res.end("Method not allowed");
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
});

server.listen(port, () => {
  console.log(`WineGPT running at http://localhost:${port}`);
  console.log(`AI model: ${model}`);
});
