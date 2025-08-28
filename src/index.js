// src/index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { addToQueue } = require("./queue");

const app = express();
app.use(cors());
app.use(express.json());

// 헬스체크
app.get("/health", (req, res) => res.status(200).send("OK"));
app.get("/", (req, res) => res.send("ok"));

function pickTextFromOpenAI(data) {
  try {
    if (data && data.choices && data.choices[0]) {
      const msg = data.choices[0].message || data.choices[0].delta;
      if (msg && msg.content) return msg.content;
    }
  } catch (_) {}
  return "응답 없음";
}

async function callOpenAI({ message, userId }) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not set");
  }

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a friendly NPC in a Roblox game. Answer briefly (<= 60 chars)."
        },
        { role: "user", content: message }
      ],
      user: String(userId || "anonymous"),
      temperature: 0.7
    })
  });

  const data = await resp.json();
  if (!resp.ok) {
    const msg = data?.error?.message || resp.statusText;
    const err = new Error(`OpenAI error: ${msg}`);
    err.status = resp.status;
    throw err;
  }
  return pickTextFromOpenAI(data);
}

app.post("/chat", async (req, res) => {
  try {
    const { message, userId } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }

    // 큐로 직렬 처리
    const reply = await addToQueue({ message, userId }, callOpenAI);
    res.json({ reply });
  } catch (err) {
    console.error("POST /chat failed:", err);
    res.status(err.status || 500).json({ error: err.message || "server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
