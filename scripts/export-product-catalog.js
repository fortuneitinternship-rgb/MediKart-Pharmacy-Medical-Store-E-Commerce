const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");

const projectRoot = path.resolve(__dirname, "..");
const sourceDirectory = path.join(projectRoot, "src", "data");
const outputFile = path.join(
  projectRoot,
  "backend",
  "data",
  "product_catalog.json"
);
const catalogFiles = [
  "medicines.js",
  "healthcare.js",
  "vitamins.js",
  "personalCare.js",
  "babyCare.js",
  "medicalDevices.js",
  "eye-care.js",
  "HairCare.js",
  "womensHealth.js",
  "premium-healthcare.js",
];

function getPropertyValue(node, imports) {
  switch (node.type) {
    case "StringLiteral":
    case "NumericLiteral":
    case "BooleanLiteral":
      return node.value;
    case "Identifier":
      if (Object.hasOwn(imports, node.name)) {
        return imports[node.name];
      }
      throw new Error(`Unknown catalog value: ${node.name}`);
    default:
      throw new Error(`Unsupported catalog value type: ${node.type}`);
  }
}

function readCatalogFile(fileName) {
  const filePath = path.join(sourceDirectory, fileName);
  const ast = parser.parse(fs.readFileSync(filePath, "utf8"), {
    sourceType: "module",
  });
  const imports = {};

  ast.program.body
    .filter((node) => node.type === "ImportDeclaration")
    .forEach((node) => {
      node.specifiers.forEach((specifier) => {
        const assetPath = path.resolve(path.dirname(filePath), node.source.value);
        const relativeAssetPath = path
          .relative(path.join(projectRoot, "src", "assets"), assetPath)
          .split(path.sep)
          .join("/");
        imports[specifier.local.name] = `/catalog/${relativeAssetPath}`;
      });
    });

  const defaultExport = ast.program.body.find(
    (node) => node.type === "ExportDefaultDeclaration"
  );
  const catalogName = defaultExport?.declaration?.name;
  const declaration = ast.program.body
    .filter((node) => node.type === "VariableDeclaration")
    .flatMap((node) => node.declarations)
    .find((node) => node.id.name === catalogName);

  if (!declaration || declaration.init.type !== "ArrayExpression") {
    throw new Error(`Could not find product array in ${fileName}`);
  }

  return declaration.init.elements.map((productNode) => {
    if (productNode.type !== "ObjectExpression") {
      throw new Error(`Unsupported product entry in ${fileName}`);
    }

    return Object.fromEntries(
      productNode.properties.map((property) => {
        if (property.type !== "ObjectProperty" || property.computed) {
          throw new Error(`Unsupported product field in ${fileName}`);
        }
        return [
          property.key.name || property.key.value,
          getPropertyValue(property.value, imports),
        ];
      })
    );
  });
}

function normalize(value) {
  return String(value || "").trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

const products = catalogFiles.flatMap(readCatalogFile);
const productKeys = new Set();
const imageKeys = new Set();
const skippedDuplicates = [];
const output = products.map((product) => {
  if (!product.name || !product.category || typeof product.price !== "number") {
    throw new Error(`Invalid product in catalog: ${JSON.stringify(product)}`);
  }

  const nameKey = normalize(product.name);
  const imageKey = normalize(product.image);
  if (productKeys.has(nameKey) || (imageKey && imageKeys.has(imageKey))) {
    skippedDuplicates.push(product.name);
    return null;
  }
  productKeys.add(nameKey);
  if (imageKey) {
    imageKeys.add(imageKey);
  }

  const originalPrice = product.originalPrice ?? product.price;
  const stock =
    typeof product.stock === "number"
      ? product.stock
      : product.stock === false
        ? 0
        : 100;

  return {
    name: product.name,
    brand: product.brand || null,
    category: product.category,
    description: product.description || null,
    price: originalPrice,
    discount_price: product.price < originalPrice ? product.price : null,
    stock,
    image: product.image,
    rating: product.rating || 0,
    reviews: product.reviews || 0,
    pack_size: product.packSize || null,
    expiry: product.expiry || null,
    delivery: product.delivery || null,
    return_policy: product.returnPolicy || null,
  };
}).filter(Boolean);

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Exported ${output.length} products to ${path.relative(projectRoot, outputFile)}.`);
if (skippedDuplicates.length > 0) {
  console.warn(
    `Skipped ${skippedDuplicates.length} products with duplicate names or images: ` +
      skippedDuplicates.join(", ")
  );
}
