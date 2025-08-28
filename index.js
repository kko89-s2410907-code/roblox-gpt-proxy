const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(express.json());

// 헬스체크 (Render 정상 동작 확인용)
app.get("/health", (req, res) => {
  res.send("OK");
});

// GPT API 프록시
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: userMessage }]
      })
    });

    const data = await response.json();

    // Roblox가 쉽게 읽도록 reply만 전달
    const gptReply = data.choices?.[0]?.message?.content || "응답 없음";
    res.json({ reply: gptReply });

  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Render가 사용하는 포트
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

