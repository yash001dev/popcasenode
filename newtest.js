const fs = require("fs");
const csv = require("csv-parser");
const { createObjectCsvWriter } = require("csv-writer");

// Define file paths
const inputCsvFile = "product_test_heading.csv";
const outputCsvFile = "new.csv";

function processCsv(existingData) {
  // Step 1: Read the first row from `product_test_heading.csv`
  let headers = [];

  fs.createReadStream(inputCsvFile)
    .pipe(csv())
    .on("headers", (headerList) => {
      headers = headerList;

      // Step 2: Create a new CSV file with the same headers
      const csvWriter = createObjectCsvWriter({
        path: outputCsvFile,
        header: headers.map((header) => ({ id: header, title: header })),
      });

      // Step 3: Map existing data to match the headers
      const dataToWrite = existingData.map((item) => {
        const newRow = {};

        headers.forEach((header) => {
          if (item.hasOwnProperty(header)) {
            newRow[header] = item[header];
          } else {
            newRow[header] = ""; // Fill with empty string if the column doesn't exist in the data
          }
        });

        return newRow;
      });

      // Step 4: Write the data to the new CSV file
      csvWriter
        .writeRecords(dataToWrite)
        .then(() => console.log("CSV file created successfully!"))
        .catch((err) => console.error("Error writing CSV file:", err));
    })
    .on("error", (err) => {
      console.error("Error reading the CSV file:", err);
    });
}

module.exports = processCsv;
