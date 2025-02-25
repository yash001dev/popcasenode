const readline = require("readline");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { stringify } = require("csv-stringify");
const fixedInfo = require("./fixedinfo");
const price = 250;
const compareAtPrice = 500;

const r1 = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

r1.question("Enter the input CSV file path: ", (csvFilePath) => {
  r1.question("Enter the folder location: ", (folderPath) => {
    r1.question("Enter the output CSV file path: ", (outputCsvFilePath) => {
      processCsv(csvFilePath, folderPath, outputCsvFilePath);
      r1.close();
    });
  });
});

function processCsv(csvFilePath, folderPath, outputCsvFilePath) {
  const productDetailsArray = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", (row) => {
      productDetailsArray.push(row);
    })
    .on("end", () => {
      fs.readdir(folderPath, async (err, directories) => {
        if (err) {
          console.error("Error reading main directory:", err);
          return;
        }

        const outputData = [];

        await Promise.all(
          directories.map(async (deviceModel) => {
            const deviceFolderPath = path.join(folderPath, deviceModel);

            return new Promise((resolve, reject) => {
              fs.readdir(deviceFolderPath, (err, files) => {
                if (err) {
                  console.error(`Error reading folder ${deviceModel}:`, err);
                  return reject(err);
                }

                if (files.length !== productDetailsArray.length) {
                  console.error(
                    `Mismatch in number of images and CSV rows for ${deviceModel}`
                  );
                  return reject(
                    new Error("Mismatch in number of images and CSV rows")
                  );
                }

                files.forEach((file, index) => {
                  const info = productDetailsArray[index];

                  const newFileName = `${info["Product title"]
                    .replace(/ /g, "_")
                    .replace("{{deviceName}}", deviceModel)}.jpg`;
                  const oldFilePath = path.join(deviceFolderPath, file);
                  const newFilePath = path.join(deviceFolderPath, newFileName);

                  fs.rename(oldFilePath, newFilePath, (err) => {
                    if (err) {
                      console.error("Error renaming file:", err);
                      return reject(err);
                    }
                  });

                  const shopifyProductHandle = info["Product title"]
                    .replace("{{deviceName}}", deviceModel)
                    .replace(/ /g, "-");
                  const shopifyProductLink = info["Product title"]
                    .replace("{{deviceName}}", deviceModel)
                    .replace(/ /g, "_");

                  outputData.push({
                    Handle: shopifyProductHandle,
                    Title: info["Product title"].replace(
                      "{{deviceName}}",
                      deviceModel
                    ),
                    "Body (HTML)": info["Product description"].replace(
                      "{{deviceName}}",
                      deviceModel
                    ),
                    "Variant Price": price,
                    "Variant Compare At Price": compareAtPrice,
                    "Variant Inventory Qty": 50,
                    "Image Position": 1,
                    "Image Src": `https://cdn.shopify.com/s/files/1/0663/2705/2466/files/${shopifyProductLink}.jpg`,
                    "Image Alt Text":
                      info["Product title"].replace(
                        "{{deviceName}}",
                        deviceModel
                      ) + " 1",
                    Collection: "All",
                    Tags: deviceModel,
                    ...fixedInfo,
                    "Option1 Name": "Material",
                    "Option1 Value": "metal case",
                    "Option1 Linked To":
                      "product.metafields.shopify.bag-case-material",
                    "Bag/Case material (product.metafields.shopify.bag-case-material)":
                      "metal case",
                  });
                });

                resolve();
              });
            });
          })
        );

        if (outputData.length > 0) {
          stringify(outputData, { header: true }, (err, output) => {
            if (err) {
              console.error("Error writing CSV:", err);
              return;
            }
            fs.writeFileSync(outputCsvFilePath, output);
            console.log("CSV file updated successfully!");
          });
        }
      });
    });
}
