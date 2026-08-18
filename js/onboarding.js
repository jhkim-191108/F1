// pop-items.js

// 더미 데이터 ->  실제 API 응답으로 교체
let itemsData = [
    { name: '위닉스 제습기', price: '50,000원', location: '인천 부평구 부평동', meta: '조회 15 · 채팅 41' },
    { name: '삼성 냉장고', price: '150,000원', location: '서울 강남구 역삼동', meta: '조회 32 · 채팅 12' },
    { name: '아이폰 13 프로', price: '650,000원', location: '서울 마포구 합정동', meta: '조회 89 · 채팅 23' },
    { name: '이케아 책상', price: '35,000원', location: '경기 성남시 분당구', meta: '조회 21 · 채팅 5' },
    { name: '무선 청소기', price: '80,000원', location: '서울 송파구 잠실동', meta: '조회 47 · 채팅 18' },
    { name: '캠핑 텐트 4인용', price: '60,000원', location: '경기 수원시 영통구', meta: '조회 12 · 채팅 3' },
    { name: '닌텐도 스위치', price: '220,000원', location: '서울 강서구 화곡동', meta: '조회 103 · 채팅 34' },
    { name: '전기 자전거', price: '380,000원', location: '인천 남동구 구월동', meta: '조회 56 · 채팅 9' },
    { name: '원목 식탁 4인용', price: '120,000원', location: '경기 고양시 일산동구', meta: '조회 18 · 채팅 4' },
    { name: '커피 머신', price: '45,000원', location: '서울 용산구 이촌동', meta: '조회 29 · 채팅 7' },
    { name: '에어프라이어', price: '25,000원', location: '서울 노원구 상계동', meta: '조회 64 · 채팅 20' },
    { name: '골프채 풀세트', price: '300,000원', location: '경기 용인시 수지구', meta: '조회 8 · 채팅 2' },
    { name: '아기 유모차', price: '90,000원', location: '서울 은평구 불광동', meta: '조회 37 · 채팅 11' },
    { name: '통기타', price: '70,000원', location: '부산 해운대구 우동', meta: '조회 22 · 채팅 6' },
    { name: '모니터 27인치', price: '110,000원', location: '서울 동작구 사당동', meta: '조회 41 · 채팅 14' },
    { name: '런닝머신', price: '150,000원', location: '경기 부천시 원미구', meta: '조회 19 · 채팅 5' },
    { name: '스탠드 조명', price: '15,000원', location: '서울 서대문구 신촌동', meta: '조회 33 · 채팅 8' },
    { name: '겨울 패딩 (L)', price: '40,000원', location: '서울 광진구 자양동', meta: '조회 27 · 채팅 9' },
    { name: '블루투스 스피커', price: '28,000원', location: '인천 연수구 송도동', meta: '조회 51 · 채팅 16' },
    { name: '책장 5단', price: '20,000원', location: '경기 안양시 동안구', meta: '조회 14 · 채팅 3' },
];

const gridEl = document.querySelector('.pop-grid');
const moreBtn = document.querySelector('.pop-items-more');

const initialCount = 8; // 처음 보여줄 개수
const step = 8;         // 더보기 누를 때마다 늘어나는 개수
let visibleCount = initialCount;

function createCardEl(item) {
    const li = document.createElement('li');
    li.className = 'item-card';
    li.innerHTML = `
        <div class="card-thumb"></div>
        <div class="card-text">
            <p class="card-name">${item.name}</p>
            <p class="card-price">${item.price}</p>
            <p class="card-location">${item.location}</p>
            <p class="card-meta">${item.meta}</p>
        </div>
    `;
    return li;
}

function renderItems() {
    gridEl.innerHTML = '';
    itemsData.slice(0, visibleCount).forEach(item => {
        gridEl.appendChild(createCardEl(item));
    });

    moreBtn.textContent = visibleCount >= itemsData.length
        ? '접기'
        : '인기매물 더 보기';
}

moreBtn.addEventListener('click', (e) => {
    e.preventDefault();

    if (visibleCount >= itemsData.length) {
        // 이미 다 펼쳐진 상태 → 접기
        visibleCount = initialCount;
    } else {
        // 아직 더 있음 → 더보기
        visibleCount += step;
    }

    renderItems();
});

renderItems();

