const { ipcMain, app, BrowserWindow } = require("electron");
const colors = require("colors");
const { writeNewData } = require("./history");
const main = require("./minecraft/main");

const { removeAppdataContents } = require("./appdata");


/**
 * Handles IPC events from the client.
 * @param {BrowserWindow} mainWindow
 */
function handle(mainWindow) {

    writeNewData("App", "log", "Listening for IPC events on main thread.").log();

    ipcMain.on("app:close", function (event, args) {

        mainWindow.close();
        app.exit();
        process.exit();

    });

    ipcMain.on("app:toggleWindowSize", function (event, args) {

        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }


    });

    ipcMain.on("app:minimize", function (event, args) {
        mainWindow.minimize();
    });

    ipcMain.on("app:closeServer", function (event, args) {

        console.log(true);

        if (main.processes.bungee !== null) main.processes.bungee.kill();
        if (main.processes.lobby !== null) main.processes.lobby.kill();

        app.relaunch();
        app.exit(0);


    });

    ipcMain.on("app:reload", function () {

        if (main.processes.bungee !== null) main.processes.bungee.kill();
        if (main.processes.lobby !== null) main.processes.lobby.kill();

        app.relaunch();
        app.exit(0);

    });

    ipcMain.on("app:force_refresh", function (event, args) {

        removeAppdataContents();

        app.relaunch();
        app.exit(0);
    });

}

module.exports = {
    handle: handle
}