import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadDotEnv(filePath) {
  let content;

  try {
    content = await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      return;
    }
    throw error;
  }

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);

    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;

    if (Object.hasOwn(process.env, key)) {
      continue;
    }

    let value = rawValue.trim();

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

await loadDotEnv(path.join(__dirname, ".env"));

const port = Number(process.env.PORT || 5173);
const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
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

function extractJson(text) {
  const value = String(text || "").trim();

  if (!value) {
    throw new Error("Empty AI response");
  }

  try {
    return JSON.parse(value);
  } catch {
    const fenced = value.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) {
      return JSON.parse(fenced[1].trim());
    }

    const start = value.indexOf("{");
    const end = value.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(value.slice(start, end + 1));
    }

    throw new Error("AI response did not contain JSON");
  }
}

function normalizeRecommendations(payload, candidates, fallbackIds = []) {
  const availableIds = new Set(candidates.map(candidate => String(candidate.id)));
  const targetCount = Math.min(3, candidates.length);
  const items = Array.isArray(payload?.recommendations)
    ? payload.recommendations
    : Array.isArray(payload?.ids)
      ? payload.ids.map(id => ({ id }))
      : [];
  const recommendations = [];
  const seen = new Set();

  for (const item of items) {
    const id = String(item?.id || item?.productId || "").trim();

    if (!availableIds.has(id) || seen.has(id)) {
      continue;
    }

    seen.add(id);
    recommendations.push({
      id,
      reason: String(item?.reason || "").trim()
    });

    if (recommendations.length === targetCount) {
      break;
    }
  }

  for (const fallbackId of fallbackIds) {
    const id = String(fallbackId || "").trim();

    if (!availableIds.has(id) || seen.has(id) || recommendations.length === targetCount) {
      continue;
    }

    seen.add(id);
    recommendations.push({ id, reason: "" });
  }

  return {
    recommendations,
    explanation: String(payload?.explanation || "").trim()
  };
}

async function handleRecommend(req, res) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const body = JSON.parse(await readBody(req) || "{}");
  const candidates = Array.isArray(body.candidates) ? body.candidates.slice(0, 80) : [];
  const fallbackIds = Array.isArray(body.fallbackIds) ? body.fallbackIds.slice(0, 3) : [];

  if (!apiKey) {
    sendJson(res, 200, {
      provider: "fallback",
      model,
      recommendations: fallbackIds.map(id => ({ id: String(id), reason: "" })),
      explanation: body.fallbackExplanation || "",
      note: "AI API key is not set; using local fallback recommendation."
    });
    return;
  }

  const language = body.language || "ja";

  if (!candidates.length) {
    sendJson(res, 200, {
      provider: "fallback",
      model,
      recommendations: [],
      explanation: body.fallbackExplanation || ""
    });
    return;
  }

  const prompt = [
    "You are a wine recommendation engine for a structured product list.",
    "Select the best 3 products from the provided candidates for the user's request.",
    "Use only the provided candidate IDs. Do not invent products, IDs, facts, stock status, discounts, awards, or flavors.",
    "Respect the UI filters as hard constraints; the candidate list has already been filtered by them.",
    "Return JSON only, with this exact shape:",
    "{\"recommendations\":[{\"id\":\"candidate id\",\"reason\":\"2-3 sentence recommendation reason\"}],\"explanation\":\"brief overall explanation\"}",
    "The recommendations array must contain unique IDs and should have 3 items unless fewer candidates are provided.",
    "For each product reason, write 2-3 natural sentences. Explain why it fits the user's request, mention a concrete pairing or drinking context when supported by candidate data, and include one small caveat or comparison when useful.",
    "The overall explanation should be 2-4 sentences comparing the three picks at a high level.",
    `Response language: ${language}.`,
    "",
    `User request: ${body.userText || ""}`,
    `UI filters: ${JSON.stringify(body.filters || {})}`,
    `Parsed request signals: ${JSON.stringify(body.signals || {})}`,
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
        { role: "system", content: "You select wine recommendations and return JSON only." },
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
  const content = data?.choices?.[0]?.message?.content || "";
  let result;
  let provider = "ai";

  try {
    result = normalizeRecommendations(extractJson(content), candidates, fallbackIds);
  } catch {
    provider = "fallback";
    result = {
      recommendations: fallbackIds.map(id => ({ id: String(id), reason: "" })),
      explanation: body.fallbackExplanation || ""
    };
  }

  sendJson(res, 200, {
    provider,
    model,
    recommendations: result.recommendations,
    explanation: result.explanation || body.fallbackExplanation || ""
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
    if (req.method === "POST" && req.url === "/api/recommend") {
      await handleRecommend(req, res);
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
