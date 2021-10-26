import { generateUniqueID } from "./generateUniqueID.js";

function createNode(title, message, detail) {

    const mainNode = document.createElement("div");
    mainNode.className = "app-toast";

    const titleNode = document.createElement("div");
    titleNode.className = "app-toast-title";
    titleNode.innerText = title;

    const messageNode = document.createElement("div");
    messageNode.className = "app-toast-message";
    messageNode.innerText = message;

    const detailNode = document.createElement("div");
    detailNode.className = "app-toast-detail";
    detailNode.innerText = detail;

    mainNode.appendChild(titleNode);
    mainNode.appendChild(messageNode);
    mainNode.appendChild(detailNode);

    return mainNode;
}

export const Toasts = [];

export class Toast {
    constructor(title, message, detail, duration) {
        this.type = "toast";
        this.id = generateUniqueID(18);

        this.title = typeof title === "string" ? title : "Toast title.";
        this.message = typeof message === "string" ? message : "Toast message.";
        this.detail = typeof detail === "string" ? detail : "Toast detail.";
        this.duration = typeof duration === "number" ? duration : 4000;

        this.node = createNode(this.title, this.message, this.detail);
    }
    Show() {

        const toastWrapper = document.querySelector(".app-toasts-wrapper");

        toastWrapper.appendChild(this.node);

        setTimeout(() => {

            this.node.classList.add("fadeout");

            setTimeout(() => {
                this.node.remove();
            }, 500);

        }, this.duration);

        return this;
    }
}