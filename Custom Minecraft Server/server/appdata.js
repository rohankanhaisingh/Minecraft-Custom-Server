const fs = require("fs"),
    path = require("path"),
    url = require("url"),
    colors = require("colors");

const applicationName = "Minecraft - Custom Server",
    appDataFolder = process.env.APPDATA;

// Function to check if the main application folder exists.
function checkFolderExistance() {

    const dirs = fs.readdirSync(appDataFolder);

    // Returns state, either true or false.
    return dirs.includes(applicationName);
}

// Function to create a AppData directory template.
function createAppDataTemplate() {

    console.log(`No application data directory found in ${appDataFolder}. Generating a new one...`.yellow);

    // Create directories in provided path.
    fs.mkdirSync(path.join(appDataFolder, applicationName));
    fs.mkdirSync(path.join(appDataFolder, applicationName, "Application Data"));

    // Server configuration template.
    const serverConfig = {
        serverPort: 8000,
        channel: 142,
        useChromiumExtension: true,
        nodeVersion: "14.18.0^ & 16.10.0"
    }

    // Write files.
    fs.writeFileSync(path.join(appDataFolder, applicationName, "Application Data", "history.json"), "[]", { encoding: "utf-8" });
    fs.writeFileSync(path.join(appDataFolder, applicationName, "Application Data", "server.json"), JSON.stringify(serverConfig), { encoding: "utf-8" });

    console.log(`Wrote 2 new fileSs) in ${path.join(appDataFolder, applicationName, "Application Data")}`.gray);

    // Return data from called function.
    return createUserDataFileTemplate();
}

// Creates a configuration file.
function createUserDataFileTemplate() {

    // Get the template.
    const templateFile = require("../data/templates/ApplicationData.json");

    // Write the template.
    fs.writeFileSync(path.join(appDataFolder, applicationName, "Application Data", "configuration.json"), JSON.stringify(templateFile, null, 2), { encoding: "utf-8" });

    console.log(`Wrote 1 new file(s) in ${path.join(appDataFolder, applicationName, "Application Data")}`.gray);



    // Return the template file data.
    return templateFile;
}

/* ========== Public functions ========== */
function initialize() {

    console.log("Initializing application data...".yellow);


    // Check if main directory exists.
    const folderExists = checkFolderExistance();

    // If it doesn't exist, create the necessary files and directories.
    if (!folderExists) return createAppDataTemplate();

    if (!fs.existsSync(path.join(appDataFolder, applicationName, "Application Data", "configuration.json"))) return null;

    // Read the configuration file.
    const configFile = fs.readFileSync(path.join(appDataFolder, applicationName, "Application Data", "configuration.json"), { encoding: "utf-8" });

    // Return the JSON formatted data.
    return JSON.parse(configFile);
}

/**
 * Overwrites data in the configurations file.
 * @param {string} newData
 * @param {Function} callback
 */
function overWriteData(newData, callback) {

    // Get the existing data.
    const data = initialize();

    const fileLocation = path.join(appDataFolder, applicationName, "Application Data", "configuration.json");

    // Loop through new data.
    for (let key in newData) {

        // Overwrite if newdata contents are not equal to existing data.
        if (data[key] !== newData[key]) {
            data[key] = newData[key];
        }

    }

    // Write the new formatted data into the configurations file.
    fs.writeFileSync(fileLocation, JSON.stringify(data, null, 2), { encoding: "utf-8" });

    console.log(`Wrote new file(s) in ${fileLocation}.`.yellow);

    if (typeof callback == "function") callback(data);

    // Return the new formatted data.
    return data;
}

/**
 * Get a file in the appdata directory.
 * @param {string} location
 */
function getFileContents(location) {

    if (!fs.existsSync(path.join(appDataFolder, applicationName, location))) return false;

    const fileStat = fs.lstatSync(path.join(appDataFolder, applicationName, location));

    if (!fileStat.isFile()) return false;

    const file = fs.readFileSync(path.join(appDataFolder, applicationName, location), { encoding: "utf-8" });

    return {
        content: file,
        formatted: JSON.parse(file)
    }
}

/**
 * Gets and resolves file location in application directory.
 * @param {string} location
 */
function getFileLocation(location) {

    if (!fs.existsSync(path.join(appDataFolder, applicationName, location))) return;

    return path.join(appDataFolder, applicationName, location);
}

function removeAppdataContents() {

    if (!fs.existsSync(path.join(appDataFolder, applicationName))) return new Error("Cannot find requested directory.");

    fs.rmSync(path.join(appDataFolder, applicationName), {recursive: true, force: true});

}

module.exports = {
    initialize: initialize,
    overWriteData: overWriteData,
    getFileContents: getFileContents,
    getFileLocation: getFileLocation,
    removeAppdataContents: removeAppdataContents
}