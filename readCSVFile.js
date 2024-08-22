const fs = require("fs");
const { parse } = require("csv-parse");

function readCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    let columnNames;

    fs.createReadStream(filePath)
      .pipe(parse({ delimiter: "," }))
      .on("data", (row) => {
        // Only for the first row
        if (!columnNames) {
          columnNames = row;
          resolve(columnNames);
        }
      })
      .on("error", (error) => {
        reject(error);
      })
      .on("end", () => {
        if (!columnNames) {
          reject(new Error("No data found in CSV file"));
        }
      });
  });
}

module.exports = readCSVFile;
