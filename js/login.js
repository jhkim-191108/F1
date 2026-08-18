const loginForm = document.querySelector("#loginForm");

// 로그인
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const userId = document.querySelector("#userId").value.trim();
    const password = document.querySelector("#password").value;

    await loginUser({
        email: userId,
        password
    });
});

async function loginUser(userData) {
    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        console.log("로그인 응답:", data);

        if (!response.ok) {
            alert(data.message || "로그인에 실패했습니다.");
            return;
        }

        localStorage.setItem("token", data.token);
        alert("로그인되었습니다.");
        location.href = "./chat.html";
    } catch (error) {
        console.error("로그인 요청 실패:", error);
        alert("서버와 통신할 수 없습니다.");
    }
}
