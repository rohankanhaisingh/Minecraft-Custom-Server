import { emit, listen } from "../../dynamic/socket.js";
import { Toast } from "../../dynamic/toast.js";

import "../../static/static.contentloader.js";
import "../../static/static.titlebar.js";
import "../../static/static.animations.js";

import "./module.so1s.js";
import "./module.sivn.js";



const mainApp = document.querySelector(".app"),
    contentLoader = document.querySelector(".app-contentloader"),
    toggleButtons = document.querySelectorAll(".group-content-toggle"),
    tabGroups = document.querySelectorAll(".app-tabcontent-group"),
    startButton = document.querySelector(".server-startbutton"),
    statusHeader = document.querySelector(".server-status");

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

    emit("app:getServerState");

    this.setTimeout(function () {

        contentLoader.classList.add("fadeout");

        setTimeout(function () {

            contentLoader.classList.remove("visible");
            contentLoader.classList.remove("fadeout");

        }, 1000);

    }, 1000);


});
