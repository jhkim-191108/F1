// 회원가입. 닉네임 필수, 아이디 칸 값은 API email로 전송
const registerForm = document.querySelector("#registerForm");

// 회원가입 제출
registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const userId = document.querySelector("#userId").value.trim();
    const nickname = document.querySelector("#nickname").value.trim();
    const password = document.querySelector("#password").value;
    const passwordConfirm = document.querySelector("#passwordConfirm").value;

    if (!nickname) {
        alert("닉네임을 입력해주세요.");
        return;
    }

    if (password !== passwordConfirm) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
    }

    await signupUser({
        email: userId,
        password,
        nickname
    });
});

// POST /api/auth/signup
async function signupUser(userData) {
    try {
        const response = await fetch("/api/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "회원가입에 실패했습니다.");
            return;
        }

        // 가입만 하고 토큰은 저장하지 않음. 로그인 페이지에서 직접 로그인
        alert("회원가입이 완료되었습니다.");
        location.href = "./login.html";
    } catch (error) {
        console.error("회원가입 요청 실패:", error);
        alert("서버와 통신할 수 없습니다.");
    }
}
