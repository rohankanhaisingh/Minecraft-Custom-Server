const socket = require("../socketServer");
const main = require("./main"),
    history = require("../history");

/**
 * Copied from https://stackoverflow.com/questions/19793221/javascript-text-between-double-quotes
 * Extract every string.
 * @param {string} str
 */
function extractAllText(str) {
    const re = /"(.*?)"/g;
    const result = [];
    let current;
    while (current = re.exec(str)) {
        result.push(current.pop());
    }
    return result.length > 0
        ? result
        : [str];
}

/**
 * Formats Ngrok output data.
 * @param {string} data
 */
function formatNgrokData(data) {

    const level = data.substring(data.indexOf("lvl") + 4).split(" ")[0],
        message = extractAllText(data.substring(data.indexOf("msg") + 4)).join(". ");

    return {
        type: level === "info" ? "log" : level,
        message: message
    }
}

function formatSpigotData(text) {

    const time = text.substring(0, text.indexOf("]") + 1),
        type = text.substring(time.length + 2).split("]")[0].split("/")[1],
        message = text.substring(time.length + 1)

    return {
        time: typeof time === "string" ? time : 0,
        type: typeof type === "string" ? type.toLowerCase() : "log",
        message: message.length > 0 ? message : "log",
        stream: "Spigot"
    }
}

/**
 * Formats Bungee output data.
 * @param {string} data
 */
function formatBungeeData(data) {

    let time = data.split(" ")[0],
        type = data.substring(data.indexOf("[") + 1, data.indexOf("]")).toLowerCase(),
        message = data.substring(time.length + type.length + 4);

    return {
        time: time,
        type: type,
        message: message
    }
}

function listen(callback) {

    main.processes.on("ngrok.logEvent", function (data) {

        let newData = formatNgrokData(data);

        callback({
            stream: "ngrok",
            type: newData.type,
            data: newData.message
        });

        history.writeNewData("Ngrok", newData.type, newData.message).log();

    });

    main.processes.on("ngrok.statusChange", function (data) {

        callback({
            stream: "ngrok",
            type: "log",
            data: `Status: '${data}'.`
        });

        history.writeNewData("Ngrok", "log", `Status: '${data}'.`).log();

    });

    main.processes.on("bungeeCord.stdout", function (data) {

        const newData = formatBungeeData(data);

        const x = {
            stream: "BungeeCord",
            type: newData.type,
            data: newData.message
        }

        switch (x.type) {
            case "servere":
                x.type = "error";
                break;
            case "warning":
                x.type = "warn";
                break;
        }

        callback(x);

        history.writeNewData("Bungee", x.type, newData.message).log();
    });

    main.processes.on("bungeeCord.stderr", function (data) {

        const x = {
            stream: "BungeeCord",
            type: "error",
            data: data
        }

        callback(x);

        history.writeNewData("Bungee", x.type, newData.message).log();

    });

    main.processes.on("lobby.stdout", function (data) {

        const newData = formatSpigotData(data);

        callback(newData);

        history.writeNewData("Spigot", newData.type, newData.message).log();
        
    });

    main.processes.on("lobby.stderr", function (data) {

        console.log(data);

    });
}

module.exports = {
    listen: listen
}