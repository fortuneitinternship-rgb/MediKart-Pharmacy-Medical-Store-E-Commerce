const normalizeProduct = (product) => {
  const originalPrice = Number(product.originalPrice ?? product.price ?? 0);
  const price = Number(
    product.discountedPrice ??
    product.discount_price ??
    product.price ??
    0
  );
  const category =
    typeof product.category === "object"
      ? product.category?.name || ""
      : product.category || "";
  const discount = Number(
    product.discount ??
    product.discount_percentage ??
    (originalPrice > price
      ? ((originalPrice - price) / originalPrice) * 100
      : 0)
  );

  return {
    ...product,
    category,
    originalPrice,
    price,
    discount,
  };
};

export default normalizeProduct;
