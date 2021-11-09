import { emit, listen } from "../../dynamic/socket.js";
import { Toast } from "../../dynamic/toast.js";


import { setServerState } from "./module.so1s.js";

const mainApp = document.querySelector(".app"),
    contentLoader = document.querySelector(".app-contentloader"),
    toggleButtons = document.querySelectorAll(".group-content-toggle"),
    tabGroups = document.querySelectorAll(".app-tabcontent-group"),
    startButton = document.querySelector(".server-startbutton"),
    statusHeader = document.querySelector(".server-status"),
    navButton = document.querySelector(".button-serveroverview");

function setRunningServerView(res) {

    mainApp.classList.add("in-server");

    statusHeader.innerHTML = `Server IP: <strong class="online">${res.host}</strong>`;
    startButton.querySelector("span").innerText = "Stop";

    setServerState(true);
}

listen("app_response:getServerState", function (res) {

    if (res.host === null) return;

    setRunningServerView(res);

});

listen("app_response:runningServer", function (res) {

    setRunningServerView(res);

    contentLoader.classList.add("fadeout");

    navButton.classList.add("loading");

    setTimeout(function () {

        contentLoader.classList.remove("visible");
        contentLoader.classList.remove("fadeout");

        new Toast("Server", "Loading", "TCP URL has succesfully been generated. Please wait on the server to be loaded. It may take a while.", 5000).Show();

    }, 1000);
});

listen("app:error", function (data) {

    const errorToast = new Toast(data.title, data.message, data.detail, 5000);

    errorToast.Show();

    contentLoader.classList.add("fadeout");

    setTimeout(function () {

        contentLoader.classList.remove("visible");
        contentLoader.classList.remove("fadeout");

    }, 1000);

});

function format(text) {

    const time = text.substring(0, text.indexOf("]") + 1),
        type = text.substring(time.length + 2).split("]")[0].split("/")[0].toLowerCase(),
        message = text.substring(time.length + 1)

    return {
        time: time,
        type: type,
        message: message
    }
}

listen("app:serverState", function (res) {

    if (res.stream.toLowerCase() !== "spigot") return;

    const f = format(res.message);

    if (f.message.indexOf("Done") > -1) {

        navButton.classList.remove("loading");

        new Toast("Server", "Ready to use", "Server has been loaded. Players can now join.", 5000).Show();

    };

});