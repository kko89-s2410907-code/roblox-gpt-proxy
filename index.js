const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000; // Render가 자동으로 포트 지정

app.use(cors());
app.use(bodyParser.json());

// 헬스체크 (확인용)
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// 채팅 API
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  // 여기에 GPT API 호출 코드 넣기 (테스트용은 그냥 echo)
  res.json({ reply: "서버에서 받은 메시지: " + message });
});

app.listen(PORT, () => {
  console.log("✅ Server running on port " + PORT);
});

