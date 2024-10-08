const readDeviceName = (title, callback) => {
  try {
    const readline = require("readline");
    const r1 = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    let designName = "";
    const deviceName = [];
    r1.question("Enter the folder location: ", (folderLocation) => {
      designName = folderLocation;
      r1.close();
    });

    r1.on("close", () => {
      const fs = require("fs");
      fs.readdir(designName, (err, files) => {
        if (err) {
          console.log("Error in reading the folder location");
        } else {
          files.forEach((file) => {
            if (fs.statSync(`${designName}/${file}`).isDirectory()) {
              //If folder name is Common, then skip it
              if (file === "Common" || file === "common") {
                const folderPath = `${designName}/${file}`;
                const files = fs.readdirSync(folderPath);

                //Check if the folder contains the images in jpg format
                const jpgFiles = files.filter((file) => file.includes(".jpg"));

                //Iterate through the jpg files and rename it with the title with the device name with index+1
                jpgFiles.forEach((childFileName, index) => {
                  //Remove "for" and "device name" from the title
                  let newFileName = title
                    .replace("{{deviceName}} ", "")
                    .replace("{{deviceName}}", "")
                    .replace(" {{deviceName}} ", "");
                  console.log("New File Name1: ", newFileName);
                  newFileName = newFileName.replace("for ", "");
                  console.log("New File Name2: ", newFileName);
                  const removeFor =
                    newFileName + ` Studio Shoot ${index + 2}.jpg`;

                  //If more than 1 space is there, then replace it with a single space
                  const onlySingleSpace = removeFor.replace(/\s+/g, " ");

                  const replaceSpaceWithDash = onlySingleSpace.replace(
                    / /g,
                    "-"
                  );

                  //Rename the file
                  fs.renameSync(
                    `${folderPath}/${childFileName}`,
                    `${folderPath}/${replaceSpaceWithDash}`
                  );
                });
                return;
              }

              //Before pushing the device name, Iterate through the folder and check if the folder contains the images then rename with the device name
              //Iterate through the folder
              const folderPath = `${designName}/${file}`;
              const files = fs.readdirSync(folderPath);

              //Check if the folder contains the images in jpg format
              const jpgFiles = files.filter((file) => file.includes(".jpg"));

              //Iterate through the jpg files and rename it with the title with the device name with index+1
              jpgFiles.forEach((childFileName, index) => {
                //Replace {{deviceName}} with the device name
                // const newFileName =
                //   title.replace("{{deviceName}}", `${file} ${index + 1}`) +
                //   ".jpg";
                const newFileName = title.replace("{{deviceName}}", `${file}`);
                //Add Index+1 to the title
                const addIndexName = newFileName + ` ${index + 1}`;
                const replaceSpaceWithDash =
                  addIndexName.replace(/ /g, "-") + ".jpg";

                fs.renameSync(
                  `${folderPath}/${childFileName}`,
                  `${folderPath}/${replaceSpaceWithDash}`
                );
              });

              deviceName.push(file);
            }
          });
          callback(deviceName);
        }
      });
    });
  } catch (e) {
    console.error(e);
  }
};

module.exports = readDeviceName;
