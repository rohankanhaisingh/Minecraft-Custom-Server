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

process.env.SOCKET = 8000;

const io = socketio(8000);

const { app, BrowserWindow, ipcMain, dialog } = electron;

const parsedAppData = initialize();

let mainWindow;

app.once("ready", function () {

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

    mainWindow.webContents.once("dom-ready", function () {

        handle(mainWindow);

        io.sockets.on("connection", function (socket) {

        });

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

            mainWindow.loadURL(url.format({
                pathname: path.join(__dirname, "view", "index.html"),
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