const fs = require("fs"),
    electron = require("electron"),
    path = require("path"),
    url = require("path"),
    colors = require("colors");

const launch = require("./minecraft/launchServer");

const { overWriteData } = require("./appdata");
const { check } = require("./minecraft/checkServerFiles");

const { dialog } = electron;

function listen(socket, window) {

    socket.on("app:warningDialogClientSide", function (args) {

        dialog.showMessageBox(window, {
            title: typeof args.title !== "undefined" ? args.title : "Minecraft: Custom Server",
            type: "warning",
            message: typeof args.message !== "undefined" ? args.message : "Something went wrong!",
            detail: typeof args.detail !== "undefined" ? args.detail : "bruh"
        });

    });

    socket.on("app:startserver", function (data) {

        launch.checkFormat(data, function (err, response) {

            if (err) {

                dialog.showMessageBox(window, {
                    title: "An error has occurred",
                    type: "error",
                    message: `failed to launch server.`,
                    detail: err.message
                });

                socket.emit("app:error", {
                    title: "An error has occurred",
                    message: `Failed to launch server.`,
                    detail: err.message
                });

                return;
            }

            console.log(`Found java version ${response.version}.`.green);

        });

    });

    socket.on("app:setup:checkInputFields", function (data) {

        let isValid = false;

        let errorCodes = [];

        for (let key in data) {

            switch (key) {
                case "server:path":

                    if (!fs.existsSync(data[key])) {
                        errorCodes.push(`Path '${data[key]}' does not exit. Please enter the correct path.`);
                    }

                    break;
            }

        }

        if (errorCodes.length == 0) {

            check(data, function (res) {

                switch (res.state) {
                    case "ready":

                        const tempObj = {
                            path: data["server:path"],
                            token: data["server:token"],
                            name: data["server:name"] === null ? "A cool Minecraft Server" : data["server:name"],
                            owner: data["server:owner"] === null ? "Admin" : data["server:owner"],
                            modt: data["server:motd"] === null ? "MOTD" : data["server:motd"],
                            output: data["app:outputpath"] === null ? data["server:path"] : data["app:outputpath"],
                        }

                        console.log(tempObj);

                        overWriteData({ server: tempObj }, function () {

                            socket.emit("app:changepage", "main");

                        });

                        break;
                }

            });

        } else {

            dialog.showMessageBox(window, {
                title: "An error has occurred",
                type: "warning",
                message: `Something went wrong while executing the program.`,
                detail: errorCodes.join("\n")
            });

            socket.emit("app_response:setup:checkInputFields", errorCodes);
        }

    });

}

module.exports = {
    listen: listen
}