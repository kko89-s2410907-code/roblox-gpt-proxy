import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import OpenAI from "openai";
import { addToQueue } from "./queue.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🔹 유저별 대화 저장용 (간단히 메모리 버전, 필요하면 DB로 확장 가능)
const conversations = {};

app.post("/gpt", async (req, res) => {
  try {
    const { userId, message } = req.body;  // ✅ userId 꼭 보내야 함 (플레이어 ID 등)
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // 유저별 대화 배열 초기화
    if (!conversations[userId]) {
      conversations[userId] = [
        { role: "system", content: "너는 학교 친구 역할의 NPC야. 친근하고 간단하게 대답해." }
      ];
    }

    // 새 메시지 추가
    conversations[userId].push({ role: "user", content: message });

    // GPT 호출
    const response = await addToQueue(() =>
      client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: conversations[userId],  // 대화 전체를 넘김
      })
    );

    const aiMessage = response.choices[0].message.content;

    // AI 응답도 대화 기록에 추가
    conversations[userId].push({ role: "assistant", content: aiMessage });

    res.json({ reply: aiMessage });
  } catch (error) {
    console.error("OpenAI API Error:", error.message);
    res.status(500).json({ error: "Failed to fetch response from OpenAI" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
