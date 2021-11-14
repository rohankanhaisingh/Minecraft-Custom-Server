const fs = require("fs"),
    path = require("path"),
    url = require("url"),
    glob = require("glob"),
    colors = require("colors");

async function sleep(time) {

    return new Promise(function (resolve, reject) {
        setTimeout(function () {

            resolve();

        }, time);
    });

}

async function init(callback) {

    let errors = [];

    if (!fs.existsSync(path.join(__dirname, "Runtime", "files.json"))) {

        errors.push("Cannot load files.json.");

        return;
    }

    const validationFile = JSON.parse(fs.readFileSync(path.join(__dirname, "Runtime", "files.json"), {
        encoding: "utf-8"
    }));

    console.log(`Found files: ${validationFile.length}`.yellow);

    for (let i = 0; i < validationFile.length; i++) {

        const item = validationFile[i];

        const x = fs.existsSync(path.join(__dirname, item));

        if (!x) errors.push(item);
    }

    if (errors.length == 0) {
        console.log(`All files sucessfully has been validated.`.green);

        if (typeof callback == "function") {
            callback({
                state: "ready",
                filesLength: validationFile.length,
                timestamp: Date.now()
            });
        }

    } else {
        console.log(`'${errors.length}' file(s) are missing.\n\n${errors.join("\n")}`.red);

        if (typeof callback == "function") callback({
            state: "error",
            missingFiles: errors,
            loadedFiles: validationFile.length - errors.length,
            timestamp: Date.now()
        });
    }

    return errors;
}

module.exports = {
    init: init
}