// Import necessary modules.
const fs = require("fs"),
    electron = require("electron"),
    path = require("path"),
    url = require("path"),
    colors = require("colors");

const app = require("../app");

const { writeNewData, getHistoryContents } = require("./history");

const launch = require("./minecraft/launchServer"),
    { overWriteData } = require("./appdata"),
    { check, saveJSONProperties, getPropertiesFile } = require("./minecraft/checkServerFiles"),
    main = require("./minecraft/main"),
    { processes } = require("./minecraft/main"),
    listeners = require("./minecraft/createListeners");

// Import 'dialog' object from imported Electron module.
const { dialog, BrowserWindow, ipcMain } = electron;

let activeSocket = null;

/**
 * Listen for SocketIO events.
 * @param {socketio.Client} socket
 * @param {BrowserWindow} window
 */
function listen(socket, window) {

    activeSocket = socket;

    // Event from the client to create a application warning box.
    socket.on("app:warningDialogClientSide", function (args) {

        dialog.showMessageBox(window, {
            title: typeof args.title !== "undefined" ? args.title : "Minecraft: Custom Server",
            type: "warning",
            message: typeof args.message !== "undefined" ? args.message : "Something went wrong!",
            detail: typeof args.detail !== "undefined" ? args.detail : "Bruh, something broke. Idk what you did lol"
        });

    });

    socket.on("app:applychanges", function (res) {

        const mainPath = path.join(main.mainExecutionPath, "Server", "lobby", res.fileName);

        const existingData = getPropertiesFile().parsedData;
        const newData = res.data;

        for (let key in newData) {

            for (let existingKey in existingData) {

                if (existingKey === key) {

                    if (existingData[key] !== newData[key]) {
                        existingData[key] = newData[key];
                    }

                }
            }

        }

        const saveState = saveJSONProperties(mainPath, existingData);

        socket.emit("app_respnse:applychanges", {
            res: res,
            data: saveState
        });
    });

    socket.on("app:getPropertiesFile", function () {

        const file = getPropertiesFile();

        socket.emit("app_response:getPropertiesFile", file);

    });

    socket.on("app:getServerState", function () {

        socket.emit("app_response:getServerState", {
            host: processes.host,
            lobby: processes.lobby === null ? null : "ChildProcess<Spigot>",
            bungee: processes.bungee === null ? null : "ChildProcess<BungeeCord>",
            executionPath: processes._execution.path
        });

    });

    socket.on("app:startserver", function (data) {

        launch.checkFormat(data, async function (err, response) {

            if (err) {

                dialog.showMessageBox(window, {
                    title: "An error has occurred",
                    type: "error",
                    message: `failed to launch server.`,
                    detail: err.message
                });

                socket.emit("app:error", {
                    title: "An error has occurred",
                    message: `Failed to launch server.`,
                    detail: err.message
                });

                return;
            }

            console.log(`Found java version ${response.version}.`.green);

            // Creating event listeners
            listeners.listen(function (res) {

                socket.emit("app:serverState", res);

                socket.broadcast.emit("app:serverState", res);

            });

            const threads = await main.executeThreads(main.mainExecutionPath, data.launch.ramUsage);

            socket.emit("app_response:runningServer", {
                host: processes.host,
                timestamp: Date.now()
            });
        });

    });

    socket.on("app:getServerPropertiesTemplate", function (args) {

        const propertiesTemplateFile = fs.readFileSync(path.join(__dirname, "../", "data", "details", "ServerInfo.json"), {encoding: "utf-8"});


        socket.emit("app_response:getServerPropertiesTemplate", {
            data: propertiesTemplateFile,
            timestamp: Date.now()
        });
    });

    socket.on("app:setup:checkInputFields", function (data) {

        let isValid = false;

        let errorCodes = [];

        for (let key in data) {

            switch (key) {
                case "server:path":

                    if (!fs.existsSync(data[key])) {
                        errorCodes.push(`Path '${data[key]}' does not exit. Please enter the correct path.`);
                    }

                    break;
            }

        }

        if (errorCodes.length == 0) {

            check(data, function (res) {

                switch (res.state) {
                    case "ready":

                        const tempObj = {
                            path: data["server:path"],
                            token: data["server:token"],
                            name: data["server:name"] === null ? "A cool Minecraft Server" : data["server:name"],
                            owner: data["server:owner"] === null ? "Admin" : data["server:owner"],
                            modt: data["server:motd"] === null ? "MOTD" : data["server:motd"],
                            output: data["app:outputpath"] === null ? data["server:path"] : data["app:outputpath"],
                        }

                        overWriteData({ server: tempObj }, function () {

                            socket.emit("app:changepage", "main");

                        });

                        break;
                }

            });

        } else {

            dialog.showMessageBox(window, {
                title: "An error has occurred",
                type: "warning",
                message: `Something went wrong while executing the program.`,
                detail: errorCodes.join("\n")
            });

            socket.emit("app_response:setup:checkInputFields", errorCodes);
        }

    });

    socket.on("app:getHistoryContent", function (args) {

        const type = args.type;

        const historyData = getHistoryContents();

        if (type === null) {

            socket.emit("app_response:getHistoryContent", historyData.content);

            return;
        }

        socket.emit("app_response:getHistoryContent", historyData.filterByType(type));

    });

    socket.on("app:executionCommands", function (args) {

        let executionReturnValue = null;

        switch (args.target) {

            case "process":

                executionReturnValue = null;

                try {
                    executionReturnValue = eval(args.executionData);
                } catch (err) {
                    executionReturnValue = {
                        type: "error",
                        message: err.message
                    };
                }

                socket.emit("app_response:executionCommands", {
                    data: executionReturnValue,
                    timestamp: Date.now(),
                    emitter: "process",
                });

                break;
            case "bungee":

                executionReturnValue = null;

                try {
                    executionReturnValue = main.processes.bungee.writeIntoProcess(args.executionData);
                } catch (err) {
                    executionReturnValue = {
                        type: "error",
                        message: err.message
                    };
                }

                socket.emit("app_response:executionCommands", {
                    data: executionReturnValue,
                    timestamp: Date.now(),
                    emitter: "process",
                });

                break;
            case "spigot":

                try {
                    executionReturnValue = main.processes.lobby.writeIntoProcess(args.executionData);
                } catch (err) {
                    executionReturnValue = {
                        type: "error",
                        message: err.message
                    };
                }

                socket.emit("app_response:executionCommands", {
                    data: executionReturnValue,
                    timestamp: Date.now(),
                    emitter: "process",
                });

                break;
        }

    });
}

module.exports = {
    listen: listen,
    activeSocket: activeSocket
}