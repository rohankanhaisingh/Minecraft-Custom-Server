const fs = require("fs"),
    path = require("path"),
    url = require("url"),
    colors = require("colors"),
    pToJSON = require("properties-to-json");

const main = require("./main");


/**
 * Check server files in selected directory.
 * @param {any} data
 * @param {any} callback
 */
function check(data, callback) {

    if (typeof data["server:path"] == "string") {
        if (fs.existsSync(data["server:path"])) {

            if (fs.existsSync(path.join(data["server:path"], "ValidateFiles.js"))) {

                const x = require(path.join(data["server:path"], "ValidateFiles.js"));

                x.init(callback);
                
            }

        }
    }

}

function getPropertiesFile(callback) {

    const mainDir = fs.readdirSync(main.mainExecutionPath, { encoding: "utf-8" });

    let parsedData = null;

    if (mainDir.includes("Server")) {

        const serverDirectories = fs.readdirSync(path.join(main.mainExecutionPath, "Server"), { encoding: "utf-8" });

        serverDirectories.forEach(function (dir) {

            const dirContent = fs.readdirSync(path.join(main.mainExecutionPath, "Server", dir));

            dirContent.forEach(function (content) {

                if (content.endsWith(".properties")) {

                    const fileData = fs.readFileSync(path.join(main.mainExecutionPath, "Server", dir, content), {encoding: "utf-8"});

                    parsedData = pToJSON(fileData);

                }

            });

        });

    };

    return parsedData;
}

module.exports = {
    check: check,
    getPropertiesFile: getPropertiesFile
}