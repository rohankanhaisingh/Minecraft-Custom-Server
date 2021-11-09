const path = require("path"),
    url = require("url"),
    colors = require("colors"),
    fs = require("fs"),
    express = require("express"),
    cheerio = require("cheerio"),
    session = require("express-session"),
    history = require("../history");

const mainDirectory = path.join(__dirname, "../../", "view/");

function initialize(router) {

    let processStart, processEnd, processDifference;

    // Start measuring process execution time.
    processStart = Date.now();

    history.writeNewData("App", "warn", "Starting initialization process...").log();

    // Start counting initliazed files.
    let fileAmount = 0;

    const stylesheets = fs.readdirSync(mainDirectory + "public/stylesheets", { encoding: "utf-8" });
    const fonts = fs.readdirSync(mainDirectory + "data/fonts", { encoding: "utf-8" });
    const scripts = fs.readdirSync(mainDirectory + "public/scripts", { encoding: "utf-8" });
    const data = fs.readdirSync(mainDirectory + "public/data", { encoding: "utf-8" });

    // Loop through array with files and directories.
    for (let i = 0; i < stylesheets.length; i++) {

        // Defined looped file.
        const file = stylesheets[i];

        // Get file statistics.
        const fileStats = fs.lstatSync(mainDirectory + `public/stylesheets/${file}`);

        // If file is a file.
        if (fileStats.isFile()) {

            // If file name ends with '.css';
            if (file.endsWith('.css')) {

                fileAmount += 1;

                // Create a fake request directory and render provided stylesheet.
                router.get(`/app.static.stylesheets/${file}`, function (req, res) {

                    res.sendFile(mainDirectory + "public/stylesheets/" + file);
                });
            }
        } else {
            // If file is a directory, get files in that directory.

            const providedDir = file;

            // Read files in provided directory.
            const files = fs.readdirSync(mainDirectory + `public/stylesheets/${providedDir}`);

            // Loop through array of found files in provided directory.
            for (let f = 0; f < files.length; f++) {

                // Get looped file in provided directory.
                const directoryFile = files[f];

                fileAmount += 1;

                // Create a fake request directory and render provided stylesheet.
                router.get(`/app.static.stylesheets/${providedDir}/${directoryFile}`, function (req, res) {

                    res.sendFile(mainDirectory + `public/stylesheets/${providedDir}/${directoryFile}`);
                });
            }
        }
    }

    for (let i = 0; i < fonts.length; i++) {

        // Defined looped file.
        const file = fonts[i];

        // Get file statistics.
        const fileStats = fs.lstatSync(mainDirectory + `data/fonts/${file}`);

        // If file is a file.
        if (fileStats.isFile()) {

            fileAmount += 1;

            // Create a fake request directory and render provided stylesheet.
            router.get(`/app.static.fonts/${file}`, function (req, res) {

                res.sendfile(mainDirectory + `data/fonts/${file}`);
            });

        }
    }

    for (let i = 0; i < scripts.length; i++) {

        const target = scripts[i];

        // Get file statistics.
        const fileStats = fs.lstatSync(mainDirectory + `public/scripts/${target}`);

        let file, minifiedFile;

        if (fileStats.isFile()) {
            if (target.endsWith(".js")) {
                router.get(`/app.static.scripts/${target}`, function (req, res) {

                    file = fs.readFileSync(mainDirectory + `public/scripts/${target}`, { encoding: "utf-8" });

                    res.send(file);

                    file = null;
                });
            }
        } else {
            const directoryFiles = fs.readdirSync(mainDirectory + `public/scripts/${target}`);

            const directory = target;

            for (let o = 0; o < directoryFiles.length; o++) {

                const providedDirectorFile = directoryFiles[o];

                router.get(`/app.static.scripts/${directory}/${providedDirectorFile}`, function (req, res) {

                    file = fs.readFileSync(mainDirectory + `public/scripts/${directory}/${providedDirectorFile}`);

                    res.send(file);

                    file = null;

                });
            }
        }
    }

    for (let i = 0; i < data.length; i++) {

        let target = data[i],
            targetStats = fs.lstatSync(mainDirectory + `public/data/${target}`),
            file = null;

        if (targetStats.isFile()) {

            router.get(`/app.static.data/${target}`, function (req, res) {

                file = fs.readFileSync(mainDirectory + `public/data/${target}`, { encoding: "utf-8" });

                res.send(file);
            });

        } else {
            const directoryFiles = fs.readdirSync(mainDirectory + `public/data/${target}`);

            const directory = target;

            for (let f = 0; f < directoryFiles.length; f++) {

                const providedDirectoryFile = directoryFiles[f];

                router.get(`/app.static.data/${directory}/${providedDirectoryFile}`, function (req, res) {

                    res.sendFile(mainDirectory + `public/data/${directory}/${providedDirectoryFile}`);
                });

            }
        }
    }

    processEnd = Date.now();

    // Measure difference between start and end.
    processDifference = processEnd - processStart;

    // Some console loggings.
    history.writeNewData("App", "success", `Executed initialization process in ${processDifference} milliseconds.`).log();
    history.writeNewData("App", "success", `Succesfully initialized ${fileAmount} files in ${processDifference} milliseconds.`).log();

    return router;
}

function renderHomePage(req, res) {

    // Render home page file;
    //return res.sendFile(mainDirectory + "public/index.html");

    return res.send({
        type: "no_renderfile_found",
        message: "Failed to render view page. No render file found.",
        requestDate: {
            timestamp: Date.now(),
            formatted: new Date()
        },
        headers: req.headers
    });
}

/**
 * Handle incoming GET requests.
 * @param {express.Router} router
 */
function handleGETRequests(router) {

    router.get("/", renderHomePage);
    router.get("/home", renderHomePage);
    router.get("/index", renderHomePage);
    router.get("/main", renderHomePage);

}

module.exports = {
    initialize: initialize,
    handleGETRequests: handleGETRequests
}