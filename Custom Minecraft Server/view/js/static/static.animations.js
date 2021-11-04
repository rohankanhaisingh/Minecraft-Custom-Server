const wallpaperImage = document.querySelector(".app-wallpaper img"),
    mainApp = document.querySelector(".app"),
    tabContent = document.querySelector(".app-tabcontent");

const scrollHeight = tabContent.scrollHeight;

tabContent.addEventListener("scroll", function (event) {

    const scrollTop = 20 / scrollHeight * tabContent.scrollTop;

    wallpaperImage.style.transform = `translateY(${-scrollTop}%)`;
});