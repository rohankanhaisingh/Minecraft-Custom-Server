console.clear(0);

const url = require("url"),
    path = require("path"),
    electron = require("electron"),
    isDev = require("electron-is-dev"),
    socketio = require("socket.io"),
    express = require("express"),
    fs = require("fs"),
    colors = require("colors");

const { initialize } = require("./server/appdata");
const { handle } = require("./server/ipc");
const { listen } = require("./server/socketServer");
const main = require("./server/minecraft/main");

const { app, BrowserWindow, ipcMain, dialog } = electron;

process.env.SOCKET = 8000;

const io = socketio(8000);

const currentOS = process.platform;

if (currentOS !== "win32") {

    process.exit();

    return;
};

const parsedAppData = initialize();

let mainWindow, activeClient, loaderWindow;

console.log("Initializing application...".yellow);


function createBrowserWindow() {
    mainWindow = new BrowserWindow({
        title: "Custom Minecraft Server",
        backgroundColor: "#1a1a1a",
        width: 800,
        height: 760,
        minHeight: 760,
        minWidth: 800,
        resizable: true,
        frame: false,
        show: false,
        titleBarStyle: "hidden",
        icon: path.join(__dirname, "view", "data", "icons", "windows", "cumpoopandshit.png"),
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            nodeIntegrationInSubFrames: true,
            nodeIntegrationInWorker: true,
        }
    });

    mainWindow.webContents.on("dom-ready", function () {

        mainWindow.show();

        if (loaderWindow !== null) {
            loaderWindow.hide();
            loaderWindow.close();

            loaderWindow = null;
        }

    });

    handle(mainWindow);

    io.sockets.on("connection", async function (socket) {

        console.log(`New socket with id '${socket.id}' has been connected at ${new Date()}`.gray);

        activeClient = socket;

        listen(socket, mainWindow);
    });

    mainWindow.webContents.once("dom-ready", function () {
        console.log("Succesfully loaded browser window.".green);
    });

    if (typeof parsedAppData.server !== "undefined") {
        if (parsedAppData.server.path !== null) {

            // Check if path exist.
            const dir = fs.existsSync(parsedAppData.server.path);

            if (!dir) {

                mainWindow.loadURL(url.format({
                    pathname: path.join(__dirname, "view", "setup.html"),
                    slashes: true,
                    protocol: "file:"
                }));

                return;
            }

            main.mainExecutionPath = parsedAppData.server.path;

            mainWindow.loadURL(url.format({
                pathname: path.join(__dirname, "view", "tabs", "index.html"),
                slashes: true,
                protocol: "file:"
            }));
        } else {
            mainWindow.loadURL(url.format({
                pathname: path.join(__dirname, "view", "setup.html"),
                slashes: true,
                protocol: "file:"
            }));
        }
    } else {
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, "view", "setup.html"),
            slashes: true,
            protocol: "file:"
        }));
    }
}

app.once("ready", function () {

    console.log("Succesfully initialized application".green);

    console.log("Loading browser window...".yellow);

    loaderWindow = new BrowserWindow({
        width: 260,
        height: 410,
        minHeight: 410,
        minWidth: 260,
        maxWidth: 260,
        maxHeight: 410,
        frame: true,
        show: false,
        icon: path.join(__dirname, "view", "data", "icons", "windows", "cumpoopandshit.png"),
        transparent: true,
        autoHideMenuBar: true,
        resizable: false,
        titleBarStyle: "hidden",
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            nodeIntegrationInSubFrames: true,
            nodeIntegrationInWorker: true,
        }
    });

    loaderWindow.webContents.on("dom-ready", function () {

        loaderWindow.show();

        setTimeout(createBrowserWindow, 2000);
    });

    loaderWindow.loadURL(url.format({
        pathname: path.join(__dirname, "view", "loader.html"),
        slashes: true,
        protocol: "file:"
    }));

});