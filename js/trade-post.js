const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
const token = localStorage.getItem("token");

let sellerId = null;

// 상품 정보 가져오기
async function getProduct() {
  try {
    const res = await fetch(`/api/products/${productId}`);

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "상품 정보를 가져오지 못했습니다.");
    }

    const product = data.product || data;

    sellerId = product.seller?.id;

    document.querySelector(".post-title").textContent = product.title;

    document.querySelector(".post-price").textContent =
      product.price.toLocaleString() + "원";

    document.querySelector(".view-num").textContent = product.viewCount;
    document.querySelector(".chat-num").textContent = product.chatCount;

    document.querySelector(".post-text").innerHTML =
      product.description.replace(/\n/g, "<br>");

    document.querySelector(".place-text").textContent = product.location;

    document.querySelector(".post-id").textContent =
      product.seller.nickname;

    document.querySelector(".post-loc").textContent =
      product.location;

    const imgEl = document.querySelector(".img-box img");

    if (product.thumbnail?.startsWith("http")) {
      imgEl.src = product.thumbnail;
      imgEl.alt = product.title;
    } else {
      imgEl.remove();
    }

    checkOwner();

  } catch (err) {
    console.error("상품 정보를 못 가져왔어요:", err);
  }
}


// 내 글인지 확인
async function checkOwner() {
  try {
    if (!token || !sellerId) {
      document.querySelector(".post-btn-box").hidden = true;
      return;
    }

    const res = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.message || "사용자 정보를 가져오지 못했습니다."
      );
    }

    const myId = data.user?.id;

    document.querySelector(".post-btn-box").hidden =
      myId !== sellerId;

  } catch (err) {
    console.error("사용자 확인 실패:", err);
    document.querySelector(".post-btn-box").hidden = true;
  }
}


// 뒤로가기
document.querySelector(".btn-back").addEventListener("click", () => {
  if (history.length > 1) {
    history.back();
  } else {
    window.location.href = "trade.html";
  }
});


// 채팅하기
document.querySelector(".btn-chat").addEventListener("click", async () => {
  try {
    const res = await fetch("/api/chats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId: Number(productId),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.message || "채팅방을 만들지 못했습니다."
      );
    }

    const chatId =
      data.room?.id ||
      data.chat?.id ||
      data.id;

    if (!chatId) {
      throw new Error("채팅방 ID를 찾을 수 없습니다.");
    }

    window.location.href = `chat.html?id=${chatId}`;

  } catch (err) {
    console.error("채팅방을 못 만들었어요:", err);
  }
});


// 삭제하기
document.querySelector(".btn-delete").addEventListener("click", async () => {
  if (!confirm("이 게시글을 삭제할까요?")) {
    return;
  }

  try {
    const res = await fetch(`/api/products/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "삭제에 실패했습니다.");
      return;
    }

    alert(data.message || "삭제되었습니다.");
    window.location.href = "trade.html";

  } catch (err) {
    console.error("상품 삭제 실패:", err);
  }
});


// 수정하기
document.querySelector(".btn-edit").addEventListener("click", () => {
  window.location.href = `write.html?id=${productId}`;
});


// 상품 정보 불러오기
getProduct();