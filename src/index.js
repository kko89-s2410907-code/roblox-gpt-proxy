require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// 큐 같은 게 필요하면 queue.js에서 불러오기 가능
// const { enqueue } = require("./queue");

app.post("/gpt", async (req, res) => {
    try {
        const { message, userId } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        // OpenAI API 호출
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo", // GPT 모델 (원하면 gpt-4로 변경 가능)
                messages: [
                    { role: "system", content: "너는 로블록스 게임 속 NPC 친구야. 플레이어랑 대화하듯 친근하게 답해." },
                    { role: "user", content: message }
                ],
                max_tokens: 100,
                temperature: 0.8
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
                }
            }
        );

        const reply = response.data.choices[0].message.content.trim();
        res.json({ reply });

    } catch (error) {
        console.error("GPT 요청 실패:", error.response?.data || error.message);
        res.status(500).json({ error: "GPT API 요청 중 오류 발생" });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

