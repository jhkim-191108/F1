const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
const token = localStorage.getItem("token");

let sellerId = null;

fetch(`/api/products/${productId}`)
  .then((res) => res.json())
  .then((data) => {
    // console.log(data);

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

    document.querySelector(".post-id").textContent = product.seller.nickname;
    document.querySelector(".post-loc").textContent = product.location;

    const imgEl = document.querySelector(".img-box img");
    if (product.thumbnail?.startsWith("http")) {
      imgEl.src = product.thumbnail;
      imgEl.alt = product.title;
    } else {
      imgEl.remove();
    }

    checkOwner();
  })
  .catch((err) => console.error("상품 정보를 못 가져왔어요:", err));

// 내 글인지 확인
function checkOwner() {
  if (!token || !sellerId) {
    document.querySelector(".post-btn-box").hidden = true;
    return;
  }

  fetch("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => {
      const myId = data.user?.id;
      document.querySelector(".post-btn-box").hidden = myId !== sellerId;
    })
    .catch(() => {
      document.querySelector(".post-btn-box").hidden = true;
    });
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
document.querySelector(".btn-chat").addEventListener("click", () => {
  fetch("/api/chats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId: Number(productId) }),
  })
    .then((res) => res.json())
    .then((data) => {
      // console.log(data);
      const chatId = data.room?.id || data.chat?.id || data.id;
      window.location.href = `chat.html?id=${chatId}`;
    })
    .catch((err) => console.error("채팅방을 못 만들었어요:", err));
});

// 삭제하기
document.querySelector(".btn-delete").addEventListener("click", () => {
  if (!confirm("정말 삭제할까요?")) return;

  const token = localStorage.getItem("token");

  fetch(`/api/products/${productId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      if (!res.ok) throw new Error("삭제 실패");
      window.location.href = "trade.html";
    })
    .catch((err) => {
      console.error(err);
      alert("삭제에 실패했어요.");
    });

});

// 수정하기
document.querySelector(".btn-edit").addEventListener("click", () => {
  window.location.href = `write.html?id=${productId}`;
});
