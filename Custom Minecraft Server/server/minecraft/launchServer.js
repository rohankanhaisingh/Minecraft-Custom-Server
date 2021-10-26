const si = require("systeminformation"),
    fs = require("fs");


const { getPropertiesFile } = require("./checkServerFiles");

function checkJavaInstallation(callback) {
    const spawn = require('child_process').spawn('java', ['-version']);

    spawn.on('error', function (err) {
        return callback(err, null);
    });

    spawn.stderr.once('data', function (data) {
        data = data.toString().split('\n')[0];

        const javaVersion = new RegExp('java version').test(data) ? data.split(' ')[2].replace(/"/g, '') : false;

        if (javaVersion) {
            
            callback(null, javaVersion)

            return;
        }

        return callback({
            message: "Java has no been installed."
        }, null);
    });
}

function checkFormat(data, callback) {

    const tempObj = data;

    si.mem(function (res) {

        const availableMemory = res.free,
            providedMemoryUsage = tempObj.launch.ramUsage === "automatic" ? availableMemory / 2 : tempObj.launch.ramUsage * 1073741824,
            calculation = availableMemory - providedMemoryUsage;

        if (providedMemoryUsage > availableMemory) {

            callback({
                message: `Cannot use provided memory for server. There is only ${availableMemory} bytes of memory left.`,
                from: "checkFormat"
            }, null);


            return;
        }


        const propertiesData = getPropertiesFile();

        propertiesData["max-players"] = data.launch.maxPlayers;

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