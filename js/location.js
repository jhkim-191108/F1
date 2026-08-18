const REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";

const titleEl = document.querySelector('[data-role="title"]');
const inputEl = document.querySelector('[data-role="input"]');
const editBtn = document.querySelector('[data-role="edit-btn"]');
const statusEl = document.querySelector('[data-role="status"]');
const confirmBtn = document.querySelector('[data-role="confirm-btn"]');
const map = document.querySelector('#map');

let myDong = null;
let currentDong = null;


function buildMapUrl(lat, lng) {
    const d = 0.008;
    const bbox = [lng - d, lat - d, lng + d, lat + d].join(",");
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
}

function showMap(lat, lng) {
    map.src = buildMapUrl(lat, lng);
}


async function reverseGeocode(lat, lng) {
    const url = new URL(REVERSE_URL);
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lng);
    url.searchParams.set("format", "json");
    url.searchParams.set("accept-language", "ko");

    const res = await fetch(url);
    if (!res.ok) throw new Error("주소 변환 실패 (HTTP " + res.status + ")");

    const data = await res.json();
    const addr = data.address ?? {};

    
    const dong = addr.quarter || addr.neighbourhood || addr.suburb || addr.village || "";
    const gu = addr.borough || addr.city_district || "";
    const si = addr.city || addr.province || "";

    return [si, gu, dong].filter(Boolean).join(" ");
}

function renderState() {
    if (myDong) {
        titleEl.textContent = '내 동네 설정';
        inputEl.value = myDong;
        editBtn.textContent = '내 동네 수정';
    } else {
        titleEl.textContent = '어디에 살고 계신가요?';
        inputEl.value = '';
        editBtn.textContent = '내 동네 설정';
    }

    statusEl.textContent = currentDong
        ? `현재 위치는 ${currentDong}입니다.` + (myDong === currentDong ? ' 현재 위치가 내 동네 설정과 같습니다.' : '')
        : '현재 위치를 확인하는 중입니다...';

    confirmBtn.disabled = !myDong;
}

editBtn.addEventListener('click', () => {
    myDong = inputEl.value.trim() || currentDong;
    renderState();
});


const FALLBACK = { name: "서울 강서구 화곡동", lat: 37.5407, lng: 126.8406 };

function showMyLocation() {
    if (!navigator.geolocation) {
        currentDong = FALLBACK.name;
        showMap(FALLBACK.lat, FALLBACK.lng);
        renderState();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async function (position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            showMap(lat, lng);

            try {
                currentDong = await reverseGeocode(lat, lng);
            } catch (err) {
                currentDong = FALLBACK.name;
                console.error(err);
            }
            renderState();
        },
        function () {
            currentDong = FALLBACK.name;
            showMap(FALLBACK.lat, FALLBACK.lng);
            renderState();
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
}

renderState();
showMyLocation();