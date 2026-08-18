// location.js
const titleEl = document.querySelector('[data-role="title"]');
const inputEl = document.querySelector('[data-role="input"]');
const editBtn = document.querySelector('[data-role="edit-btn"]');
const statusEl = document.querySelector('[data-role="status"]');
const confirmBtn = document.querySelector('[data-role="confirm-btn"]');

let myDong = null; 
let currentDong = '서울 강서구 화곡동';

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

    const isSame = myDong === currentDong;
    statusEl.innerHTML = `현재 위치는 ${currentDong}입니다.` +
        (isSame ? '<br>현재 위치가 내 동네 설정과 같습니다.' : '');

    confirmBtn.disabled = !myDong;
}

editBtn.addEventListener('click', () => {
    myDong = inputEl.value.trim() || currentDong;
    renderState();
});



renderState();