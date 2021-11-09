const path = require("path"),
    colors = require("colors"),
    fs = require("fs"),
    ad = require("./appdata");

function getHistoryContents() {

    /**@type {Array} */
    const historyFile = ad.getFileContents(path.join("Application Data", "history.json")).formatted;

    return {
        content: historyFile,
        /**
         * Filters entire history file by type.
         * @param {"log" | "warn" | "info" | "success" | "error"} keyword
         */
        filterByType: function (keyword) {

            const tempObj = [];

            let i = 0;

            while (i < historyFile.length) {

                const stream = historyFile[i];

                if (stream.type === keyword) tempObj.push(stream);

                i += 1;
            }

            return tempObj;
        },
        /**
         * Filters entire history file by stream name.
         * @param {any} keyword
         */
        filterByStreamName: function (keyword) {

            const tempObj = [];

            let i = 0;

            while (i < historyFile.length) {

                const stream = historyFile[i];

                if (stream.stream === keyword) tempObj.push(stream);

                i += 1;
            }

            return tempObj;

        }
    };
}

function initialize() {

    let existingData = ad.getFileContents(path.join("Application Data", "history.json")).formatted;

    existingData = [];

    const historyPath = ad.getFileLocation(path.join("Application Data", "history.json"));

    fs.writeFileSync(historyPath, JSON.stringify(existingData, null, 2));
}

/**
 * Writes new data into history file.
 * @param {string} historyStream Stream type, for example 'App', 'Spigot' or 'BungeeCord'.
 * @param {"log" | "error" | "warn" | "success" | "info"} historyType Content type, for example 'log', 'error', 'warning'.
 * @param {string} historyContent Main content.
 */
function writeNewData(historyStream, historyType, historyContent) {

    if (typeof historyStream !== "string" || typeof historyType !== "string" || typeof historyContent !== "string") throw new Error("One of the parameters are not a string type.");

    const existingData = getHistoryContents().content;

    existingData.push({
        stream: historyStream,
        type: historyType,
        content: historyContent,
        timestamp: Date.now()
    });

    const historyPath = ad.getFileLocation(path.join("Application Data", "history.json"));

    fs.writeFileSync(historyPath, JSON.stringify(existingData, null, 2));


    return {
        content: historyContent,
        log: function () {

            switch (historyType) {
                case "log":
                    console.log(`[${historyStream}]:`.bgRed.white + ` ${historyContent}`.gray);
                    break;
                case "info":
                    console.log(`[${historyStream}]:`.bgRed.white + ` ${historyContent}`.gray);
                    break;
                case "error":
                    console.log(`[${historyStream}]:`.bgRed.white + ` ${historyContent}`.red);
                    break;
                case "warn":
                    console.log(`[${historyStream}]:`.bgRed.white + ` ${historyContent}`.yellow);
                    break;
                case "success":
                    console.log(`[${historyStream}]:`.bgRed.white + ` ${historyContent}`.green);
                    break;
            }

            return this;
        }
    };
}

module.exports = {
    getHistoryContents: getHistoryContents,
    writeNewData: writeNewData,
    initialize: initialize
}