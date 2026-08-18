// 토큰 헤더
function authHeaders(extra = {}) {
    const token = localStorage.getItem("token");
    const headers = { ...extra };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

// 가입일 포맷
function formatJoinDate(dateString) {
    if (!dateString) {
        return "";
    }

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}년 ${month}월 ${day}일 가입`;
}

// 내 정보 표시
function renderUser(user) {
    const avatar = document.getElementById("profileImage");
    const hasImage = user.profileImage && user.profileImage !== "string";

    if (hasImage) {
        avatar.style.backgroundImage = `url("${user.profileImage}")`;
    } else {
        avatar.style.backgroundImage = "";
    }

    document.getElementById("nickname").textContent = user.nickname || "";
    document.getElementById("email").textContent = user.email || "";
    document.getElementById("location").textContent = user.location || "";
    document.getElementById("createdAt").textContent = formatJoinDate(user.createdAt);

    document.getElementById("nicknameInput").value = user.nickname || "";
    document.getElementById("locationInput").value = user.location || "";
    document.getElementById("profileImageInput").value = hasImage ? user.profileImage : "";
}

// 내 정보 조회
async function fetchMe() {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("로그인이 필요합니다.");
        location.href = "./login.html";
        return;
    }

    const response = await fetch("/api/auth/me", {
        headers: authHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.message || "회원 정보를 불러오지 못했습니다.");
        location.href = "./login.html";
        return;
    }

    renderUser(data.user);
}

// 정보 수정
async function updateMe(userData) {
    const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: authHeaders({
            "Content-Type": "application/json",
        }),
        body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.message || "정보 수정에 실패했습니다.");
        return;
    }

    renderUser(data.user);
    alert("정보가 수정되었습니다.");
}

document.getElementById("mypageForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const nickname = document.getElementById("nicknameInput").value.trim();
    const location = document.getElementById("locationInput").value.trim();
    const profileImage = document.getElementById("profileImageInput").value.trim();

    await updateMe({
        nickname,
        location,
        profileImage: profileImage || null,
    });
});

fetchMe().catch(console.error);
