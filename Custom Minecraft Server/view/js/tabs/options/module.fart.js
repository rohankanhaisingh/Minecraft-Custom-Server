import { emit } from "../../dynamic/socket.js";

export function applyChanges(existingData) {
    const properties = document.querySelectorAll(".properties-item");

    const tempObj = {};

    properties.forEach(function (property) {

        const propertyName = property.getAttribute("property-name"),
            propertyValue = property.getAttribute("property-value");

        tempObj[propertyName] = propertyValue;
    });

    emit("app:applychanges", {
        fileName: "server.properties",
        data: tempObj
    });
}

export function importSettings(data) {

    const propertyNodes = document.querySelectorAll(".properties-item");

    console.log(data);

    propertyNodes.forEach(function (node) {

        const nodeKey = node.getAttribute("property-name"),
            nodeType = node.getAttribute("node-type");

        for (let key in data) {

            if (key === nodeKey) {

                const x = data[key];

                switch (nodeType) {
                    case "boolean":

                        if (x === "true") {
                            node.setAttribute("property-value", true);

                            node.querySelector(".grid-cell-toggle").classList.add("active");
                        }

                        break;
                    case "select":

                        node.setAttribute("property-value", x);

                        node.querySelector(".grid-cell-select").setAttribute("data-value", x);
                        node.querySelector(".grid-cell-select-value span").innerText = x;

                        break;
                }

            }

        }

    });

}