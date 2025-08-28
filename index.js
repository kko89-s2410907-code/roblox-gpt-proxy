// 아주 간단한 프록시 서버 (Node 18 이상 가정: fetch 내장)
const express = require("express");
const app = express();

app.use(express.json());

// 서버 살아있는지 건강 체크용
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Roblox가 호출할 엔드포인트
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body?.message || "";
    if (!userMessage) {
      return res.status(400).json({ error: "message required" });
    }

    // OpenAI Chat Completions 호출
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, // Render에 넣을 환경변수
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: userMessage }]
      })
    });

    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content || "(no reply)";
    res.json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Proxy running on " + PORT));
