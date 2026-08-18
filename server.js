// 상품 상세
app.get("/api/products/:id", (req, res) => {
  proxyToApi(req, res, `/api/products/${req.params.id}`);
});
