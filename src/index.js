require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// health check
app.get("/", (_, res) => res.send("ok"));
app.get("/health", (_, res) => res.status(200).send("OK"));

async function askOpenAI({ message, userId }) {
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "너는 Roblox 속 NPC야. 짧고 친근하게 대답해." },
        { role: "user", content: message }
      ],
      user: String(userId)
    })
  });

  const data = await resp.json();
  if (!resp.ok) throw new Error(data?.error?.message || resp.statusText);

  return data?.choices?.[0]?.message?.content || "응답 없음";
}

app.post("/chat", async (req, res) => {
  try {
    const { message, userId } = req.body;
    if (!message) return res.status(400).json({ error: "message required" });

    const reply = await askOpenAI({ message, userId });
    return res.json({ reply });
  } catch (err) {
    console.error("GPT 요청 실패:", err.message);
    res.status(500).json({ error: "GPT 요청 실패" });
  }
});

app.listen(PORT, () => console.log("Server running on", PORT));

