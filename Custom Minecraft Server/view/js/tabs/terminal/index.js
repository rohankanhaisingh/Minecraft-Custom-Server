import "../../static/static.contentloader.js";
import "../../static/static.titlebar.js";
import "../../static/static.animations.js";

import "./module.w0zk.js";

import { emit, listen, socket } from "../../dynamic/socket.js";
import { createOutputStream } from "./module.xi23.js";

const mainApp = document.querySelector(".app"),
    contentLoader = document.querySelector(".app-contentloader"),
    terminalNavDropdownButton = document.querySelector(".dropdown-streamtype-value"),
    terminalNavDropdown = document.querySelector(".dropdown-streamtype-list"),
    terminalNavDropdownItems = document.querySelectorAll(".dropdown-streamtype-list-item"),
    terminalNavMainDropdown = document.querySelector(".terminal-nav-dropdown");

/**
 * Handles history streams.
 * @param {Array} data
 */
function handleHistortyStreams(data) {

    data.forEach(function (stream) {

        createOutputStream(stream.stream, stream.type, stream.content);

    });

}

terminalNavDropdownButton.addEventListener("click", function (event) {

    if (terminalNavDropdown.classList.contains("hidden")) {
        terminalNavDropdown.classList.remove("hidden");
    } else {
        terminalNavDropdown.classList.add("hidden");
    }

});

terminalNavDropdownItems.forEach(function (button) {

    button.addEventListener("click", function () {

        terminalNavMainDropdown.classList.forEach(function (className) {

            if (className === "terminal-nav-dropdown") return;

            terminalNavMainDropdown.classList.remove(className);

        });

        terminalNavMainDropdown.classList.add(button.innerText.toLowerCase());
        terminalNavDropdownButton.querySelector("span").innerText = button.innerText;

        const terminalNodes = document.querySelectorAll(".terminal-output-stream");

        terminalNodes.forEach(function (node) {
            node.remove();
        });

        emit("app:getHistoryContent", {
            type: button.innerText.toLowerCase() === "all" ? null : button.innerText.toLowerCase()
        });

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

    emit("app:getHistoryContent", {
        type: null
    });

    listen("app:serverState", function (str) {

        console.log(str);

        createOutputStream(str.stream, str.type, str.message);
    });

    listen("app_response:getHistoryContent", handleHistortyStreams);

});