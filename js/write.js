const fileInput = document.querySelector("#write-image");
const cameraIcon = document.querySelector(".icon-camera");
const preview = document.querySelector(".preview");
const params = new URLSearchParams(window.location.search);
const editId = params.get("id");

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
      // console.log("이미지 응답:", data);
      uploadedImageUrl = data.image.url;

      preview.src = uploadedImageUrl;
      preview.hidden = false;
      cameraIcon.hidden = true;
    })
    .catch((err) => console.error("이미지 업로드 실패:", err));
});

// 수정이면 기존 글 채우기
if (editId) {
  fetch(`/api/products/${editId}`)
    .then((res) => res.json())
    .then((data) => {
      const product = data.product || data;

      document.querySelector("#write-title").value = product.title || "";
      document.querySelector("#write-price").value = product.price || "";
      document.querySelector("#write-desc").value = product.description || "";
      document.querySelector("#write-place").value = product.location || "";

      if (product.thumbnail?.startsWith("http")) {
        uploadedImageUrl = product.thumbnail;
        preview.src = product.thumbnail;
        preview.hidden = false;
        cameraIcon.hidden = true;
      }
    })
    .catch((err) => console.error("상품 정보를 못 가져왔어요:", err));
}

// 완료 버튼 → 상품 등록/수정
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
  const body = {
    title,
    description,
    price,
    location,
    images: uploadedImageUrl ? [uploadedImageUrl] : [],
  };

  const isEdit = Boolean(editId);
  const url = isEdit ? `/api/products/${editId}` : "/api/products";
  const method = isEdit ? "PATCH" : "POST";

  fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
    .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      // console.log("저장 응답:", data);

      if (!ok) {
        alert(data.message || "저장에 실패했습니다.");
        return;
      }

      window.location.href = `trade-post.html?id=${data.product.id}`;
    })
    .catch((err) => console.error("상품 저장 실패:", err));
});
