const url = require("url"),
    path = require("path"),
    electron = require("electron"),
    isDev = require("electron-is-dev"),
    socketio = require("socket.io"),
    express = require("express"),
    fs = require("fs"),
    colors = require("colors");

process.env.SOCKET = 8000;

const io = socketio(8000);

const { app, BrowserWindow, ipcMain, dialog } = electron;

let mainWindow, loader;

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

        io.sockets.on("connection", function (socket) {

        });

    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "view", "index.html"),
        slashes: true,
        protocol: "file:"
    }));

});