const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(express.json());

// 헬스체크
app.get("/health", (req, res) => {
  res.send("OK");
});

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    // OpenAI API 호출
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // 안정적인 모델로 변경
        messages: [{ role: "user", content: userMessage }]
      })
    });

    const data = await response.json();

    // 🔎 Render 로그에서 응답 확인용
    console.log("🔎 OpenAI 응답:", JSON.stringify(data, null, 2));

    // 응답 메시지 꺼내기
    if (data.choices && data.choices[0] && data.choices[0].message) {
      res.json({ reply: data.choices[0].message.content });
    } else {
      res.json({ reply: "응답 없음" });
    }

  } catch (error) {
    console.error("❌ 서버 에러:", error.message);
    res.status(500).send({ error: error.message });
  }
});

// Render가 지정하는 PORT 사용
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
