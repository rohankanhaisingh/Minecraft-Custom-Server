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

let mainWindow, activeClient;

console.log("Initializing application...".yellow);

app.once("ready", function () {

    console.log("Succesfully initialized application".green);

    console.log("Loading browser window...".yellow);

    mainWindow = new BrowserWindow({
        title: "Custom Minecraft Server",
        backgroundColor: "#1a1a1a",
        width: 800,
        height: 760,
        minHeight: 760,
        minWidth: 800,
        resizable: true,
        frame: false,
        titleBarStyle: "hidden",
        icon: "./assets/icons/win/discord.png",
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            nodeIntegrationInSubFrames: true,
            nodeIntegrationInWorker: true,
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

});