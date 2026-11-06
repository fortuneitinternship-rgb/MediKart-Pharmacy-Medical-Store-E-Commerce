import genericProductImage from "../assets/products/product1.png";
import products from "../data/products";

const fallbackProductImage = genericProductImage;

const imageAssetContext =
  process.env.NODE_ENV === "test"
    ? null
    : require.context(
        "../assets",
        true,
        /\.(png|jpe?g|webp|svg)$/i
      );

const apiBaseUrl = (
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"
)
  .replace(/\/api\/?$/i, "")
  .replace(/\/+$/, "");

const normalizeProductName = (name) =>
  typeof name === "string"
    ? name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
        .replace(/\b(\d+)\s+(mg|ml|g|mcg)\b/g, "$1$2")
    : "";

const catalogAliases = [
  { pattern: /\belectral\b/, catalogName: "Electral ORS" },
  { pattern: /\bparacetamol\b.*650/, catalogName: "Dolo 650 Tablet" },
  { pattern: /\bvitamin c\b.*500/, catalogName: "Limcee Vitamin C" },
  { pattern: /\bmultivitamin\b.*daily/, catalogName: "Supradyn Daily" },
];

const knownMismatchedAssets = {
  "azithral 500": new Set(["azithral.png"]),
};

function getCatalogProductImage(productName, category) {
  const normalizedName = normalizeProductName(productName);

  if (!normalizedName) {
    return null;
  }

  const alias = catalogAliases.find(({ pattern }) =>
    pattern.test(normalizedName)
  );
  const catalogName = alias
    ? normalizeProductName(alias.catalogName)
    : normalizedName;
  const candidates = products.filter((product) => {
    const name = normalizeProductName(product.name);
    return name === catalogName || catalogName.startsWith(`${name} `);
  });
  const normalizedCategory = normalizeProductName(category);
  const categoryMatch = candidates.find(
    (product) =>
      normalizedCategory &&
      normalizeProductName(product.category) === normalizedCategory
  );
  const catalogProduct = categoryMatch || candidates[0];

  return catalogProduct?.image || null;
}

function isPromotionalBanner(imagePath) {
  const imageName = imagePath.split("/").pop().split("?")[0];
  return /^mediction(?:[1-3])?\.png$/i.test(imageName);
}

function isGenericProductImage(imagePath) {
  const imageName = imagePath.split("/").pop().split("?")[0];
  return /^product\d+\.(?:png|jpe?g|webp)$/i.test(imageName);
}

export function getProductImage(image, productName, category) {
  const catalogImage = getCatalogProductImage(productName, category);

  if (catalogImage) {
    return catalogImage;
  }

  if (typeof image !== "string" || !image.trim()) {
    return fallbackProductImage;
  }

  const imagePath = image.trim().replace(/\\/g, "/");
  const mismatchedAssets = knownMismatchedAssets[normalizeProductName(productName)];
  const imageName = imagePath.split("/").pop().split("?")[0].toLowerCase();

  if (mismatchedAssets?.has(imageName)) {
    return fallbackProductImage;
  }

  if (isPromotionalBanner(imagePath)) {
    return fallbackProductImage;
  }

  if (isGenericProductImage(imagePath)) {
    return fallbackProductImage;
  }

  if (/^(https?:|data:|blob:)/i.test(imagePath)) {
    return imagePath;
  }

  if (/^\/catalog\//i.test(imagePath) && imageAssetContext) {
    const catalogPath = imagePath.slice("/catalog/".length).toLowerCase();
    const assetPath = imageAssetContext.keys().find((path) =>
      path.slice(2).toLowerCase() === catalogPath
    );
    if (assetPath) {
      return imageAssetContext(assetPath);
    }
    return fallbackProductImage;
  }

  if (/^\/(uploads|media|static)\//i.test(imagePath)) {
    return `${apiBaseUrl}${imagePath}`;
  }

  if (imageAssetContext) {
    const fileName = imagePath.split("/").pop().toLowerCase();
    const assetPath = imageAssetContext
      .keys()
      .find((path) => path.split("/").pop().toLowerCase() === fileName);

    if (assetPath) {
      return imageAssetContext(assetPath);
    }
  }

  if (/^\/images\//i.test(imagePath)) {
    return fallbackProductImage;
  }

  return imagePath;
}

export function handleProductImageError(event, productName, category) {
  const fallbackImage =
    getCatalogProductImage(productName, category) || fallbackProductImage;

  if (event.currentTarget.getAttribute("src") !== fallbackImage) {
    event.currentTarget.src = fallbackImage;
  }
}

export function getUniqueProductsByImage(productList) {
  const seenNames = new Set();
  const seenImages = new Set();

  return productList.filter((product) => {
    const name = normalizeProductName(product.name);
    const image = getProductImage(
      product.image,
      product.name,
      product.category
    )
      .split("?")[0]
      .toLowerCase();

    if (!name || seenNames.has(name) || seenImages.has(image)) {
      return false;
    }

    seenNames.add(name);
    seenImages.add(image);
    return true;
  });
}

export { fallbackProductImage };
