import "../../static/static.contentloader.js";
import "../../static/static.titlebar.js";
import "../../static/static.animations.js";

import "./module.fgz2.js";

import { emit, listen } from "../../dynamic/socket.js";
import { Toast } from "../../dynamic/toast.js";

const mainApp = document.querySelector(".app"),
    contentLoader = document.querySelector(".app-contentloader"),
    appWallpaper = document.querySelector(".app-background img");


window.addEventListener("load", function () {


    emit("app:getDefaultWallpaper", location.href);

    listen("app_response:getDefaultWallpaper", function (res) {

        appWallpaper.src = res.data;
    });

    emit("app:getServerState");

    emit("app:getServerPropertiesTemplate", null);

    this.setTimeout(function () {

        contentLoader.classList.add("fadeout");

        setTimeout(function () {

            contentLoader.classList.remove("visible");
            contentLoader.classList.remove("fadeout");

        }, 1000);

    }, 1000);


});
