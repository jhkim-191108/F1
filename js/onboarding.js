// =========================================================
// 인기매물 목록 / 더 보기
// - 홈 화면의 "인기매물" 그리드를 서버 데이터로 채우고
// - "더 보기" 클릭 시 전체 목록 페이지(trade.html)로 이동시킴
// =========================================================

const listEl = document.querySelector(".pop-grid");       // 카드들이 들어갈 grid 컨테이너
const moreBtn = document.querySelector(".pop-items-more"); // "더 보기" 버튼

// 인기매물 상위 8개 가져오기
async function loadPopularProducts() {
    try {
        // 1페이지 상품 목록을 요청 (여기서는 최신/인기 목록 중 앞부분만 사용)
        const response = await fetch("/api/products?page=1");
        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "상품 목록을 불러오지 못했습니다."
            );
        }

        // 상위 8개만 가져오기 (홈 화면 그리드에 맞춰 개수 제한)
        const products = data.items.slice(0, 8);

        // 기존 예시 카드 삭제 (HTML에 미리 넣어둔 더미 카드가 있다면 여기서 지워짐)
        listEl.innerHTML = "";

        products.forEach((product) => {
            const li = document.createElement("li");
            li.className = "item-card";

            // 카드 하나를 통째로 innerHTML로 생성
            // (썸네일 없는 상품 대비: thumbnail이 http로 시작하는 URL일 때만 <img> 렌더링)
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
        // 네트워크 오류 등으로 못 불러와도 페이지 자체는 그대로 유지 (콘솔에만 기록)
        console.error("인기매물을 못 가져왔어요:", error);
    }
}


// 인기매물 더 보기
// moreBtn이 없는 페이지에서도 에러 안 나도록 존재 여부 확인 후 이벤트 등록
if (moreBtn) {
    moreBtn.addEventListener("click", () => {
        window.location.href = "./trade.html";
    });
}


// 페이지가 로드되면 인기매물 가져오기
loadPopularProducts();