// 먼저 조작할 header요소 querySelector로 저장
const loginStatus = document.querySelector("#loginStatusHeader");
const logoutStatus = document.querySelector("#logoutStatusHeader");
const logoutButton = document.querySelector("#upperLogoutButton");

// 로그인 상태를 전달받는 함수
function headerStatus(isLoggedIn) {
    logoutStatus.hidden = isLoggedIn;
    loginStatus.hidden = !isLoggedIn;
}

headerStatus(true);
// 로그인 상태가 true라면 logoutStatus숨김 false면 반대
// lohinStatus에서 로그아웃을 누르면 다시 logoutStatus가 나타나고 loginStatus가 hidden으로 돌아가는 이벤트 리스너
logoutButton.addEventListener("click", function () { headerStatus(false); });