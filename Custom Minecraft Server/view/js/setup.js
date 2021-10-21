(function () {

    const tableItems = document.querySelectorAll(".table-container");

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

})();