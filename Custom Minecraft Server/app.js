const url = require("url"),
    path = require("path"),
    electron = require("electron"),
    isDev = require("electron-is-dev"),
    socketio = require("socket.io");
    fs = require("fs"),
    colors = require("colors");

// Custom modules.
const { initialize } = require("./server/appdata");
const { handle } = require("./server/ipc");
const { listen } = require("./server/socketServer");

const history = require("./server/history");
const main = require("./server/minecraft/main");
const webServer = require("./server/webserver/main");

process.env.SOCKET = 8000; // Setting main socket port to 8000.

const { app,
    BrowserWindow,
    ipcMain,
    dialog } = electron,
    io = socketio(8000),
    currentOS = process.platform;

if (currentOS !== "win32") process.exit(); // If the platform string is not equal to 'win32'.

let parsedAppData = initialize(), mainWindow, activeClient, loaderWindow, historyContent = history.initialize();

console.log("Initializing application...".yellow);

webServer.listen();

/**Creates a browser window. */
function createBrowserWindow() {

    history.writeNewData("App", "warn", "Creating main browser window...").log();

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

    // Event when all dom elements are ready.
    mainWindow.webContents.once("dom-ready", function () {

        history.writeNewData("App", "success", `Succesfully loaded webcontents at ${new Date()}.`).log()

        // Make the main window visible.
        mainWindow.show();

        // If the variable 'loaderWindow' is not null, try to destroy it.
        if (loaderWindow !== null) {
            loaderWindow.hide();
            loaderWindow.close();

            loaderWindow = null;
        }

    });

    // Handle IPC streams from and and out the main window.
    handle(mainWindow);

    // Handle SocketIO streams.
    io.sockets.on("connection", async function (socket) {

        // Set the active client to the connected client.
        activeClient = socket;

        // Listen for events from the connected socket.
        listen(socket, mainWindow);
    });

    // Check if property 'server' of object 'parsedAppData' exist.
    if (typeof parsedAppData.server !== "undefined") {

        // If property 'path' of object 'server' exists.
        if (parsedAppData.server.path !== null) {

            // Check if path exist.
            const dir = fs.existsSync(parsedAppData.server.path);

            // If path doesn't exist, load the setup page.
            if (!dir) {

                mainWindow.loadURL(url.format({
                    pathname: path.join(__dirname, "view", "setup.html"),
                    slashes: true,
                    protocol: "file:"
                }));

                return;
            }

            // If it does exist, set the execution path to a global variable and load the main page.

            main.mainExecutionPath = parsedAppData.server.path;

            history.writeNewData("App", "success", `Found server execution files in '${parsedAppData.server.path}'.`).log();

            mainWindow.loadURL(url.format({
                pathname: path.join(__dirname, "view", "tabs", "index.html"),
                slashes: true,
                protocol: "file:"
            }));
        } else {

            // Load the setup page if not the case.
            mainWindow.loadURL(url.format({
                pathname: path.join(__dirname, "view", "setup.html"),
                slashes: true,
                protocol: "file:"
            }));
        }
    } else {

        // Same here.
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, "view", "setup.html"),
            slashes: true,
            protocol: "file:"
        }));
    }
}

// Event when main Electron app is ready.
app.once("ready", function () {

    history.writeNewData("App", "success", "Succesfully initialized Electron application.").log();

    history.writeNewData("App", "warn", "Loading browser window...").log();

    // Create a new loader browser window.
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

    // Event when the dom content is ready in the loader.
    loaderWindow.webContents.on("dom-ready", function () {

        // Show the loader itself.
        loaderWindow.show();

        // Create the main browser window after 2 seconds.
        setTimeout(createBrowserWindow, 2000);
    });

    // Load the loader page.
    loaderWindow.loadURL(url.format({
        pathname: path.join(__dirname, "view", "loader.html"),
        slashes: true,
        protocol: "file:"
    }));

});

module.exports = {
    activeClient: activeClient
}