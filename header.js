// 먼저 조작할 header요소 querySelector로 저장
const loginStatus = document.querySelector("#loginStatusHeader");
const logoutStatus = document.querySelector("#logoutStatusHeader");
const logoutButton = document.querySelector("#upperLogoutButton");
const tradeNav = document.querySelector("#tradeNav")
const locationNav = document.querySelector("#locationNav")
const profile = document.querySelector("#profileButton")
const profileDropdown = document.querySelector("#dropdownMenu")


// 로그인 상태를 전달받는 함수
function headerStatus(isLoggedIn) {
    logoutStatus.hidden = isLoggedIn;
    loginStatus.hidden = !isLoggedIn;

    locationNav.hidden = !isLoggedIn;
}

headerStatus();
// 로그인 상태가 true라면 logoutStatus숨김 false면 반대
// lohinStatus에서 로그아웃을 누르면 다시 logoutStatus가 나타나고 loginStatus가 hidden으로 돌아가는 이벤트 리스너
logoutButton.addEventListener("click", function () { headerStatus(false); });

function updateActiveNav() {
    const currentPage = location.pathname;
    const tradePages = [
        "trade.html",
        "trade_post.html",
        "write.html",
        "search.html",
        "chat.html"
    ];
    const isTradePage = tradePages.some(function (page) {
        return currentPage.endsWith(page);
    });

    tradeNav.classList.remove("activeNav");
    locationNav.classList.remove("activeNav");

    // tradepages에 activeNav추가
    if(isTradePage) {
        tradeNav.classList.add("activeNav");
    }
    // location에 active추가
    if(currentPage.endsWith("/location.html")) {
        locationNav.classList.add("activeNav");
    }
}

updateActiveNav();

profile.addEventListener("click", function(){
    profileDropdown.hidden = !profileDropdown.hidden;
});