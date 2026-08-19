const REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";
const GEO_URL = "https://nominatim.openstreetmap.org/search";
const FALLBACK = {
    name: "서울 강서구 화곡동",
    lat: 37.5407,
    lng: 126.8406,
    si: "서울특별시",
    gu: "강서구",
    dong: "화곡동",
};

// DOM refs
const titleEl = document.querySelector('[data-role="title"]');
const inputEl = document.querySelector('[data-role="input"]');
const resultsEl = document.querySelector('[data-role="search-results"]');
const setBtn = document.querySelector('[data-role="edit-btn"]');
const setStatusEl = document.querySelector('[data-role="set-status"]');
const statusEl = document.querySelector('[data-role="status"]');
const confirmBtn = document.querySelector('[data-role="confirm-btn"]');
const map = document.querySelector('#map');

const distanceModal = document.querySelector('[data-role="distance-modal"]');
const modalCancelBtn = document.querySelector('[data-role="modal-cancel"]');
const modalEditBtn = document.querySelector('[data-role="modal-edit"]');

let myDong = null;
let currentDong = null;      // 화면에 보여줄 GPS 주소 문자열
let currentAddress = null;   // { si, gu, dong } - 비교용
let selectedDong = null;     // 검색 목록에서 고른 동네 이름 (화면 표시용)
let selectedCoords = null;
let selectedAddress = null;  // { si, gu, dong } - 비교용
let searchList = [];         // 마지막 검색 결과 원본 목록

// ---------- 지도 ----------
function buildMapUrl(lat, lng) {
    const d = 0.008;
    const bbox = [lng - d, lat - d, lng + d, lat + d].join(",");
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
}
function showMap(lat, lng) {
    map.src = buildMapUrl(lat, lng);
}

// ---------- Nominatim address 객체 -> {si, gu, dong} ----------
function extractAddressParts(addr) {
    const dong = addr.quarter || addr.neighbourhood || addr.suburb || addr.village || "";
    const gu = addr.borough || addr.city_district || "";
    const si = addr.city || addr.province || "";
    return { si, gu, dong };
}

// ---------- 좌표 -> 주소 (GPS 자동감지용) ----------
async function reverseGeocode(lat, lng) {
    const url = new URL(REVERSE_URL);
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lng);
    url.searchParams.set("format", "json");
    url.searchParams.set("accept-language", "ko");
    const res = await fetch(url);
    if (!res.ok) throw new Error("주소 변환 실패 (HTTP " + res.status + ")");
    const data = await res.json();
    return extractAddressParts(data.address ?? {});
}

// ---------- 동네 이름 -> 후보 목록 (직접 검색용, 주소 상세 포함) ----------
async function geocode(query, count = 5) {
    const url = new URL(GEO_URL);
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("accept-language", "ko");
    url.searchParams.set("limit", count);
    const res = await fetch(url);
    if (!res.ok) throw new Error("검색 실패 (HTTP " + res.status + ")");
    return res.json();
}

// ---------- 같은 동네인지 주소로 비교 ----------
function isSameArea(current, selected) {
    if (!current || !selected) return false;
    if (!current.gu || !selected.gu) return false;
    if (current.si && selected.si && current.si !== selected.si) return false;
    if (current.gu !== selected.gu) return false;
    if (selected.dong) {
        return current.dong === selected.dong;
    }
    return true; // 검색 결과에 동 정보가 없으면(구 단위 검색) 구까지만 맞아도 인증 허용
}

// ---------- 검색 결과 목록 렌더링 ----------
function renderResults(list) {
    searchList = list;
    resultsEl.innerHTML = "";
    if (!list.length) {
        resultsEl.hidden = true;
        return;
    }
    list.forEach((place, i) => {
        const li = document.createElement("li");
        li.textContent = place.display_name;
        li.dataset.index = i;
        resultsEl.appendChild(li);
    });
    resultsEl.hidden = false;
}

// ---------- 거리(주소 불일치) 초과 모달 ----------
function openDistanceModal() {
    distanceModal.hidden = false;
}
function closeDistanceModal() {
    distanceModal.hidden = true;
}
modalCancelBtn.addEventListener("click", closeDistanceModal);
modalEditBtn.addEventListener("click", () => {
    closeDistanceModal();
    inputEl.value = "";
    inputEl.focus();
    selectedDong = null;
    selectedCoords = null;
    selectedAddress = null;
});
distanceModal.addEventListener("click", (e) => {
    if (e.target === distanceModal) closeDistanceModal();
});

// 검색 결과 클릭 (이벤트 위임)
resultsEl.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (!li) return;
    const place = searchList[Number(li.dataset.index)];
    if (!place) return;
    selectedDong = place.display_name;
    selectedCoords = { lat: Number(place.lat), lng: Number(place.lon) };
    selectedAddress = extractAddressParts(place.address ?? {});
    inputEl.value = selectedDong;
    resultsEl.hidden = true;
    setStatusEl.textContent = "";
    setStatusEl.classList.remove("is-error");
});

// 입력할 때마다 (디바운스 적용) 검색
let debounceTimer = null;
inputEl.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    selectedDong = null;
    selectedCoords = null;
    selectedAddress = null;
    const query = inputEl.value.trim();
    if (!query) {
        renderResults([]);
        return;
    }
    debounceTimer = setTimeout(async () => {
        try {
            const list = await geocode(query);
            renderResults(list);
        } catch (err) {
            console.error(err);
            renderResults([]);
        }
    }, 300);
});

// "내 동네 설정" 버튼: 검색해서 고른 동네가 현재 GPS 주소와 같은 구/동인지 확인 후 확정
setBtn.addEventListener("click", async () => {
    if (!selectedCoords) {
        setStatusEl.textContent = "목록에서 동네를 선택해주세요.";
        setStatusEl.classList.add("is-error");
        return;
    }

    if (!currentAddress) {
        setStatusEl.textContent = "현재 위치를 확인하는 중입니다. 잠시 후 다시 시도해주세요.";
        setStatusEl.classList.add("is-error");
        return;
    }

    if (!isSameArea(currentAddress, selectedAddress)) {
        openDistanceModal();
        return;
    }

    setStatusEl.textContent = "";
    setStatusEl.classList.remove("is-error");

    myDong = selectedDong;

    // 서버에 내 동네 저장
    try {
        const response = await fetch("/api/auth/me", {
            method: "PATCH",
            headers: authHeaders({
                "Content-Type": "application/json",
            }),
            body: JSON.stringify({
                location: myDong,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "동네 저장에 실패했습니다.");
        }

        console.log("동네 저장 완료:", data.user.location);
        resultsEl.hidden = true;
        renderState();

    } catch (error) {
        console.error("동네 저장 실패:", error);

        setStatusEl.textContent = "동네 저장에 실패했습니다.";
        setStatusEl.classList.add("is-error");
    }
});

// "동네인증 완료하기" 버튼: GPS로 감지된 현재 위치로 확정
confirmBtn.addEventListener("click", async () => {
    if (!currentDong) return;

    myDong = currentDong;

    try {
        const response = await fetch("/api/auth/me", {
            method: "PATCH",
            headers: authHeaders({
                "Content-Type": "application/json",
            }),
            body: JSON.stringify({
                location: myDong,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "동네 저장에 실패했습니다.");
        }

        console.log("동네 저장 완료:", data.user.location);
        renderState();

    } catch (error) {
        console.error("동네 저장 실패:", error);
        statusEl.textContent = "동네 저장에 실패했습니다.";
    }
});

// ---------- 상태 렌더링 ----------
function renderState() {
    if (myDong) {
        titleEl.textContent = `설정된 동네: ${myDong}`;
        statusEl.textContent = "동네 인증이 완료되었습니다.";
    } else {
        titleEl.textContent = "어디에 살고 계신가요?";
        statusEl.textContent = currentDong
            ? `현재 위치: ${currentDong}`
            : "위치를 확인하는 중입니다...";
    }
}

// ---------- GPS로 현재 위치 자동 감지 ----------
function showMyLocation() {
    if (!navigator.geolocation) {
        currentAddress = { si: FALLBACK.si, gu: FALLBACK.gu, dong: FALLBACK.dong };
        currentDong = FALLBACK.name;
        showMap(FALLBACK.lat, FALLBACK.lng);
        confirmBtn.disabled = false;
        renderState();
        return;
    }
    navigator.geolocation.getCurrentPosition(
        async function (position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            showMap(lat, lng);
            try {
                currentAddress = await reverseGeocode(lat, lng);
                currentDong = [currentAddress.si, currentAddress.gu, currentAddress.dong]
                    .filter(Boolean)
                    .join(" ");
            } catch (err) {
                currentAddress = { si: FALLBACK.si, gu: FALLBACK.gu, dong: FALLBACK.dong };
                currentDong = FALLBACK.name;
                console.error(err);
            }
            confirmBtn.disabled = false;
            renderState();
        },
        function () {
            currentAddress = { si: FALLBACK.si, gu: FALLBACK.gu, dong: FALLBACK.dong };
            currentDong = FALLBACK.name;
            showMap(FALLBACK.lat, FALLBACK.lng);
            confirmBtn.disabled = false;
            renderState();
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );  
}
function authHeaders(extra = {}) {
    const token = localStorage.getItem("token");
    const headers = { ...extra };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

renderState();
showMyLocation();