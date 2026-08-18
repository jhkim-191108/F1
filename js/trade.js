// js/trade.js

let currentPage = 1;
let isLoading = false;
let hasNext = true;

const listEl = document.querySelector(".popular-list");

function loadProducts() {
  if (isLoading || !hasNext) return;

  isLoading = true;

  fetch(`/api/products?page=${currentPage}`)
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

      hasNext = data.hasNext;
      currentPage++;
      isLoading = false;
    })
    .catch((err) => {
      console.error("상품 목록을 못 가져왔어요:", err);
      isLoading = false;
    });
}

loadProducts();

window.addEventListener("scroll", () => {
  const scrolledToBottom =
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;

  if (scrolledToBottom) {
    loadProducts();
  }
});
