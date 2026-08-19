const express = require("express");
require("dotenv").config();

const app = express();
const PORT = 3000;

const API_KEY = process.env.API_KEY;
const API_BASE = "https://carrot.techfree.kr";

// 이미지 업로드
// 이미지 업로드
app.post("/api/images", async (req, res) => {
  try {
    const headers = { "X-API-Key": API_KEY };
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }
    if (req.headers["content-type"]) {
      headers["Content-Type"] = req.headers["content-type"];
    }

    const response = await fetch(`${API_BASE}/api/images`, {
      method: "POST",
      headers,
      body: req,
      duplex: "half",
    });

    const text = await response.text();
    console.log("이미지 업로드:", response.status, text);
    res.status(response.status).send(text);
  } catch (error) {
    console.error("이미지 업로드 실패:", error);
    res.status(500).json({ error: "이미지 업로드에 실패했습니다." });
  }
});

app.use(express.json());
app.use("/html", express.static("html"));
app.use("/css", express.static("css"));
app.use("/js", express.static("js"));
app.use("/images", express.static("images"));

// API 전달
async function proxyToApi(req, res, path) {
  try {
    const headers = {
      "X-API-Key": API_KEY,
    };

    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    const options = {
      method: req.method,
      headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(`${API_BASE}${path}`, options);
    const text = await response.text();

    console.log(req.method, path, response.status);
    console.log("response:", text);

    res.status(response.status).send(text);
  } catch (error) {
    console.error("API 요청 실패:", path, error);

    res.status(500).json({
      error: "서버에서 API 요청에 실패했습니다.",
    });
  }
}

// 회원가입
app.post("/api/auth/signup", async (req, res) => {
  try {
    console.log("request:", req.body);

    const response = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();

    console.log("status:", response.status);
    console.log("response:", text);

    res.status(response.status).send(text);
  } catch (error) {
    console.error("회원가입 API 요청 실패:", error);

    res.status(500).json({
      error: "회원가입 요청에 실패했습니다.",
    });
  }
});

// 로그인
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("request:", req.body);

    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();

    console.log("status:", response.status);
    console.log("response:", text);

    res.status(response.status).send(text);
  } catch (error) {
    console.error("로그인 API 요청 실패:", error);

    res.status(500).json({
      error: "로그인 요청에 실패했습니다.",
    });
  }
});

// 내 정보 조회
app.get("/api/auth/me", (req, res) => {
  proxyToApi(req, res, "/api/auth/me");
});

// 내 정보 수정
app.patch("/api/auth/me", (req, res) => {
  proxyToApi(req, res, "/api/auth/me");
});

// 채팅 목록
app.get("/api/chats", async (req, res) => {
  try {
    const headers = {
      "X-API-Key": API_KEY,
      Accept: "application/json",
    };

    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    const response = await fetch(`${API_BASE}/api/chats`, {
      method: "GET",
      headers,
    });

    const text = await response.text();

    console.log("status:", response.status);
    console.log("response:", text);

    res.status(response.status).send(text);
  } catch (error) {
    console.error("채팅 목록 API 요청 실패:", error);

    res.status(500).json({
      error: "채팅 목록을 가져오지 못했습니다.",
    });
  }
});

// 채팅방 만들기
app.post("/api/chats", (req, res) => {
  proxyToApi(req, res, "/api/chats");
});

// 메시지 조회
app.get("/api/chats/:id/messages", (req, res) => {
  proxyToApi(req, res, `/api/chats/${req.params.id}/messages`);
});

// 메시지 보내기
app.post("/api/chats/:id/messages", (req, res) => {
  proxyToApi(req, res, `/api/chats/${req.params.id}/messages`);
});

// 채팅방 상세
app.get("/api/chats/:id", (req, res) => {
  proxyToApi(req, res, `/api/chats/${req.params.id}`);
});

// 채팅방 나가기
app.delete("/api/chats/:id", (req, res) => {
  proxyToApi(req, res, `/api/chats/${req.params.id}`);
});

// 상품 목록
app.get("/api/products", (req, res) => {
  proxyToApi(req, res, "/api/products");
});

// 상품 상세
app.get("/api/products/:id", (req, res) => {
  proxyToApi(req, res, `/api/products/${req.params.id}`);
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});

// 상품 등록
app.post("/api/products", (req, res) => {
  proxyToApi(req, res, "/api/products");
});

// 상품 수정
app.patch("/api/products/:id", (req, res) => {
  proxyToApi(req, res, `/api/products/${req.params.id}`);
});

// 상품 삭제
app.delete("/api/products/:id", (req, res) => {
  proxyToApi(req, res, `/api/products/${req.params.id}`);
});
