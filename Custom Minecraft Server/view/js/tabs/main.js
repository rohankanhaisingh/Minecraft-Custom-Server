(function () {

    const mainApp = document.querySelector(".app"),
        contentLoader = document.querySelector(".app-contentloader");

    window.addEventListener("load", function () {

        this.setTimeout(function () {

            contentLoader.classList.add("fadeout");

            setTimeout(function () {

                contentLoader.classList.remove("visible");
                contentLoader.classList.remove("fadeout");

            }, 1000);

        }, 1000);

    });

})();