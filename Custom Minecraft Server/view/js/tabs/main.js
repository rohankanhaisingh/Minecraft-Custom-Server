import { emit, listen } from "../dynamic/socket.js";
import { Toast } from "../dynamic/toast.js";

(function () {

    const mainApp = document.querySelector(".app"),
        contentLoader = document.querySelector(".app-contentloader"),
        toggleButtons = document.querySelectorAll(".group-content-toggle"),
        tabGroups = document.querySelectorAll(".app-tabcontent-group"),
        startButton = document.querySelector(".server-startbutton");

    function launchServer() {

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

        emit("app:startserver", tempObj);

    }


    startButton.addEventListener("click", function () {

        mainApp.classList.add("in-loader");
        contentLoader.classList.add("visible");
        contentLoader.classList.add("fadein");

        setTimeout(launchServer, 1000);
    });

    tabGroups.forEach(function (group) {

        const contentToggleButton = group.querySelector(".tabcontent-group-titlebar-toggle"),
            content = group.querySelector(".tabcontent-group-content"),
            rangeInputs = group.querySelectorAll(".group-content-range");

        rangeInputs.forEach(function (node) {

            const input = node.querySelector("input");

            if (input == undefined) return;

            const output = input.getAttribute("data-send") !== null ? document.querySelector(input.getAttribute("data-send")) : null;

            if (output == null) return;

            input.addEventListener("input", function () {
                output.innerText = input.value;
            })
        });

        contentToggleButton.addEventListener("click", function () {

            if (contentToggleButton.classList.contains("active")) {

                content.classList.add("hidden");

                contentToggleButton.classList.remove("active");
            } else {

                content.classList.remove("hidden");

                contentToggleButton.classList.add("active");
            }

        });

    });


    toggleButtons.forEach(function (button) {

        const valueNodes = button.querySelectorAll(".toggle-value");

        button.addEventListener("click", function () {

            valueNodes.forEach(function (node) {

                node.classList.remove("active");

            });

            if (button.classList.contains("toggled")) {
                button.classList.remove("toggled");

                button.setAttribute("data-value", valueNodes[0].innerText.toLowerCase());
                button.setAttribute("data-binary-value", 0);

                valueNodes[0].classList.add("active");

            } else {
                button.classList.add("toggled");

                button.setAttribute("data-value", valueNodes[1].innerText.toLowerCase());
                button.setAttribute("data-binary-value", 1);

                valueNodes[1].classList.add("active");
            }

        });

    });


    window.addEventListener("load", function () {

        this.setTimeout(function () {

            contentLoader.classList.add("fadeout");

            setTimeout(function () {

                contentLoader.classList.remove("visible");
                contentLoader.classList.remove("fadeout");

            }, 1000);

        }, 1000);

        listen("app:error", function (data) {

            const errorToast = new Toast(data.title, data.message, data.detail, 5000);

            errorToast.Show();

            contentLoader.classList.add("fadeout");

            setTimeout(function () {

                contentLoader.classList.remove("visible");
                contentLoader.classList.remove("fadeout");

            }, 1000);

        });

    });

})();