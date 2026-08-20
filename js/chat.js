// 채팅. 왼쪽 목록 / 오른쪽 대화. 상대 메시지에만 프로필
const chatRoomListEl = document.querySelector("#chatRoomList");
const chatMessageAreaEl = document.querySelector("#chatMessageArea");
const chatSendForm = document.querySelector("#chatSendForm");
const chatInput = document.querySelector("#chatInput");
const chatMenuOverlay = document.querySelector("#chatMenuOverlay");
const chatMoreBtn = document.querySelector("#chatMoreBtn");

// 내 id, 열린 방, 전체 목록, 상대 프로필
let myUserId = null;
let currentRoomId = null;
let allChatList = [];
let partnerProfileImage = "";

// 로그인 토큰을 Authorization 헤더에 붙임
function authHeaders(extra = {}) {
    const token = localStorage.getItem("token");
    const headers = { ...extra };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

// 목록에 쓸 상대 시간
function formatTime(dateString) {
    if (!dateString) {
        return "";
    }

    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) {
        return "방금 전";
    }
    if (minutes < 60) {
        return `${minutes}분 전`;
    }
    if (hours < 24) {
        return `${hours}시간 전`;
    }
    if (days < 7) {
        return `${days}일 전`;
    }
    return `${Math.floor(days / 7)}주전`;
}

// 말풍선 옆 시각
function formatClock(dateString) {
    if (!dateString) {
        return "";
    }

    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const period = hours < 12 ? "오전" : "오후";
    const hour12 = hours % 12 || 12;

    return `${period} ${hour12}:${minutes}`;
}

// 가격 포맷
function formatPrice(price) {
    return `${Number(price).toLocaleString("ko-KR")}원`;
}

// 채팅방 한 줄. 클릭하면 그 방 열기
function createChatRoomItem(chat) {
    const li = document.createElement("li");
    li.className = "chat-room-item";
    li.dataset.roomId = chat.id;

    if (Number(chat.id) === Number(currentRoomId)) {
        li.classList.add("is-active");
    }

    const info = document.createElement("div");
    info.className = "chat-room-item-info";

    const top = document.createElement("div");
    top.className = "chat-room-item-top";

    const nickname = document.createElement("span");
    nickname.className = "chat-room-item-id";
    nickname.textContent = chat.nickname;

    const meta = document.createElement("span");
    meta.className = "chat-room-item-meta";
    meta.textContent = `${chat.location} · ${chat.time}`;

    top.append(nickname, meta);

    const preview = document.createElement("p");
    preview.className = "chat-room-item-preview";
    preview.textContent = chat.lastMessage;

    info.append(top, preview);

    const thumb = document.createElement("div");
    thumb.className = "chat-room-item-thumb";
    if (chat.thumbnail) {
        thumb.style.backgroundImage = `url("${chat.thumbnail}")`;
    }

    li.append(info);

    if (chat.unreadCount > 0) {
        const badge = document.createElement("span");
        badge.className = "chat-unread-badge";
        badge.textContent = chat.unreadCount;
        li.append(badge);
    }

    li.append(thumb);
    li.addEventListener("click", () => openChatRoom(chat.id));
    return li;
}

// 채팅 목록 그리기. 안읽음만 보기면 필터
function renderChatList() {
    const unreadOnly = document.querySelector("#unreadToggle").checked;
    const visibleList = unreadOnly
        ? allChatList.filter((chat) => chat.unreadCount > 0)
        : allChatList;

    chatRoomListEl.replaceChildren();
    visibleList.forEach((chat) => {
        chatRoomListEl.append(createChatRoomItem(chat));
    });
}

// 프로필 이미지 있는지
function hasProfileImage(url) {
    return Boolean(url) && url !== "string";
}

// 닉네임, 매너온도, 상품 정보, 상대 프로필 URL 채움
function renderRoomHeader(room) {
    document.querySelector(".chat-room-header-id").textContent = room.partner.nickname;
    document.querySelector(".chat-room-header-location").textContent = room.product.location || "";
    document.querySelector(".chat-product-title").textContent = room.product.title;
    document.querySelector(".chat-product-price").textContent = formatPrice(room.product.price);
    document.querySelector(".chat-product-status").textContent = room.product.statusLabel || "";

    const mannerTemp = room.product.seller?.mannerTemp;
    document.querySelector(".chat-manner-temp").textContent = mannerTemp ? `${mannerTemp}°C` : "";

    const thumb = document.querySelector(".chat-product-thumb");
    if (hasProfileImage(room.product.thumbnail)) {
        thumb.style.backgroundImage = `url("${room.product.thumbnail}")`;
    } else {
        thumb.style.backgroundImage = "";
    }

    partnerProfileImage = room.partner.profileImage || "";
}

// 상대 동그란 프로필. 이어서 온 메시지는 자리만 비움
function createPartnerAvatar(grouped) {
    const avatar = document.createElement("div");
    avatar.className = "chat-message-avatar";

    if (grouped) {
        avatar.classList.add("is-hidden");
        return avatar;
    }

    if (hasProfileImage(partnerProfileImage)) {
        avatar.style.backgroundImage = `url("${partnerProfileImage}")`;
        return avatar;
    }

    const img = document.createElement("img");
    img.src = "../images/profile.svg";
    img.alt = "";
    avatar.append(img);
    return avatar;
}

// 말풍선. 내 메시지는 오른쪽, 상대는 왼쪽+프로필
function createMessageEl(message, grouped = false) {
    const isMine = Number(message.senderId) === Number(myUserId);
    const wrap = document.createElement("div");
    wrap.className = isMine ? "chat-message chat-message-sent" : "chat-message chat-message-received";

    if (grouped) {
        wrap.classList.add("is-grouped");
    }

    const bubble = document.createElement("p");
    bubble.className = "chat-message-bubble";
    bubble.textContent = message.content;

    const time = document.createElement("span");
    time.className = "chat-message-time";
    time.textContent = formatClock(message.createdAt);

    if (isMine) {
        wrap.append(time, bubble);
        return wrap;
    }

    wrap.append(createPartnerAvatar(grouped), bubble, time);
    return wrap;
}

// 메시지 목록 그리기
function renderMessages(messages) {
    chatMessageAreaEl.replaceChildren();
    messages.forEach((message, index) => {
        const prev = messages[index - 1];
        const grouped = Boolean(prev) && Number(prev.senderId) === Number(message.senderId);
        chatMessageAreaEl.append(createMessageEl(message, grouped));
    });
    chatMessageAreaEl.scrollTop = chatMessageAreaEl.scrollHeight;
}

// 내 닉네임을 목록 위에 표시하려고 조회
async function fetchMe() {
    const response = await fetch("/api/auth/me", {
        headers: authHeaders(),
    });

    if (!response.ok) {
        return;
    }

    const data = await response.json();
    myUserId = data.user.id;
    document.querySelector(".chat-info-id").textContent = data.user.nickname;
}

// 채팅 목록 조회
async function fetchChatList() {
    const response = await fetch("/api/chats", {
        method: "GET",
        headers: authHeaders(),
    });

    if (!response.ok) {
        throw new Error(`채팅 목록 요청 실패: ${response.status}`);
    }

    const data = await response.json();

    allChatList = data.items.map((room) => ({
        id: room.id,
        nickname: room.partner.nickname,
        location: room.product.location,
        time: formatTime(room.lastMessageAt),
        lastMessage: room.lastMessage ? room.lastMessage.content : "",
        thumbnail: room.product.thumbnail,
        unreadCount: room.unreadCount || 0,
    }));

    renderChatList();
}

// 방 상세 + 메시지를 같이 불러와서 대화 화면 채움
async function openChatRoom(roomId) {
    currentRoomId = roomId;

    const [roomResponse, messagesResponse] = await Promise.all([
        fetch(`/api/chats/${roomId}`, {
            headers: authHeaders(),
        }),
        fetch(`/api/chats/${roomId}/messages`, {
            headers: authHeaders(),
        }),
    ]);

    if (!roomResponse.ok) {
        const data = await roomResponse.json();
        alert(data.message || "채팅방을 불러오지 못했습니다.");
        return;
    }

    const roomData = await roomResponse.json();
    renderRoomHeader(roomData.room);

    if (messagesResponse.ok) {
        const messageData = await messagesResponse.json();
        renderMessages(messageData.items);
    }

    document.querySelectorAll(".chat-room-item").forEach((item) => {
        item.classList.toggle("is-active", Number(item.dataset.roomId) === Number(roomId));
    });

    // 모바일에서 대화 화면 열기
    document.querySelector(".chat-content").classList.add("is-room-open");

    await fetchChatList();
}

// 채팅방 화면 비우기
function clearRoomView() {
    currentRoomId = null;
    partnerProfileImage = "";
    document.querySelector(".chat-room-header-id").textContent = "";
    document.querySelector(".chat-room-header-location").textContent = "";
    document.querySelector(".chat-manner-temp").textContent = "";
    document.querySelector(".chat-product-title").textContent = "";
    document.querySelector(".chat-product-price").textContent = "";
    document.querySelector(".chat-product-status").textContent = "";
    document.querySelector(".chat-product-thumb").style.backgroundImage = "";
    chatMessageAreaEl.replaceChildren();
    closeChatMenu();
}

// DELETE로 방 나간 뒤 목록으로
async function leaveChatRoom() {
    if (!currentRoomId) {
        alert("나갈 채팅방을 먼저 선택해주세요.");
        return;
    }

    const confirmed = confirm("채팅방에서 나가시겠습니까?");
    if (!confirmed) {
        return;
    }

    const roomId = currentRoomId;
    const response = await fetch(`/api/chats/${roomId}`, {
        method: "DELETE",
        headers: authHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.message || "채팅방 나가기에 실패했습니다.");
        return;
    }

    clearRoomView();
    // 모바일에서 목록으로
    document.querySelector(".chat-content").classList.remove("is-room-open");
    await fetchChatList();
}

// 메시지 보내기
async function sendMessage(content) {
    if (!currentRoomId) {
        alert("채팅방을 먼저 선택해주세요.");
        return;
    }

    const response = await fetch(`/api/chats/${currentRoomId}/messages`, {
        method: "POST",
        headers: authHeaders({
            "Content-Type": "application/json",
        }),
        body: JSON.stringify({ content }),
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.message || "메시지를 보내지 못했습니다.");
        return;
    }

    const last = chatMessageAreaEl.lastElementChild;
    const grouped = Boolean(last) && last.classList.contains("chat-message-sent");
    chatMessageAreaEl.append(createMessageEl(data.message, grouped));
    chatMessageAreaEl.scrollTop = chatMessageAreaEl.scrollHeight;
    await fetchChatList();
}

// 메시지 전송
chatSendForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const content = chatInput.value.trim();
    if (!content) {
        return;
    }

    chatInput.value = "";

    try {
        await sendMessage(content);
    } catch (error) {
        console.error(error);
    }
});

// ... 누르면 나가기만 있는 하단 메뉴
function openChatMenu() {
    chatMenuOverlay.classList.add("is-open");
    chatMoreBtn.setAttribute("aria-expanded", "true");
}

function closeChatMenu() {
    chatMenuOverlay.classList.remove("is-open");
    chatMoreBtn.setAttribute("aria-expanded", "false");
}

chatMoreBtn.addEventListener("click", openChatMenu);

document.querySelector("#chatMenuClose").addEventListener("click", closeChatMenu);

chatMenuOverlay.addEventListener("click", (event) => {
    if (event.target === chatMenuOverlay) {
        closeChatMenu();
    }
});

// 채팅방 나가기
document.querySelector("#chatLeaveBtn").addEventListener("click", async () => {
    closeChatMenu();
    try {
        await leaveChatRoom();
    } catch (error) {
        console.error(error);
    }
});

// 목록으로
document.querySelector("#chatBackBtn").addEventListener("click", () => {
    closeChatMenu();
    document.querySelector(".chat-content").classList.remove("is-room-open");
});

// 읽지 않은 채팅
document.querySelector("#unreadToggle").addEventListener("change", () => {
    renderChatList();
});

// 시작
async function initChat() {
    try {
        await fetchMe();
        await fetchChatList();

        // 주소에 ?id= 있으면 그 방 열기
        const roomId = new URLSearchParams(window.location.search).get("id");
        if (roomId) {
            await openChatRoom(roomId);
        }
    } catch (error) {
        console.error(error);
    }
}

initChat();
