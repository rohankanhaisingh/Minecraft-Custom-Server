const fs = require("fs"),
    ngrok = require("ngrok"),
    appdata = require("../appdata"),
    path = require("path"),
    cp = require("child_process"),
    history = require("../history");

let mainExecutionPath = null;

const processes = {
    host: null,
    lobby: null,
    bungee: null,
    _execution: {
        path: null,
    },
    _events: {
        _ngrok: {},
        _lobby: {},
        _bungee: {}
    },
    /**
     * Event listener on any process.
     * @param {"ngrok.statusChange" | "ngrok.logEvent" | "bungeeCord.stdout" | "bungeeCord.stderr" | "bungeeCord.stdin" | "lobby.stdout" | "lobby.stderr" | "lobby.stdin"} event
     * @param {Function} callback
     */
    on: function (event, callback) {

        if (typeof callback !== "function") throw new Error("Given parameter (as callback) is not a function.");

        switch (event) {
            case "ngrok.logEvent":

                this._events._ngrok["onLogEvent"] = callback;

                return this;
                break;
            case "ngrok.statusChange":

                this._events._ngrok["onStatusChange"] = callback;

                return this;
                break;
            case "bungeeCord.stdout":

                this._events._bungee["stdout"] = callback;

                return this;
                break;
            case "bungeeCord.stdin":

                this._events._bungee["stdin"] = callback;

                return this;
                break;
            case "bungeeCord.stderr":

                this._events._bungee["stderr"] = callback;

                return this;
                break;
            case "lobby.stdout":

                this._events._lobby["stdout"] = callback;

                return this;
                break;
            case "lobby.stdin":

                this._events._lobby["stdin"] = callback;

                return this;
                break;
            case "lobby.stderr":

                this._events._lobby["stderr"] = callback;

                return this;
                break;
            default:

                throw new Error(`Event '${event}' is not a recognized event for this instance.`);

                return false;

                break;
        }

    }
}


async function executeThreads(executionPath, memory) {

    mainExecutionPath = executionPath;

    processes._execution.path = executionPath;

    console.log(processes._execution.path);

    const mainDir = fs.readdirSync(mainExecutionPath, { encoding: "utf-8" });

    const token = appdata.initialize().server.token;

    history.writeNewData("Ngrok", "log", `Intializing Ngrok client with token '${token}'.`).log();

    processes.host = await ngrok.connect({
        proto: "tcp",
        addr: 25565,
        authtoken: token === null ? null : token,
        region: "eu",
        binPath: p => p.replace(p, path.join(executionPath, "Server", "Ngrok")),
        onStatusChange: function (status) {

            if (typeof processes._events._ngrok["onStatusChange"] === "function") processes._events._ngrok["onStatusChange"](status);

        },
        onLogEvent: function (log) {

            if (typeof processes._events._ngrok["onLogEvent"] === "function") processes._events._ngrok["onLogEvent"](log);

        }
    });

    history.writeNewData("Ngrok", "success", `Succesfully created a Ngrok tunnel. Url: ${processes.host}.`).log();

    history.writeNewData("App", "warn", "Executing server processes... It may take a while.").log()

    const bungee = require(path.join(mainExecutionPath, "Server", "BungeeCord", "Execute.js"));

    processes.bungee = bungee.execute(memory, function (err, stdout, stdin) {
        if (stdout) if (typeof processes._events._bungee["stdout"] === "function") processes._events._bungee["stdout"](stdout);
        if (err) if (typeof processes._events._bungee["stderr"] === "function") processes._events._bungee["stderr"](err);
        if (stdin) if (typeof processes._events._bungee["stdin"] === "function") processes._events._bungee["stdin"](stdin);
    });

    const lobby = require(path.join(mainExecutionPath, "Server", "Lobby", "Execute.js"));

    processes.lobby = lobby.execute(memory, function (err, stdout, stdin) {

        if (stdout) if (typeof processes._events._lobby["stdout"] === "function") processes._events._lobby["stdout"](stdout);
        if (err) if (typeof processes._events._lobby["stderr"] === "function") processes._events._lobby["stderr"](err);
        if (stdin) if (typeof processes._events._lobby["stdin"] === "function") processes._events._lobby["stdin"](stdin);
    });

    return processes;
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
    setExecutionPath: setExecutionPath,
    executeThreads: executeThreads
}