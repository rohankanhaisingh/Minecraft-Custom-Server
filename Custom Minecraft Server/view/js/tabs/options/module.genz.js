import { generateUniqueID } from "../../dynamic/generateUniqueID.js";


function setTooltipInfo(displayName, property, type, description) {

    const tooltip = document.querySelector(".properties-tooltip");

    const displayNameNode = tooltip.querySelector(".properties-tooltip-displayname span"),
        typeNode = tooltip.querySelector(".properties-tooltip-type span"),
        descriptionNode = tooltip.querySelector(".properties-tooltip-description span");

    displayNameNode.innerText = displayName;
    typeNode.innerHTML = `${property} = <strong class="boolean">${type}</strong>`;
    descriptionNode.innerText = description;
}

function showTooltip(boundary) {

    const tooltip = document.querySelector(".properties-tooltip"),
        tooltipBoundary = tooltip.getBoundingClientRect();

    tooltip.classList.remove("hidden");

    let y = boundary.top - (tooltipBoundary.height + 10),
        x = boundary.left;

    if (y < tooltipBoundary.height + 10) {
        y = tooltipBoundary.height;
    }

    tooltip.style.top = y + "px";
    tooltip.style.left = x + "px";
}

function hideTooltip() {
    const tooltip = document.querySelector(".properties-tooltip"),
        tooltipBoundary = tooltip.getBoundingClientRect();

    if (!tooltip.classList.contains("hidden")) {
        tooltip.classList.add("hidden");
    }
}

/**
 * Creates a bool toggle node.
 * @param {any} propertyName
 * @param {any} displayName
 * @param {any} description
 */
function createBoolNode(propertyName, displayName, description) {

    const nodeID = generateUniqueID(18).id;

    const mainNode = document.createElement("div");
    mainNode.className = "grid-cell properties-item";

    mainNode.setAttribute("node-id", nodeID);
    mainNode.setAttribute("property-name", propertyName);
    mainNode.setAttribute("data-description", description);

    const nodeTitle = document.createElement("div");
    nodeTitle.className = "grid-cell-title";

    nodeTitle.innerHTML = `<span>${displayName}</span>`;
    mainNode.appendChild(nodeTitle);


    const nodeToggle = document.createElement("div");
    nodeToggle.className = "grid-cell-toggle";

    nodeToggle.addEventListener("click", function (event) {

        if (nodeToggle.classList.contains("active")) {
            nodeToggle.classList.remove("active");
        } else {
            nodeToggle.classList.add("active");
        }

    });

    mainNode.appendChild(nodeToggle);

    mainNode.addEventListener("mouseout", hideTooltip);

    mainNode.addEventListener("mouseover", function () {

        const boundary = mainNode.getBoundingClientRect();

        setTooltipInfo(displayName, propertyName, "bool (true | false)", description);

        showTooltip(boundary);
    });

    document.querySelector(".properties-wrapper-grid").appendChild(mainNode);
}

export function handlePropertiesData(data) {

    if (typeof data !== "object") return false;

    console.log(data);

    for (const key in data) {

        const property = data[key];

        switch (property.type) {
            case "boolean":

                createBoolNode(key, property.displayname, property.description);

                break;
        }
            
    }
}