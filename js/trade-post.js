const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

fetch(`/api/products/${productId}`)
  .then((res) => res.json())
  .then((data) => {
    console.log(data);

    const product = data.product || data;

    // 제목 / 가격
    document.querySelector(".post-title").textContent = product.title;
    document.querySelector(".post-price").textContent =
      product.price.toLocaleString() + "원";

    // 조회 / 채팅 수
    document.querySelector(".view-num").textContent = product.viewCount;
    document.querySelector(".chat-num").textContent = product.chatCount;

    // 본문 (줄바꿈 살리기)
    document.querySelector(".post-text").innerHTML =
      product.description.replace(/\n/g, "<br>");

    // 거래 장소
    document.querySelector(".place-text").textContent = product.location;

    // 판매자
    document.querySelector(".post-id").textContent = product.seller.nickname;
    document.querySelector(".post-loc").textContent = product.location;

    // 이미지
    const imgEl = document.querySelector(".img-box img");
    if (product.thumbnail?.startsWith("http")) {
      imgEl.src = product.thumbnail;
      imgEl.alt = product.title;
    } else {
      imgEl.remove();
    }
  })
  .catch((err) => console.error("상품 정보를 못 가져왔어요:", err));
