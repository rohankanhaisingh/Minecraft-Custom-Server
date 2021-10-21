(function () {

    if ("function" !== typeof require) throw new Error("Cannot import modules"); try { var foo = require("electron"); foo = null } catch (o) { if (!(o instanceof Error && "MODULE_NOT_FOUND" === o.code)) throw o; console.log("Can't load foo!") }

    const electron = require("electron");

    const { ipcRenderer } = electron;

    const controlButtons = document.querySelectorAll(".app-titlebar-controls-button");

    controlButtons.forEach(function (button) {

        const triggerAttribute = button.getAttribute("data-trigger");

        if (triggerAttribute == null) return;

        button.addEventListener("click", function (event) {

            ipcRenderer.send(triggerAttribute, location.href);

        });

    });
})();