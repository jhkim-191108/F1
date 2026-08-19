const listEl = document.querySelector(".pop-grid");
const moreBtn = document.querySelector(".pop-items-more");

// 인기매물 상위 8개 가져오기
async function loadPopularProducts() {
    try {
        const response = await fetch("/api/products?page=1");
        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "상품 목록을 불러오지 못했습니다."
            );
        }

        // 상위 8개만 가져오기
        const products = data.items.slice(0, 8);

        // 기존 예시 카드 삭제
        listEl.innerHTML = "";

        products.forEach((product) => {
            const li = document.createElement("li");
            li.className = "item-card";

            li.innerHTML = `
                <a href="./trade-post.html?id=${product.id}">
                    <div class="card-thumb">
                        ${
                            product.thumbnail?.startsWith("http")
                                ? `<img 
                                    src="${product.thumbnail}" 
                                    alt="${product.title}"
                                  >`
                                : ""
                        }
                    </div>

                    <div class="card-text">
                        <p class="card-name">
                            ${product.title}
                        </p>

                        <p class="card-price">
                            ${product.price.toLocaleString()}원
                        </p>

                        <p class="card-location">
                            ${product.location}
                        </p>

                        <p class="card-meta">
                            조회 ${product.viewCount} · 채팅 ${product.chatCount}
                        </p>
                    </div>
                </a>
            `;

            listEl.appendChild(li);
        });
    } catch (error) {
        console.error("인기매물을 못 가져왔어요:", error);
    }
}


// 인기매물 더 보기
if (moreBtn) {
    moreBtn.addEventListener("click", () => {
        window.location.href = "./trade.html";
    });
}


// 페이지가 로드되면 인기매물 가져오기
loadPopularProducts();