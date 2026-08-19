const chatRoomListEl = document.querySelector("#chatRoomList");
const chatMessageAreaEl = document.querySelector("#chatMessageArea");
const chatSendForm = document.querySelector("#chatSendForm");
const chatInput = document.querySelector("#chatInput");
const chatCreateBtn = document.querySelector("#chatCreateBtn");
const chatCreateModal = document.querySelector("#chatCreateModal");
const chatCreateForm = document.querySelector("#chatCreateForm");
const chatModalClose = document.querySelector("#chatModalClose");
const chatModalBackdrop = document.querySelector("#chatModalBackdrop");
const chatMannerTemp= document.querySelector("#chatMannerTemp")
let myUserId = null;
let currentRoomId = null;
let allChatList = [];

// 토큰 헤더
function authHeaders(extra = {}) {
    const token = localStorage.getItem("token");
    const headers = { ...extra };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

// 시간 포맷
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

// 메시지 시간
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

// 채팅 목록 아이템
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

// 채팅 목록 그리기
function renderChatList() {
    const unreadOnly = document.getElementById("unreadToggle").checked;
    const visibleList = unreadOnly
        ? allChatList.filter((chat) => chat.unreadCount > 0)
        : allChatList;

    chatRoomListEl.replaceChildren();
    visibleList.forEach((chat) => {
        chatRoomListEl.append(createChatRoomItem(chat));
    });
}

// 채팅방 헤더
function renderRoomHeader(room) {
    document.querySelector(".chat-room-header-id").textContent = room.partner.nickname;
    document.querySelector(".chat-product-title").textContent = room.product.title;
    document.querySelector(".chat-product-price").textContent = formatPrice(room.product.price);
    document.querySelector(".chat-product-status").textContent = room.product.statusLabel || "";
    document.querySelector(".chat-manner-temp").textContent = `${room.product.seller.mannerTemp}°C`;
    const thumb = document.querySelector(".chat-product-thumb");
    if (room.product.thumbnail) {
        thumb.style.backgroundImage = `url("${room.product.thumbnail}")`;
    } else {
        thumb.style.backgroundImage = "";
    }
}

// 메시지 말풍선
function createMessageEl(message) {
    const isMine = Number(message.senderId) === Number(myUserId);
    const wrap = document.createElement("div");
    wrap.className = isMine ? "chat-message chat-message-sent" : "chat-message chat-message-received";

    const bubble = document.createElement("p");
    bubble.className = "chat-message-bubble";
    bubble.textContent = message.content;

    const time = document.createElement("span");
    time.className = "chat-message-time";
    time.textContent = formatClock(message.createdAt);

    if (isMine) {
        wrap.append(time, bubble);
    } else {
        wrap.append(bubble, time);
    }

    return wrap;
}

// 메시지 목록 그리기
function renderMessages(messages) {
    chatMessageAreaEl.replaceChildren();
    messages.forEach((message) => {
        chatMessageAreaEl.append(createMessageEl(message));
    });
    chatMessageAreaEl.scrollTop = chatMessageAreaEl.scrollHeight;
}

// 내 정보 조회
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

// 채팅방 열기
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

    await fetchChatList();
}

// 채팅방 화면 비우기
function clearRoomView() {
    currentRoomId = null;
    document.querySelector(".chat-room-header-id").textContent = "";
    document.querySelector(".chat-product-title").textContent = "";
    document.querySelector(".chat-product-price").textContent = "";
    document.querySelector(".chat-product-status").textContent = "";
    document.querySelector(".chat-product-thumb").style.backgroundImage = "";
    chatMessageAreaEl.replaceChildren();
}

// 채팅방 나가기
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

    chatMessageAreaEl.append(createMessageEl(data.message));
    chatMessageAreaEl.scrollTop = chatMessageAreaEl.scrollHeight;
    await fetchChatList();
}

// 채팅방 만들기 모달
function openCreateModal() {
    chatCreateModal.classList.add("is-open");
    document.getElementById("createProductId").focus();
}

function closeCreateModal() {
    chatCreateModal.classList.remove("is-open");
    chatCreateForm.reset();
}

// 메시지 전송
chatSendForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const content = chatInput.value.trim();
    if (!content) {
        return;
    }

    chatInput.value = "";
    await sendMessage(content);
});

// 채팅방 나가기
document.getElementById("chatLeaveBtn").addEventListener("click", () => {
    leaveChatRoom().catch(console.error);
});

// 채팅방 만들기
chatCreateBtn.addEventListener("click", openCreateModal);
chatModalClose.addEventListener("click", closeCreateModal);
chatModalBackdrop.addEventListener("click", closeCreateModal);

chatCreateForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const productId = Number(document.getElementById("createProductId").value);
    const content = document.getElementById("createMessage").value.trim();

    const response = await fetch("/api/chats", {
        method: "POST",
        headers: authHeaders({
            "Content-Type": "application/json",
        }),
        body: JSON.stringify({ productId }),
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.message || "채팅방을 만들지 못했습니다.");
        return;
    }

    closeCreateModal();
    await fetchChatList();
    await openChatRoom(data.room.id);

    if (content) {
        await sendMessage(content);
    }
});

// 읽지 않은 채팅
document.getElementById("unreadToggle").addEventListener("change", () => {
    renderChatList();
});

// 시작
fetchMe()
    .then(() => fetchChatList())
    .catch(console.error);
