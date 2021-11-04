import { emit, listen } from "../../dynamic/socket.js";
import { Toast } from "../../dynamic/toast.js";
import { handlePropertiesData } from "./module.genz.js";

const mainApp = document.querySelector(".app"),
    contentLoader = document.querySelector(".app-contentloader");

function setRunningServerView(res) {

    mainApp.classList.add("in-server");
}

listen("app_response:getServerState", function (res) {

    if (res.host === null) return;

    setRunningServerView(res);

});

listen("app_response:getServerPropertiesTemplate", function (res) {

    const data = JSON.parse(res.data);

    handlePropertiesData(data);

});