const fs = require("fs"),
    path = require("path"),
    colors = require("colors"),
    pToJSON = require("properties-to-json"),
    yaml = require("js-yaml"),
    jsonToYaml = require("json2yaml"),
    electron = require("electron"),
    ProgressBar = require("electron-progressbar"),
    mega = require("megajs"),
    extract = require("extract-zip"),
    open = require("open");

const history = require("../history"),
    main = require("./main"),
    appData = require("../appdata");


let downloadProgressBar = null;

async function sleep(timeout) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, timeout);
    });
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
    if (!fs.existsSync(filePath)) return false;

    let formattedData = "";

    for (let key in data) {
        formattedData += `${key}=${data[key]}\n`;
    }

    fs.writeFileSync(filePath, formattedData, { encoding: "utf-8" });

    history.writeNewData("App", "log", `Wrote new data in file '${filePath}'.`).log();

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

    history.writeNewData("App", "log", `Wrote new data in file '${filePath}'.`).log();

    return formattedData;
}

/**@returns {Array} */
function getAvailableVersions() {

    if (fs.existsSync(path.join(__dirname, "versions.json"))) return JSON.parse(fs.readFileSync(path.join(__dirname, "versions.json"), { encoding: "utf-8" }));

    return null;
}

/**
 * Download server files.
 * @param {string} location
 * @param {string} url
 */
async function downloadServerFiles(location, url, callback) {

    downloadProgressBar = new ProgressBar({
        text: "Preparing to download...",
        detail: "Fetcing " + url,
        indeterminate: false,
        closeOnComplete: false,
    });

    await sleep(2000);

    downloadProgressBar.text = "Downloading file...";

    const streamFile = mega.File.fromURL(url);

    const fileAttributes = streamFile.loadAttributes(function (err, file) {

        let stream = streamFile.download(),
            writeStream = fs.createWriteStream(path.join(location, file.name), { encoding: "utf-8" }),
            receivedBytes = 0,
            fileSize = file.size;

        stream.pipe(writeStream);


        stream.on("data", function (chunk) {

            const percentage = (100 / fileSize * receivedBytes).toFixed(1);

            receivedBytes += chunk.length;

            downloadProgressBar.value = 100 / fileSize * receivedBytes;

            downloadProgressBar.detail = `Downloaded ${percentage}%. ${receivedBytes} / ${fileSize} bytes.`;
        });

        stream.on("end", async function () {

            downloadProgressBar.setCompleted();

            downloadProgressBar.title = "Preparing to extract...";
            downloadProgressBar.detail = "Waiting for " + path.join(location, file.name);

            downloadProgressBar.value = 0;

            sleep(2000);

            downloadProgressBar.title = "Extracting...";
            downloadProgressBar.detail = "Working...";

            try {
                const extracting = await extract(path.join(location, file.name), {
                    dir: location
                });

                fs.rmSync(path.join(location, file.name));

                downloadProgressBar.close();

                if (typeof callback === "function") callback(null, {
                    installedFilePath: path.join(location, file.name)
                });
            } catch (err) {

                if (typeof callback === "function") callback(err.message);

            }
        });

    });
}

/**
 * Prepares to install or allocate required server files. 
 * @param {object} responseData
 * @param {Function} cb
 */
async function prepareInstallation(responseData, callback) {

    const selectedVersion = responseData.serverVersion,
        selectedPath = responseData.serverInstallationPath,
        availableVersions = getAvailableVersions(),
        config = appData.initialize();

    let foundVersion = null;

    // Get selected version in list of all available versions.
    availableVersions.forEach(v => foundVersion = v.version === selectedVersion ? v : null);

    // If selected version is not found, return an error.
    if (foundVersion === null) return new Error(`Version '${selectedVersion}' has not been found out of all available versions.`);

    // Check if the select path exist or not. If it doesn't, return an error.
    if (!fs.existsSync(selectedPath)) return new Error(`The selected path '${selectedPath}' cannot be found or may be secured. Please try again.`);

    // Store directory content into variable.
    const dir = fs.readdirSync(selectedPath);

    // Check if the server files directory exist or not.
    if (dir.includes(foundVersion.dirName)) {
        // Found directory! Now let's check if the validation file exist as well.

        // If file-validator file does not exist, return an error.
        if (!fs.existsSync(path.join(selectedPath, foundVersion.dirName, "ValidateFiles.js"))) return new Error(`Hmmm. So I already found '${path.join(selectedPath, foundVersion.dirName)}' that SHOULD contain all the server execution files including the file-validator (ValidateFiles.js) but I cannot find that file. Please make sure to have all the files correct installed. `);

        // Load file-validator as module.
        const validator = require(path.join(selectedPath, foundVersion.dirName, "ValidateFiles.js"));

        // Initialise process.
        const validationResponse = validator.init();

        // Set all values into user config file.

        config.server.path = selectedPath;

        appData.overWriteData(config);
        return true;
    }

    // Show comfirm prompt.
    const dialogResponse = electron.dialog.showMessageBoxSync({
        title: "File Installation",
        icon: path.join(__dirname, "../../../", "data", "view", "data", "icons", "windows", "cumpoopandshit.ico"),
        type: "info",
        buttons: [`Yes, automatically (${foundVersion.publicSize})`, `Yes, manually (${foundVersion.publicSize})`, "No lol", "Cancel"],
        message: `No directory found including server files. It may exist but has been renamed. Would you like to download and install all the required files for version ${selectedVersion}?`
    });

    switch (dialogResponse) {
        case 0:

            await downloadServerFiles(selectedPath, foundVersion.url, function (err, res) {

                config.server.path = path.join(selectedPath, foundVersion.dirName);

                appData.overWriteData(config);

                if (typeof callback === "function") callback(err, res);

            });

            break;
        case 1:

            open(foundVersion.url);

            break;
    }
}

module.exports = {
    getPropertiesFile: getPropertiesFile,
    saveJSONProperties: saveJSONProperties,
    getConfigData: getConfigData,
    saveConfigFile: saveConfigFile,
    getAvailableVersions: getAvailableVersions,
    prepareInstallation: prepareInstallation,
    downloadProgressBar: downloadProgressBar
}