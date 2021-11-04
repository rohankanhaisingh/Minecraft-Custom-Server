const { ipcMain, app, BrowserWindow } = require("electron");
const colors = require("colors");

/**
 * Handles IPC events from the client.
 * @param {BrowserWindow} mainWindow
 */
function handle(mainWindow) {

    console.log("Started listeners on IPC thread.".gray);

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

}

module.exports = {
    handle: handle
}