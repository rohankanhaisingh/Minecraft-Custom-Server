import { emit, listen } from "../../dynamic/socket.js";

const mainApp = document.querySelector(".app"),
    contentLoader = document.querySelector(".app-contentloader"),
    toggleButtons = document.querySelectorAll(".group-content-toggle"),
    tabGroups = document.querySelectorAll(".app-tabcontent-group"),
    gridTiles = document.querySelectorAll(".settings-wallpaper-grid-item"),
    appWallpaper = document.querySelector("img.main-visible-background"),
    addWallpaperButton = document.querySelector(".button-wallpaper-add");

gridTiles.forEach(function (tile) {

    tile.addEventListener("click", function () {

        if (tile.classList.contains("button-wallpaper-add")) return;

        gridTiles.forEach(temp_tile => temp_tile.classList.remove("active"));

        tile.classList.add("active");

        const tileImage = tile.querySelector("img");

        appWallpaper.src = tileImage.src;

        emit("app:setDefaultBackground", tileImage.getAttribute("data-path"));

    });

});

addWallpaperButton.addEventListener("click", e => emit("app:getImagesInDir", null));

listen("app_response:app:getImagesInDir", function (res) {

    res.forEach(function (i) {

        const tile = document.createElement("div");
        tile.className = "settings-wallpaper-grid-item";

        const img = new Image();
        img.src = i.base64;

        img.setAttribute("data-path", i.path);

        tile.appendChild(img);


        tile.addEventListener("click", function (e) {

            document.querySelectorAll(".settings-wallpaper-grid-item").forEach(temp_tile => temp_tile.classList.remove("active"));

            tile.classList.add("active");

            appWallpaper.src = i.base64;

            emit("app:setDefaultBackground", i.path);

        });

        document.querySelector(".settings-wallpaper-grid-images").appendChild(tile);
    });

});

export function applyChanges(settingName, settingValue) {

    switch (settingName) {
        case "imageSize":

            switch (settingValue) {
                case "automatic":

                    if (appWallpaper.classList.contains("fit-to-size")) appWallpaper.classList.remove("fit-to-size");

                    break;
                case "fit to size":

                    if (!appWallpaper.classList.contains("fit-to-size")) appWallpaper.classList.add("fit-to-size");

                    break;
            }

            break;
    }

}