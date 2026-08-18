// js/write.js

const fileInput = document.querySelector("#write-image");
const cameraIcon = document.querySelector(".icon-camera");
const preview = document.querySelector(".preview");

let uploadedImageUrl = "";

// 카메라 아이콘 클릭 → 파일 선택창 열기
cameraIcon.addEventListener("click", () => {
  fileInput.click();
});

// 파일 고르면 서버에 업로드
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  const token = localStorage.getItem("token");

  fetch("/api/images", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("이미지 응답:", data);
      uploadedImageUrl = data.image.url;

      preview.src = uploadedImageUrl;
      preview.hidden = false;
      cameraIcon.hidden = true;
    })
    .catch((err) => console.error("이미지 업로드 실패:", err));
});

// 완료 버튼 → 상품 등록
document.querySelector(".btn-done").addEventListener("click", () => {
  const title = document.querySelector("#write-title").value;
  const price = Number(
    document.querySelector("#write-price").value.replace(/[^0-9]/g, ""),
  );
  const description = document.querySelector("#write-desc").value;
  const location = document.querySelector("#write-place").value;

  if (!title || !price) {
    alert("제목과 가격을 입력해주세요.");
    return;
  }

  const token = localStorage.getItem("token");

  fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title,
      description,
      price,
      location,
      images: uploadedImageUrl ? [uploadedImageUrl] : [],
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("등록 응답:", data);

      if (!data.product) {
        alert("등록에 실패했어요. 다시 시도해주세요.");
        return;
      }

      window.location.href = `trade-post.html?id=${data.product.id}`;
    })
    .catch((err) => console.error("상품 등록 실패:", err));
});
