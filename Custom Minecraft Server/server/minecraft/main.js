const fs = require("fs");

let mainExecutionPath = null;

const processes = {
    host: null,
    lobby: null,
    bungee: null
}

function setExecutionPath(path) {

    if (fs.existsSync(path)) {
        mainExecutionPath = path;

        return mainExecutionPath;
    }

    throw new Error(`The provided path '${path}' does not exist.`);
}

module.exports = {
    mainExecutionPath: mainExecutionPath,
    processes: processes,
    setExecutionPath: setExecutionPath
}