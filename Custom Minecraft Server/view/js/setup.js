import { emit, init, listen } from "./dynamic/socket.js";

(function () {

    const tableItems = document.querySelectorAll(".table-container"),
        inputfields = document.querySelectorAll(".item-input"),
        acceptButton = document.querySelector(".setup-acceptbutton"),
        mainApp = document.querySelector(".app"),
        contentLoader = document.querySelector(".app-contentloader"),
        versionDropdownButton = document.querySelector(".server-version-dropdown");


    /**
     * Shows dropdown
     * @param {Array} items
     * @param {HTMLElement} target
     * @param {HTMLElement} valueTarget
     * @param {array} itemAttrs
     */
    function showDropdown(items, target, valueTarget, itemClasses) {

        const dropdown = document.querySelector(".floatable-select-list"),
            targetBoundary = target.getBoundingClientRect(),
            spanNode = valueTarget.querySelector("span") !== null ? valueTarget.querySelector("span") : valueTarget;

        if (dropdown.classList.contains("hidden")) dropdown.classList.remove("hidden");

        items.forEach(function (item) {

            const node = document.createElement("div");
            node.className = "select-list-item";

            node.addEventListener("click", function () {

                spanNode.innerText = this.innerText;

                if (valueTarget.classList.contains("active")) valueTarget.classList.remove("active");

                hideDropdown();

            });

            if (typeof itemClasses === "object") {
                itemClasses.forEach(function (cls) {
                    node.classList.add(cls);
                });
            }

            node.innerText = item;

            dropdown.appendChild(node);
        });

        dropdown.style.top = targetBoundary.top + targetBoundary.height + "px";
        dropdown.style.left = targetBoundary.left + "px";
    }

    function hideDropdown() {

        const dropdown = document.querySelector(".floatable-select-list"),
            dropdownNodes = dropdown.querySelectorAll(".select-list-item");

        if (!dropdown.classList.contains("hidden")) dropdown.classList.add("hidden");

        dropdownNodes.forEach(function (node) {

            node.remove();

        });

    }


    function checkInputFields() {

        const tableItems = document.querySelectorAll(".table-item");

        const tempObj = {};

        tableItems.forEach(function (item) {

            const field = item.querySelector(".item-input"),
                dropDown = item.querySelector(".item-select");


            if (field !== null) {

                const fieldID = field.getAttribute("data-id");

                tempObj[fieldID] = field.innerText !== "" ? field.innerText : null;
            }

            if (dropDown !== null) {

                const dropDownID = dropDown.getAttribute("data-id");

                tempObj[dropDownID] = dropDown.querySelector(".select-value span").innerText !== "" ? dropDown.querySelector(".select-value span").innerText : null;

            }

        });

        console.log(tempObj);

        emit("app:prepareInstallation", tempObj);
        // emit("app:setup:checkInputFields", tempObj);
    }


    inputfields.forEach(function (input) {

        input.addEventListener("paste", function (e) {
            event.preventDefault();

            const text = event.clipboardData.getData('text/plain');

            document.execCommand('insertText', false, text);
        });

        input.addEventListener("click", function () {

            const dataRequestAttr = this.getAttribute("data-request");

            if (dataRequestAttr === null) return;

            emit("app:getDataRequest", {
                request: dataRequestAttr,
                dataId: this.getAttribute("data-id"),
                timestamp: Date.now()
            });

        });
    });

    tableItems.forEach(function (table) {

        const tableContent = table.querySelector(".table-content"),
            tableToggleButton = table.querySelector(".table-togglebutton");

        tableToggleButton.addEventListener("click", function (event) {

            if (tableToggleButton.classList.contains("active")) {

                tableToggleButton.classList.remove("active");
                tableContent.classList.add("hidden");
            } else {

                tableToggleButton.classList.add("active");
                tableContent.classList.remove("hidden");
            }

        });

    });

    acceptButton.addEventListener("click", function (event) {

        mainApp.classList.add("in-loader");
        contentLoader.classList.add("visible");
        contentLoader.classList.add("fadein");

        setTimeout(checkInputFields, 2000);

    });

    versionDropdownButton.querySelector(".select-value").addEventListener("click", function () {

        if (this.classList.contains("active")) {
            this.classList.remove("active");

            hideDropdown();

        } else {

            emit("app:getServerVersions", null);

            this.classList.add("active");
        }

    });

    window.addEventListener("load", function () {

        listen("app_response:setup:checkInputFields", function (data) {

            mainApp.classList.remove("in-loader");
            contentLoader.classList.remove("visible");
            contentLoader.classList.remove("fadein");

        });

        listen("app:changepage", function (data) {

            switch (data) {
                case "main":
                    location.href = "./tabs/index.html";
                    break;
            }

        })

        listen("app_response:getServerVersions", function (res) {

            const versions = [];

            res.forEach(function (d) {

                versions.push(d.version);

            });

            showDropdown(versions, versionDropdownButton, versionDropdownButton.querySelector(".select-value"));

        });

        listen("app_response:getDataRequest", function (res) {

            const requestHeader = res.req;

            switch (requestHeader.request) {
                case "path":

                    const allElements = document.querySelectorAll("*");

                    allElements.forEach(function (node) {

                        const dataIdAttr = node.getAttribute("data-id");

                        if (dataIdAttr === null || requestHeader.dataId !== dataIdAttr) return;

                        node.innerText = res.data.cancelled === true ? node.innerText : res.data.filePaths[0];
                    });

                    break;
            }

        });

        init();

    });

})();