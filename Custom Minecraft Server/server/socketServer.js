// Import necessary modules.
const fs = require("fs"),
    electron = require("electron"),
    path = require("path"),
    url = require("path"),
    colors = require("colors");

const app = require("../app");

const { writeNewData, getHistoryContents } = require("./history");

const launch = require("./minecraft/launchServer"),
    appData = require("./appdata"),
    fileManager = require("./minecraft/fileManager"),
    main = require("./minecraft/main"),
    { processes } = require("./minecraft/main"),
    listeners = require("./minecraft/createListeners");

// Import 'dialog' object from imported Electron module.
const {
    dialog,
    BrowserWindow,
    ipcMain,
    Notification
} = electron;

const $app = electron.app;

let activeSocket = null;

/**
 * Listen for SocketIO events.
 * @param {socketio.Client} socket
 * @param {BrowserWindow} window
 */
async function listen(socket, window) {

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

        const existingData = fileManager.getPropertiesFile().parsedData;
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

        const saveState = fileManager.saveJSONProperties(mainPath, existingData);

        socket.emit("app_respnse:applychanges", {
            res: res,
            data: saveState
        });
    });

    socket.on("app:getPropertiesFile", function () {

        const file = fileManager.getPropertiesFile();

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

    socket.on("app:prepareInstallation", async function (data) {

        const res = await fileManager.prepareInstallation(data, function (err, _res) {

            const wNotification = new Notification({
                title: "Installation completed",
                body: "Installation has succesfully been executed. Will restart application now..."
            });

            wNotification.show();

            $app.relaunch();
            $app.exit(0);

        });

        if (res instanceof Error) {

            socket.emit("apps_response:prepareInstallation", {
                type: "error",
                message: res.message
            });

            dialog.showMessageBox(window, {
                title: typeof res.title !== "undefined" ? res.title : "Minecraft: Custom Server",
                type: "error",
                message: "Bruh! Don't worry, you didn't break the app",
                detail: typeof res.message !== "undefined" ? res.message : "Bruh, something broke. Idk what you did lol"
            });

            return;
        }

    });

    socket.on("app:getHistoryContent", function (args) {

        const type = args.type,
            historyData = getHistoryContents();

        socket.emit("app_response:getHistoryContent", type === null ? historyData.content : historyData.filterByType(type));

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

    socket.on("app:getServerVersions", function () {

        const versions = fileManager.getAvailableVersions();

        socket.emit("app_response:getServerVersions", versions);
    });

    socket.on("app:getDataRequest", function (res) {

        switch (res.request) {
            case "path":

                dialog.showOpenDialog(window, { properties: ["openDirectory"] }).then(function (p) {

                    socket.emit("app_response:getDataRequest", {
                        data: p,
                        req: res
                    });

                });


                break;
        }

    });

    socket.on("app:setDefaultBackground", function (src) {

        const existingAppData = appData.initialize();

        existingAppData.application.appearance.background.src = src;

        appData.overWriteData(existingAppData);

    });

    socket.on("app:getImagesInDir", function () {

        dialog.showOpenDialog(window, {
            properties: ["openDirectory"]
        }).then(function (res) {

            const filePath = res.filePaths[0];

            if (!fs.existsSync(filePath)) return;

            const dirItems = fs.readdirSync(filePath),
                sources = [];

            dirItems.forEach(function (item) {

                if (item.endsWith(".jpg") || item.endsWith(".png") || item.endsWith(".jpeg") || item.endsWith(".gif")) {

                    const imageData = fs.readFileSync(path.join(filePath, item));

                    sources.push({
                        path: path.join(filePath, item),
                        base64: "data:image/png;base64," + imageData.toString("base64")
                    });

                }

            });

            socket.emit("app_response:app:getImagesInDir", sources);
        });

    });

    socket.on("app:getDefaultWallpaper", function () {

        const existingAppData = appData.initialize();

        if (!fs.existsSync(existingAppData.application.appearance.background.src)) return;

        const imageData = fs.readFileSync(existingAppData.application.appearance.background.src);

        socket.emit("app_response:getDefaultWallpaper", {
            path: existingAppData.application.appearance.background.src,
            data: "data:image/png;base64," + imageData.toString("base64")
        });

    });
}

module.exports = {
    listen: listen,
    activeSocket: activeSocket
}