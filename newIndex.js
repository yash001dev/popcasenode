const fs = require("fs");
const path = require("path");
const fixedInfo = require("./fixedinfo");
const processCsv = require("./newtest");
const { productFixedData } = require("./constants");

// Set root directory path
const rootDir = "E:/popcase node/Expriment"; // Replace with your path
const variant = ["hard-plastic", "metal-case"];
// Read and parse the text file
function parseTextFile(filePath) {
  const data = fs.readFileSync(filePath, "utf8");
  const lines = data
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const products = [];
  for (let i = 0; i < lines.length; i += 4) {
    const title = lines[i];
    const description = lines[i + 1];
    const seoTitle = lines[i + 2];
    const seoDescription = lines[i + 3];

    products.push({ title, description, seoTitle, seoDescription });
  }
  return products;
}
const prepareCSVDatas = [];

// Rename images in folders
function renameImagesIteratively(products) {
  const folders = fs.readdirSync(rootDir).filter((file) => {
    const folderPath = path.join(rootDir, file);
    return fs.statSync(folderPath).isDirectory();
  });
  folders.forEach((folder, index) => {
    const folderPath = path.join(rootDir, folder);
    const product = products[index];

    if (!product) {
      console.log(`No more products to assign to folder: ${folder}`);
      return;
    }

    const files = fs.readdirSync(folderPath);
    let fileIndex = 1;
    const productDetails = {
      title: product.title,
      description: product.description,
      images: [],
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
    };

    files.forEach((file) => {
      const ext = path.extname(file);
      const newName = `${product.title}_${fileIndex}${ext}`;
      const oldFilePath = path.join(folderPath, file);
      const newFilePath = path.join(folderPath, newName);

      // Rename file
      fs.renameSync(oldFilePath, newFilePath);
      console.log(`Renamed in ${folder}: ${file} -> ${newName}`);
      productDetails.images.push(newName);
      fileIndex++;
    });
    prepareCSVDatas.push(productDetails);
  });
}

// Main execution
function main() {
  const textFilePath = path.join(rootDir, "products.txt"); // Your text file name
  if (!fs.existsSync(textFilePath)) {
    console.error("Text file not found in root directory!");
    return;
  }

  const products = parseTextFile(textFilePath);
  renameImagesIteratively(products);
  const productDetailsArray = [];
  const csvFinalData = prepareCSVDatas.map((product, index) => {
    console.log("product title", product.title);
    const urlPrefixFromTitle = product.title.replace(/ /g, "-");
    const imagePrefixFromTitle = product.title.replace(/ /g, "_");
    let productDetails;
    const embedProductDescription = `<p><span>${product.description}</span></p>`;
    Object.keys(product?.images).forEach((image, i) => {
      if (i === 0) {
        productDetails = {
          ...fixedInfo,
          "new custom description (product.metafields.custom.new_custom_description)":
            product.description,
          Handle: urlPrefixFromTitle,
          Title: product.title,
          "Body (HTML)": embedProductDescription,
          "Additional Information": product.description,
          "SEO Title": product.seoTitle,
          "SEO Description": product.seoDescription,
          "Variant Price": productFixedData?.VariantPrice,
          "Variant Compare At Price": productFixedData?.VariantCompareAtPrice,
          "Variant Inventory Qty": productFixedData?.VariantInventoryQty,
          "Image Position": i + 1,
          "Image Src": `https://cdn.shopify.com/s/files/1/0663/2705/2466/files/${imagePrefixFromTitle}_1.jpg`,
          "Image Alt Text": `${product.title} ${i + 1}`,
          "Option1 Value": variant[1],
          "Option1 Linked To": "product.metafields.shopify.bag-case-material",
          "Bag/Case material (product.metafields.shopify.bag-case-material)":
            variant.join("; "),
          Collection: productFixedData?.Collection,
          Tags: productFixedData?.Tags,
        };
      } else {
        const imgPosition = i + 1;
        productDetails = {
          Handle: urlPrefixFromTitle,
          "Image Src": `https://cdn.shopify.com/s/files/1/0663/2705/2466/files/${imagePrefixFromTitle}_${imgPosition}.jpg`,
          "Image Alt Text": `${product.title} ${i + 1}`,
          "Image Position": i + 1,
        };
      }
      productDetailsArray.push(productDetails);
    });
    return productDetails;
  });
  processCsv(productDetailsArray);
}

main();
