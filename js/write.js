
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
fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  const token = localStorage.getItem("token");

  try {
    const response = await fetch("/api/images", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    // console.log("이미지 응답:", data);

    if (!response.ok) {
      alert(data.message || "이미지 업로드에 실패했습니다.");
      return;
    }

    uploadedImageUrl = data.image.url;

    preview.src = uploadedImageUrl;
    preview.hidden = false;
    cameraIcon.hidden = true;
  } catch (error) {
    console.error("이미지 업로드 실패:", error);
    alert("이미지 업로드 중 오류가 발생했습니다.");
  }
});

// 수정이면 기존 글 채우기
async function loadProductForEdit() {
  if (!editId) {
    return;
  }

  try {
    const response = await fetch(`/api/products/${editId}`);
    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "상품 정보를 불러오지 못했습니다.");
      return;
    }

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
  } catch (error) {
    console.error("상품 정보를 못 가져왔어요:", error);
    alert("상품 정보를 불러오는 중 오류가 발생했습니다.");
  }
}

loadProductForEdit();

// 완료 버튼 → 상품 등록/수정
document.querySelector(".btn-done").addEventListener("click", async () => {
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

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // console.log("저장 응답:", data);

    if (!response.ok) {
      alert(data.message || "저장에 실패했습니다.");
      return;
    }

    window.location.href = `trade-post.html?id=${data.product.id}`;
  } catch (error) {
    console.error("상품 저장 실패:", error);
    alert("상품 저장 중 오류가 발생했습니다.");
  }
});

