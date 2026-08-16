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
// 상품 목록 요청
// ================================
app.get("/api/products", async (req, res) => {
    try {
        console.log("===== GET PRODUCTS =====")

        const response = await fetch(`${API_BASE}/api/products`, {
            method: "GET",
            headers: {
                "X-API-Key": API_KEY
            },
        });

        const text = await response.text();
        console.log("status:", response.status);
        console.log("response:", text);

        res.status(response.status).send(text);
    } catch (error) {
        console.error("상품 검색정보 API 요청 실패", error.message);
        
        res.status(500).json({
            error: "검색 결과를 가져오지 못했습니다."
        })
    }
        });

app.listen(PORT, () => {
    console.log(`🚀 http://localhost:${PORT}`);
});