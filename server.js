const express = require("express");
require("dotenv").config();

const app = express();
const PORT = 3000;

const API_KEY = process.env.API_KEY;
const API_BASE = "https://carrot.techfree.kr";

app.use(express.json());
app.use("/html", express.static("html"));
app.use("/css", express.static("css"));
app.use("/js", express.static("js"));
app.use("/images", express.static("images"));


// ================================
// 회원가입
// ================================
app.post("/api/auth/signup", async (req, res) => {
    console.log("🔥🔥🔥 SIGNUP ROUTE 들어옴");
    try {
        console.log("===== SIGNUP =====");
        console.log("request:", req.body);

        const response = await fetch(`${API_BASE}/api/auth/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": API_KEY
            },
            body: JSON.stringify(req.body)
        });

        const text = await response.text();

        console.log("status:", response.status);
        console.log("response:", text);

        res.status(response.status).send(text);

    } catch (error) {
        console.error("회원가입 API 요청 실패:", error);

        res.status(500).json({
            error: "회원가입 요청에 실패했습니다."
        });
    }
});


// ================================
// 로그인
// ================================
app.post("/api/auth/login", async (req, res) => {
    try {
        console.log("===== LOGIN =====");
        console.log("request:", req.body);

        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": API_KEY
            },
            body: JSON.stringify(req.body)
        });

        const text = await response.text();

        console.log("status:", response.status);
        console.log("response:", text);

        res.status(response.status).send(text);

    } catch (error) {
        console.error("로그인 API 요청 실패:", error);

        res.status(500).json({
            error: "로그인 요청에 실패했습니다."
        });
    }
});


// ================================
// 채팅 목록
// ================================
app.get("/api/chats", async (req, res) => {
    try {
        console.log("===== GET CHATS =====");

        const headers = {
            "X-API-Key": API_KEY,
            "Accept": "application/json"
        };

        // 브라우저에서 받은 Authorization 전달
        if (req.headers.authorization) {
            headers.Authorization = req.headers.authorization;
        }

        const response = await fetch(`${API_BASE}/api/chats`, {
            method: "GET",
            headers
        });

        const text = await response.text();

        console.log("status:", response.status);
        console.log("response:", text);

        res.status(response.status).send(text);

    } catch (error) {
        console.error("채팅 목록 API 요청 실패:", error);

        res.status(500).json({
            error: "채팅 목록을 가져오지 못했습니다."
        });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 http://localhost:${PORT}`);
});