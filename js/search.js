const gridEl = document.querySelector("#mainSectionGrid");
const pageNumsEl = document.querySelector("#pageNums");
const prevBtn = document.querySelector("#prevPage");
const nextBtn = document.querySelector("#nextPage");
const searchInput = document.querySelector("#searchTextArea");

const params = new URLSearchParams(window.location.search);
const keyword = (params.get("search") || "").trim();

let currentPage = 1;
let hasNext = false;

if (searchInput) {
    searchInput.value = keyword;
}

function formatPrice(price) {
    return `${Number(price).toLocaleString("ko-KR")}원`;
}

function createCard(product) {
    const article = document.createElement("article");
    article.className = "mainGridCardBox";

    const thumb = product.thumbnail?.startsWith("http")
        ? `<img src="${product.thumbnail}" alt="${product.title}">`
        : "";

    article.innerHTML = `
        <a href="./trade-post.html?id=${product.id}">
            ${thumb}
            <div class="productInfo">
                <h3 class="productName">${product.title}</h3>
                <p class="productPrice">${formatPrice(product.price)}</p>
                <p class="productAddress">${product.location || ""}</p>
            </div>
            <div class="productMeta">
                <span class="meta">조회 ${product.viewCount ?? 0}</span>
                <span class="meta">•</span>
                <span class="meta">채팅 ${product.chatCount ?? 0}</span>
            </div>
        </a>
    `;

    return article;
}

async function loadSearchResults() {
    try {
        const query = new URLSearchParams({
            page: String(currentPage),
        });

        if (keyword) {
            query.set("q", keyword);
        }

        const response = await fetch(`/api/products?${query.toString()}`);
        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "검색 결과를 불러오지 못했습니다.");
            return;
        }

        const items = (data.items || []).filter((product) => {
            if (!keyword) {
                return true;
            }

            const haystack = `${product.title || ""} ${product.location || ""}`.toLowerCase();
            return haystack.includes(keyword.toLowerCase());
        });

        gridEl.replaceChildren();

        if (items.length === 0) {
            const empty = document.createElement("p");
            empty.textContent = "검색 결과가 없습니다.";
            gridEl.append(empty);
        } else {
            items.forEach((product) => {
                gridEl.append(createCard(product));
            });
        }

        hasNext = Boolean(data.hasNext);
        if (pageNumsEl) {
            pageNumsEl.textContent = `${currentPage} / ${hasNext ? currentPage + 1 : currentPage}`;
        }
    } catch (error) {
        console.error(error);
    }
}

if (prevBtn) {
    prevBtn.addEventListener("click", async () => {
        if (currentPage <= 1) {
            return;
        }
        currentPage -= 1;
        await loadSearchResults();
    });
}

if (nextBtn) {
    nextBtn.addEventListener("click", async () => {
        if (!hasNext) {
            return;
        }
        currentPage += 1;
        await loadSearchResults();
    });
}

loadSearchResults();
