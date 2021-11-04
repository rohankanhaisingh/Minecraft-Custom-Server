const fs = require("fs"),
    path = require("path"),
    colors = require("colors"),
    pToJSON = require("properties-to-json"),
    yaml = require("js-yaml"),
    jsonToYaml = require("json2yaml");

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

/**
 * Gets any properties file in the provided execution directory.
 * @param {Function} callback 
 */
function getPropertiesFile(callback) {

    const mainDir = fs.readdirSync(main.mainExecutionPath, { encoding: "utf-8" });

    let parsedData = null,
        filePath = null;

    if (mainDir.includes("Server")) {

        const serverDirectories = fs.readdirSync(path.join(main.mainExecutionPath, "Server"), { encoding: "utf-8" });

        serverDirectories.forEach(function (dir) {

            const dirContent = fs.readdirSync(path.join(main.mainExecutionPath, "Server", dir));

            dirContent.forEach(function (content) {

                if (content.endsWith(".properties")) {

                    const fileData = fs.readFileSync(path.join(main.mainExecutionPath, "Server", dir, content), {encoding: "utf-8"});

                    filePath = path.join(main.mainExecutionPath, "Server", dir, content);

                    parsedData = pToJSON(fileData);

                }

            });

        });

    };

    return {
        parsedData: parsedData,
        filePath: filePath
    };
}

/**
 * Saves JSON to properties.
 * @param {string} filePath
 * @param {object} data
 */
function saveJSONProperties(filePath, data) {

    if (typeof filePath !== "string" && typeof data !== "object") return null;

    // Check if path exist.
    if (!fs.existsSync(filePath)) return null;

    let formattedData = "";

    for (let key in data) {
        formattedData += `${key}:${data[key]}\n`;
    }

    fs.writeFileSync(filePath, formattedData, { encoding: "utf-8" });

    console.log(`Wrote new data in file '${filePath}'.`.gray);

    return formattedData;
}

function getConfigData() {

    const mainDir = fs.readdirSync(main.mainExecutionPath, { encoding: "utf-8" });

    let parsedData = null,
        filePath = null;

    if (mainDir.includes("Server")) {

        const serverDirectories = fs.readdirSync(path.join(main.mainExecutionPath, "Server"), { encoding: "utf-8" });

        serverDirectories.forEach(function (dir) {

            const dirContent = fs.readdirSync(path.join(main.mainExecutionPath, "Server", dir));

            dirContent.forEach(function (content) {

                if (content === "config.yml") {

                    const fileData = fs.readFileSync(path.join(main.mainExecutionPath, "Server", dir, content), { encoding: "utf-8" });

                    filePath = path.join(main.mainExecutionPath, "Server", dir, content);

                    parsedData = yaml.load(fileData);

                }

            });

        });

    };

    return {
        parsedData: parsedData,
        filePath: filePath
    }
}

function saveConfigFile(filePath, data) {

    if (typeof filePath !== "string" && typeof data !== "object") return null;

    // Check if path exist.
    if (!fs.existsSync(filePath)) return null;

    const formattedData = jsonToYaml.stringify(data);

    fs.writeFileSync(filePath, formattedData, { encoding: "utf-8" });

    console.log(`Wrote new data in file '${filePath}'.`.gray)

    return formattedData;
}

module.exports = {
    check: check,
    getPropertiesFile: getPropertiesFile,
    saveJSONProperties: saveJSONProperties,
    getConfigData: getConfigData,
    saveConfigFile: saveConfigFile
}