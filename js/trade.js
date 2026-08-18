// js/trade.js

let currentPage = 1; // 지금 몇 페이지까지 불러왔는지
let isLoading = false; // 지금 불러오는 중인지 (중복 요청 방지)
let hasNext = true; // 더 불러올 게 남았는지

const listEl = document.querySelector(".popular-list");

function loadProducts() {
  // 이미 불러오는 중이거나, 더 불러올 게 없으면 중단
  if (isLoading || !hasNext) return;

  isLoading = true;

  fetch(`http://localhost:3000/api/products?page=${currentPage}`)
    .then((res) => res.json())
    .then((data) => {
      data.items.forEach((product) => {
        const li = document.createElement("li");
        li.className = "popular-item";
        li.innerHTML = `
          <a href="trade-post.html?id=${product.id}">
            <div class="popular-thumb">
              ${
                product.thumbnail?.startsWith("http")
                  ? `<img src="${product.thumbnail}" alt="${product.title}">`
                  : ""
              }
            </div>
            <div class="popular-text-box">
              <p class="popular-name">${product.title}</p>
              <strong class="popular-price">${product.price.toLocaleString()}원</strong>
              <span class="popular-location">${product.location}</span>
              <div class="popular-info">
                <span>조회</span>
                <span class="num">${product.viewCount}</span>
                <span class="dot">·</span>
                <span>채팅</span>
                <span class="num">${product.chatCount}</span>
              </div>
            </div>
          </a>
        `;
        listEl.appendChild(li);
      });

      hasNext = data.hasNext; // 서버가 알려주는 "더 있음/없음"
      currentPage++; // 다음엔 그다음 페이지를 부르도록
      isLoading = false;
    })
    .catch((err) => {
      console.error("상품 목록을 못 가져왔어요:", err);
      isLoading = false;
    });
}

// 처음 한 번 불러오기
loadProducts();

// 스크롤이 바닥 근처(300px 전)에 닿으면 다음 페이지 불러오기
window.addEventListener("scroll", () => {
  const scrolledToBottom =
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;

  if (scrolledToBottom) {
    loadProducts();
  }
});
