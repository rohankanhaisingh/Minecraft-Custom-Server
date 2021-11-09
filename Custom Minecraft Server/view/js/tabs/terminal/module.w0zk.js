import { emit, listen } from "../../dynamic/socket.js";

import { createOutputStream } from "./module.xi23.js";

const terminalInput = document.querySelector(".terminal-input");

const inputData = {
    lastText: null
}


/**
 * Handles input data.
 * @param {string} data
 */
function handleInputData(data) {

    let streamType = data.split(":")[0],
        executionData = null;

    switch (streamType) {
        case "app":

            executionData = data.substring(streamType.length + 1);

            emit("app:executionCommands", {
                target: "process",
                executionData: executionData,
                dataLength: executionData.length,
                base64: btoa(executionData),
                timestamp: Date.now()
            });

            break;
        case "spigot":

            executionData = data.substring(streamType.length + 1);

            emit("app:executionCommands", {
                target: "spigot",
                executionData: executionData,
                dataLength: executionData.length,
                base64: btoa(executionData),
                timestamp: Date.now()
            });

            break;
        case "bungee":

            executionData = data.substring(streamType.length + 1);

            emit("app:executionCommands", {
                target: "bungee",
                executionData: executionData,
                dataLength: executionData.length,
                base64: btoa(executionData),
                timestamp: Date.now()
            });

            break;
        default:

            createOutputStream("App", "error", `'${streamType}' is not a recognized stream-type for this application terminal.`);

            break;
    }

}

function handleReturnData(res) {

    if (typeof res.data === "object") {

        if (res.data.type === "error") createOutputStream(res.emitter, "error", res.data.message);

        return;
    }

    createOutputStream(res.emitter, "log", res.data === undefined ? "undefined" : res.data, true);
}

listen("app_response:executionCommands", handleReturnData);

terminalInput.addEventListener("keydown", function (event) {

    switch (event.keyCode) {
        case 13:

            handleInputData(this.innerText);

            inputData.lastText = this.innerText;

            this.innerText = "";

            event.preventDefault();

            break;
        case 38:

            if (inputData.lastText !== null && inputData.lastText !== "") {

                this.focus();

                this.innerText = inputData.lastText;
                this.innerText = this.innerText;

                this.selectionEnd = this.innerText.length;

            }

            break;
    }

});