import { emit, init, listen } from "./dynamic/socket.js";

(function () {

    const tableItems = document.querySelectorAll(".table-container"),
        inputfields = document.querySelectorAll(".item-input"),
        acceptButton = document.querySelector(".setup-acceptbutton"),
        mainApp = document.querySelector(".app"),
        contentLoader = document.querySelector(".app-contentloader");


    function checkInputFields() {

        const tableItems = document.querySelectorAll(".table-item");

        const tempObj = {};

        tableItems.forEach(function (item) {

            const field = item.querySelector(".item-input");

            const fieldID = field.getAttribute("data-id");

            tempObj[fieldID] = field.innerText !== "" ? field.innerText : null;

        });

        emit("app:setup:checkInputFields", tempObj);
    }


    inputfields.forEach(function (input) {
        input.addEventListener("paste", function (e) {
            event.preventDefault();

            const text = event.clipboardData.getData('text/plain');

            document.execCommand('insertText', false, text);
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

    window.addEventListener("load", function () {

        listen("app_response:setup:checkInputFields", function (data) {

            mainApp.classList.remove("in-loader");
            contentLoader.classList.remove("visible");
            contentLoader.classList.remove("fadein");

        });

        listen("app:changepage", function (data) {

            console.log(data);

            switch (data) {
                case "main":
                    location.href = "./tabs/index.html";
                    break;
            }

        })

        init();

    });

})();