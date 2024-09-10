const readline = require("readline");
const readDeviceName = require("./readDeviceName");
const readCSVFile = require("./readCSVFile");
const fixedInfo = require("./fixedinfo");
const { stringify } = require("csv-stringify");
const processCsv = require("./newtest");
const fs = require("fs");

const filePath = "product_test_heading.csv";

const r1 = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const deviceInformation = [];
const userInput = {};
const commonImageCount = 6;
let excelHeaders;
const variant = ["hard-plastic", "metal-case"];
const commonPreviewCount = 4;
const variantPreviewCount = 2;

r1.question("Title: ", (title) => {
  userInput.title = title;
  r1.question("Description: ", (description) => {
    userInput.description = description;
    r1.question("Additional Information: ", (additionalInfo) => {
      userInput.additionalInfo = additionalInfo;
      readDeviceName(title, (deviceName) => {
        r1.close();
        processDeviceInformation(deviceName);
        // Now, read the CSV file
        readCSVFile(filePath)
          .then((columnNames) => {
            excelHeaders = columnNames;
            // Now, Add the Product Information to the Excel in next row
            const productDetailsArray = [];
            deviceInformation.forEach((info) => {
              let productDetails = {};
              // Traverse Till the common Image Count
              for (let i = 0; i < 4; i++) {
                const urlPrefixFromTitle = info.title.replace(/ /g, "-");
                // .toLowerCase();
                const imageUrlPrefix = info.title.replace(/ /g, "-");
                // .toLowerCase();
                const userTitleWithoutDevice = userInput.title.replace(
                  "{{deviceName}}",
                  ""
                );

                const replaceDeviceNameForAdditionalInfo =
                  info.additionalInfo.replace("{{deviceName}}", info.device);

                //Remove space and replaced with _
                const urlPrefix = userTitleWithoutDevice.replace(/ /g, "_");

                if (i === 0) {
                  productDetails = {
                    ...fixedInfo,
                    "new custom description (product.metafields.custom.new_custom_description)":
                      replaceDeviceNameForAdditionalInfo,
                    Handle: urlPrefixFromTitle,
                    Title: info.title,
                    "Body (HTML)": info.description,
                    "Additional Information": info.additionalInfo,
                    "Variant Price": 199,
                    "Variant Compare At Price": 399,
                    "Variant Inventory Qty": 50,
                    "Image Position": i + 1,
                    "Image Src": `https://cdn.shopify.com/s/files/1/0663/2705/2466/files/${imageUrlPrefix}-1.jpg`,
                    "Image Alt Text": `${info.title} ${i + 1}`,
                    "Option1 Value": variant[0],
                    "Option1 Linked To":
                      "product.metafields.shopify.bag-case-material",
                    "Bag/Case material (product.metafields.shopify.bag-case-material)":
                      variant.join("; "),
                    "Variant Image": `https://cdn.shopify.com/s/files/1/0663/2705/2466/files/${imageUrlPrefix}-1.jpg`,
                    Collection: "All",
                    Tags: info.device,
                  };
                }
                // else if (i === 1) {
                //   productDetails = {
                //     Handle: urlPrefixFromTitle,
                //     "Option1 Value": variant[1],
                //     "Variant Grams": 0,
                //     "Variant Inventory Tracker": "shopify",
                //     "Variant Inventory Qty": 5,
                //     "Variant Inventory Policy": "deny",
                //     "Variant Fulfillment Service": "manual",
                //     "Variant Price": 249,
                //     "Variant Compare At Price": 499,
                //     "Variant Requires Shipping": true,
                //     "Variant Taxable": true,
                //     "Image Src": `https://cdn.shopify.com/s/files/1/0663/2705/2466/files/${imageUrlPrefix}-2.jpg`,
                //     "Image Alt Text": `${info.title} ${i + 1}`,
                //     "Image Position": i + 1,
                //     "Variant Image": `https://cdn.shopify.com/s/files/1/0663/2705/2466/files/${imageUrlPrefix}-2.jpg`,
                //     Tags: info.title,
                //   };
                // }
                else {
                  let newFileName = title
                    .replace("{{deviceName}} ", "")
                    .replace("{{deviceName}}", "")
                    .replace(" {{deviceName}} ", "");
                  newFileName = newFileName.replace("for ", "");
                  const removeFor = newFileName + ` Studio Shoot ${i + 1}.jpg`;
                  //If more than 1 space is there, then replace it with a single space
                  const onlySingleSpace = removeFor.replace(/\s+/g, " ");
                  const replaceSpaceWithDash = onlySingleSpace.replace(
                    / /g,
                    "-"
                  );
                  //Create alt text without .jpg
                  const altText = replaceSpaceWithDash.replace(".jpg", "");
                  productDetails = {
                    Handle: urlPrefixFromTitle,
                    "Image Src": `https://cdn.shopify.com/s/files/1/0663/2705/2466/files/${replaceSpaceWithDash}`,
                    "Image Alt Text": `${altText}`,
                    "Image Position": i + 1,
                  };
                }
                productDetailsArray.push(productDetails);
              }
            });

            // Write the productDetails to the CSV
            processCsv(productDetailsArray);
          })
          .catch((error) => {
            console.error(error);
          });
      });
    });
  });
});

const processDeviceInformation = (deviceName) => {
  deviceName.forEach((device, index) => {
    const title = userInput.title.replace("{{deviceName}}", device);
    const rawTitle = userInput.title;
    const description = userInput.description.replace("{{deviceName}}", device);
    const additionalInfo = userInput.additionalInfo.replace(
      "{{deviceName}}",
      device
    );
    deviceInformation.push({
      title,
      description,
      additionalInfo,
      device,
      rawTitle,
    });

    deviceInformation.forEach((info) => {
      console.log("Title: ", info.title);
      console.log("Description: ", info.description);
      console.log("Additional Information: ", info.additionalInfo);
    });
  });
};
