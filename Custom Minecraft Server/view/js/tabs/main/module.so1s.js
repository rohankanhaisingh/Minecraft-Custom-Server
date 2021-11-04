import { emit } from "../../dynamic/socket.js";

const mainApp = document.querySelector(".app"),
    contentLoader = document.querySelector(".app-contentloader"),
    toggleButtons = document.querySelectorAll(".group-content-toggle"),
    tabGroups = document.querySelectorAll(".app-tabcontent-group"),
    startButton = document.querySelector(".server-startbutton"),
    statusHeader = document.querySelector(".server-status");

export let isRunning = false;

export function setServerState(bool) {
    isRunning = bool
}

export function launchServer() {

    const tempObj = {
        launch: {
            hostingMethod: null,
            ramUsage: "auto",
            maxPlayers: 10
        },
        game: {
            inGameBot: true,
            autoSave: true,
            showServerLogs: false
        }
    }

    tabGroups.forEach(function (group) {

        const groupName = group.getAttribute("data-id");

        const items = group.querySelectorAll(".group-content-item");

        items.forEach(function (item) {

            const itemName = item.getAttribute("data-name");

            const toggle = item.querySelector(".group-content-toggle"),
                input = item.querySelector(".group-content-number input"),
                range = item.querySelector(".group-content-range input");

            switch (true) {
                case (toggle !== null):

                    if (range !== null) {

                        if (parseFloat(toggle.getAttribute("data-binary-value")) === 0) {
                            tempObj[groupName][itemName] = toggle.getAttribute("data-value");
                        } else {
                            tempObj[groupName][itemName] = parseInt(range.value);
                        }

                    } else {
                        tempObj[groupName][itemName] = toggle.getAttribute("data-value");
                    }

                    break;
                case (input !== null):
                    tempObj[groupName][itemName] = parseInt(input.value);
                    break;
            }

        });

    });

    if (tempObj.launch.hostingMethod == (null || "")) {

        emit("app:warningDialogClientSide", {
            title: "Minecraft: Custom Server",
            message: "Failed to start server.",
            detail: "Please select a hosting method."
        });

        const errorToast = new Toast("Minecraft: Custom Server", "Failed to start server.", "Please select a hosting method.", 5000);

        errorToast.Show();

        contentLoader.classList.add("fadeout");

        setTimeout(function () {

            contentLoader.classList.remove("visible");
            contentLoader.classList.remove("fadeout");

        }, 1000);

        return;
    }

    for (let group in tempObj) {
        for (let key in tempObj[group]) {

            if (typeof tempObj[group][key] === "string") tempObj[group][key] = tempObj[group][key].toLowerCase();

        }
    }

    console.log(tempObj);

    emit("app:startserver", tempObj);

}

startButton.addEventListener("click", function () {

    if (isRunning) return;

    mainApp.classList.add("in-loader");
    contentLoader.classList.add("visible");
    contentLoader.classList.add("fadein");

    setTimeout(launchServer, 1000);
});