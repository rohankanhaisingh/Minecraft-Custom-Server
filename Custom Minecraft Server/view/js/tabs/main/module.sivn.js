import { emit, listen } from "../../dynamic/socket.js";
import { Toast } from "../../dynamic/toast.js";


import { setServerState } from "./module.so1s.js";

const mainApp = document.querySelector(".app"),
    contentLoader = document.querySelector(".app-contentloader"),
    toggleButtons = document.querySelectorAll(".group-content-toggle"),
    tabGroups = document.querySelectorAll(".app-tabcontent-group"),
    startButton = document.querySelector(".server-startbutton"),
    statusHeader = document.querySelector(".server-status");

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

    setTimeout(function () {

        contentLoader.classList.remove("visible");
        contentLoader.classList.remove("fadeout");

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