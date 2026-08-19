// 로컬 Express. 당근 API로 넘기고 html/css/js를 제공. 페이지는 localhost:3000으로 열기
const express = require("express");
require("dotenv").config();

const app = express();
const PORT = 3000;

const API_KEY = process.env.API_KEY;
const API_BASE = "https://carrot.techfree.kr";

// 이미지 업로드. 파일을 그대로 넘겨야 해서 json 파서보다 앞에 둠
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
    res.status(response.status).send(text);
  } catch (error) {
    console.error("이미지 업로드 실패:", error);
    res.status(500).json({ error: "이미지 업로드에 실패했습니다." });
  }
});

// json 본문 파싱 (이미지 업로드 이후)
app.use(express.json());

/* html, css, js, 이미지 파일 제공 */
app.use("/html", express.static("html"));
app.use("/css", express.static("css"));
app.use("/js", express.static("js"));
app.use("/images", express.static("images"));

// 프론트 요청을 당근 API로 전달. API_KEY + 로그인 토큰 포함
async function proxyToApi(req, res, path) {
  try {
    const headers = {
      "X-API-Key": API_KEY,
    };

    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    const options = {
      method: (req.method || "GET").toUpperCase(),
      headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(`${API_BASE}${path}`, options);
    const text = await response.text();

    res.status(response.status).send(text);
  } catch (error) {
    console.error("API 요청 실패:", path, error);

    res.status(500).json({
      error: "서버에서 API 요청에 실패했습니다.",
    });
  }
}

// 회원가입. register.js에서 사용
app.post("/api/auth/signup", (req, res) => {
  proxyToApi(req, res, "/api/auth/signup");
});

// 로그인. login.js에서 사용
app.post("/api/auth/login", (req, res) => {
  proxyToApi(req, res, "/api/auth/login");
});

// 내 정보 조회. 마이페이지, 채팅, 게시글 작성자 확인
app.get("/api/auth/me", (req, res) => {
  proxyToApi(req, res, "/api/auth/me");
});

// 내 정보 수정. 마이페이지
app.patch("/api/auth/me", (req, res) => {
  proxyToApi(req, res, "/api/auth/me");
});

// 채팅 목록. chat.js
app.get("/api/chats", (req, res) => {
  proxyToApi(req, res, "/api/chats");
});

// 채팅방 만들기. 상품 상세에서 채팅하기
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

// 채팅방 상세. 상대/상품 정보
app.get("/api/chats/:id", (req, res) => {
  proxyToApi(req, res, `/api/chats/${req.params.id}`);
});

// 채팅방 나가기
app.delete("/api/chats/:id", (req, res) => {
  proxyToApi(req, res, `/api/chats/${req.params.id}`);
});

// 상품 목록. 중고거래, 온보딩 인기매물
app.get("/api/products", (req, res) => {
  proxyToApi(req, res, "/api/products");
});

// 상품 상세. trade-post, 글 수정 시 기존 값 채우기
app.get("/api/products/:id", (req, res) => {
  proxyToApi(req, res, `/api/products/${req.params.id}`);
});

// 상품 수정. write.js에서 ?id= 있을 때
app.patch("/api/products/:id", (req, res) => {
  proxyToApi(req, res, `/api/products/${req.params.id}`);
});

// 상품 삭제. trade-post 삭제하기
app.delete("/api/products/:id", (req, res) => {
  proxyToApi(req, res, `/api/products/${req.params.id}`);
});

// 상품 등록. write.js 새 글
app.post("/api/products", (req, res) => {
  proxyToApi(req, res, "/api/products");
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
