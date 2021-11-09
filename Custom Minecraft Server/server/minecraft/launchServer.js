const electronIsDev = require("electron-is-dev");
const si = require("systeminformation"),
    fs = require("fs"),
    path = require("path");
const { writeNewData } = require("../history");

const { getPropertiesFile, saveJSONProperties, getConfigData, saveConfigFile, check } = require("./checkServerFiles");
const main = require("./main");

function checkJavaInstallation(callback) {

    writeNewData("App", "warn", "Checking installed Java version...").log();

    const spawn = require('child_process').spawn('java', ['-version']);

    spawn.on('error', function (err) {
        return callback(err, null);
    });

    spawn.stderr.once('data', function (data) {
        data = data.toString().split('\n')[0];

        const javaVersion = new RegExp('java version').test(data) ? data.split(' ')[2].replace(/"/g, '') : false;

        if (javaVersion) {
            
            callback(null, javaVersion);

            writeNewData("App", "success", `Found version '${javaVersion}'.`).log();

            return;
        }

        return callback({
            message: "Java has not been installed."
        }, null);
    });
}

/**
 * Set memory in executable files.
 * @param {number} memInGB
 */
function setMemoryInExecutable(memInGB) {

    if (typeof memInGB !== "number") return null;

    const mainDir = fs.readdirSync(main.mainExecutionPath, { encoding: "utf-8" });

    mainDir.forEach(function (dir) {

        const stat = fs.lstatSync(path.join(main.mainExecutionPath, dir));

        if (!stat.isDirectory()) return;

        const dir1 = fs.readdirSync(path.join(main.mainExecutionPath, dir), { encoding: "utf-8" });

        const writtenFiles = [];

        dir1.forEach(function (subdir) {

            const stat1 = fs.lstatSync(path.join(main.mainExecutionPath, dir, subdir));

            if (!stat1.isDirectory()) return;

            const subdir1 = fs.readdirSync(path.join(main.mainExecutionPath, dir, subdir), { encoding: "utf-8" });

            subdir1.forEach(function (file) {

                if (file !== "start.bat") return;

                const f = fs.readFileSync(path.join(main.mainExecutionPath, dir, subdir, file), { encoding: "utf-8" });

                const executionArgs = f.substring(6).split("-");
               
                let mainArg = "java ";

                executionArgs.forEach(function (arg) {

                    if (arg.startsWith("Xmx")) {

                        const newArg = "Xmx" + memInGB + "G ";

                        mainArg += "-" + newArg;
                    } else {
                        mainArg += "-" + arg;
                    }

                });


                fs.writeFileSync(path.join(main.mainExecutionPath, dir, subdir, file), mainArg, { encoding: "utf-8" });

                writtenFiles.push(file);
            });

        });

        console.log(`Succesfully wrote ${writtenFiles.length} files.`.green);

        return true;
    });
}

function checkFormat(data, callback) {

    const tempObj = data;

    writeNewData("App", "warn", "Loading system memory status...").log();

    si.mem(function (res) {

        const availableMemory = res.free,
            providedMemoryUsage = tempObj.launch.ramUsage === "automatic" ? availableMemory / 2 : tempObj.launch.ramUsage * 1073741824,
            calculation = availableMemory - providedMemoryUsage;

        writeNewData("App", "success", `Succesfully loaded system memory status. Available: ${availableMemory}`).log();

        if (providedMemoryUsage > availableMemory) {

            if (!electronIsDev) {
                writeNewData("App", "error", `Failed to launch dedicated TCP server. Not enough system memory left in order to operate. Available: ${availableMemory}; Requested: ${providedMemoryUsage}.`).log();

                callback({
                    message: `Cannot use provided memory for server. There is only ${availableMemory} bytes of memory left. Requested memory size: ${providedMemoryUsage}`,
                    from: "checkFormat"
                }, null);


                return;
            } else {
                writeNewData("App", "warn", "Warning: There is no enough system ram memory left in order to operate. Will ignore since application is in dev-mode.").log();
            }

        }


        const propertiesData = getPropertiesFile();

        propertiesData.parsedData["max-players"] = data.launch.maxPlayers;
        saveJSONProperties(propertiesData.filePath, propertiesData.parsedData)

        const configData = getConfigData();

        configData.parsedData.listeners[0].max_players = data.launch.maxPlayers;

        saveConfigFile(configData.filePath, configData.parsedData);

        setMemoryInExecutable(tempObj.launch.ramUsage);

        // Check if Java is installed.
        checkJavaInstallation(function (err, res) {

            if (err) {

                callback({
                    message: `Java has not been installed on this device. Please visit https://java.com/nl/ to install the latest Java version.`,
                    from: "checkFormat"
                }, null);

                return;
            }

            callback(null, {version: res, ...data});

        });
    });

}

module.exports = {
    checkFormat: checkFormat,
}