const chatRoomListEl = document.getElementById("chatRoomList");

function createChatRoomItem(chat) {
    const li = document.createElement("li");
    li.className = "chat-room-item";
    li.dataset.roomId = chat.id;

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

    li.append(info, thumb);
    return li;
}

function renderChatList(chatList) {
    chatRoomListEl.replaceChildren();
    chatList.forEach((chat) => {
        chatRoomListEl.append(createChatRoomItem(chat));
    });
}

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
async function fetchChatList() {
    const chats = [
        {
            id: 1,
            nickname: "당근이",
            location: "인천 서구",
            time: "5분 전",
            lastMessage: "안녕하세요! 물건 아직 있나요?",
            thumbnail: ""
        },
        {
            id: 2,
            nickname: "홍길동",
            location: "인천 부평구",
            time: "30분 전",
            lastMessage: "네, 오늘 저녁에 거래 가능해요.",
            thumbnail: ""
        },
        {
            id: 3,
            nickname: "감자123",
            location: "인천 계양구",
            time: "1시간 전",
            lastMessage: "주소 알려주시면 찾아갈게요!",
            thumbnail: ""
        }
    ];

    renderChatList(chats);
}

fetchChatList();


//     const token = localStorage.getItem("token");

//     const response = await fetch("https://carrot.techfree.kr/api/chats", {
//         method: "GET",
//         headers: {
//             Authorization: `Bearer ${token}`,
//         },
//     });

//     if (!response.ok) {
//         throw new Error(`채팅 목록 요청 실패: ${response.status}`);
//     }

//     const data = await response.json();

//     const chatList = data.items.map((room) => ({
//         id: room.id,
//         nickname: room.partner.nickname,
//         location: room.product.location,
//         time: formatTime(room.lastMessageAt),
//         lastMessage: room.lastMessage
//             ? room.lastMessage.content
//             : "",
//         thumbnail: room.product.thumbnail,
//     }));

//     renderChatList(chatList);
// }

// fetchChatList().catch(console.error);

