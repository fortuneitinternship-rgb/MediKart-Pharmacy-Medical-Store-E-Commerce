// Flash-sale entries reuse the canonical Shop catalog so product IDs,
// names, categories, prices and images always match the product detail page.
import products from "./products";
import { getUniqueProductsByImage } from "../utils/productImage";

const FLASH_SALE_PRODUCT_IDS = [350, 200, 300, 148, 169, 144, 120, 354];

const flashSaleProducts = getUniqueProductsByImage(
  FLASH_SALE_PRODUCT_IDS
    .map((id) => products.find((product) => Number(product.id) === id))
    .filter(Boolean)
).slice(0, 8);

export default flashSaleProducts;
