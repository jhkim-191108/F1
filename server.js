// 상품 등록
app.post("/api/products", (req, res) => {
  proxyToApi(req, res, "/api/products");
});
