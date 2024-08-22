const fs = require("fs");
const csv = require("csv-parser");
const { parse } = require("json2csv");
const csvParser = require("csv-parser");

// Define your CSV file paths
const inputFilePath = "product_test_heading.csv";
const outputFilePath = "updated_product_test_heading.csv";

// Define the data to be written in the CSV file
const dataToAdd = [
  {
    "Variant Price": 199,
    "Variant Compare At Price": 299,
    "Variant Inventory Qty": 5,
    "Image Position": 1,
    "Image Src":
      "https://cdn.shopify.com/s/files/1/0663/2705/2466/files/any-1.jpg",
  },
  {
    "Variant Price": 299,
    "Variant Compare At Price": 399,
    "Variant Inventory Qty": 10,
    "Image Position": 2,
    "Image Src":
      "https://cdn.shopify.com/s/files/1/0663/2705/2466/files/any-2.jpg",
  },
];

// Function to read the header from the input CSV file
function readHeader(filePath) {
  return new Promise((resolve, reject) => {
    const headers = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("headers", (headerList) => {
        headers.push(...headerList);
        resolve(headers);
      })
      .on("error", (error) => reject(error));
  });
}

// Function to write data to the output CSV file
async function writeData() {
  try {
    const headers = await readHeader(inputFilePath);
    const csvHeader = headers.join(",") + "\n";
    const csvData = parse(dataToAdd, { header: false }) + "\n";

    fs.writeFileSync(outputFilePath, csvHeader + csvData, "utf8");
    console.log("Data written successfully to", outputFilePath);
  } catch (error) {
    console.error("Error writing data:", error);
  }
}

//Function to read the CSV, update data, and write it back
async function updateCsvFile() {
  const existingData = [];

  //Read the existing CSV file
  fs.createReadStream(inputFilePath)
    .pipe(csvParser())
    .on("data", (row) => {
      existingData.push(row);
    })
    .on("end", async () => {
      //Update the existing data with new data
      const headers = await readHeader(inputFilePath);
      const csvHeader = headers.join(",") + "\n";

      dataToAdd.forEach((newRow) => {
        let rowUpdated = false;
        Object.keys(newRow).forEach((key) => {
          headers.forEach((header) => {
            if (header === key) {
              rowUpdated = true;
              existingData.forEach((row) => {
                row[key] = newRow[key];
              });
            }
          });
        });
      });
    });
}

// Execute the function to write data
writeData();
