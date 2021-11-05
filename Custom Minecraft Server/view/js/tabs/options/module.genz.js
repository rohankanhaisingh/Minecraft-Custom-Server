import { generateUniqueID } from "../../dynamic/generateUniqueID.js";
import { emit, listen } from "../../dynamic/socket.js";
import { applyChanges, importSettings } from "./module.fart.js";


function setTooltipInfo(displayName, property, type, description) {

    const tooltip = document.querySelector(".properties-tooltip");

    const displayNameNode = tooltip.querySelector(".properties-tooltip-displayname span"),
        typeNode = tooltip.querySelector(".properties-tooltip-type span"),
        descriptionNode = tooltip.querySelector(".properties-tooltip-description span");

    displayNameNode.innerText = displayName;
    typeNode.innerHTML = `${property} = ${type}`;
    descriptionNode.innerHTML = description;
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
 * @param {string} propertyName
 * @param {string} displayName
 * @param {string} description
 */
function createBoolNode(propertyName, displayName, description) {

    const nodeID = generateUniqueID(18).id;

    const mainNode = document.createElement("div");
    mainNode.className = "grid-cell properties-item";

    mainNode.setAttribute("node-id", nodeID);
    mainNode.setAttribute("node-type", "boolean");
    mainNode.setAttribute("property-name", propertyName);
    mainNode.setAttribute("property-value", false);
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

            mainNode.setAttribute("property-value", false);

        } else {
            nodeToggle.classList.add("active");

            mainNode.setAttribute("property-value", true);

        }

        applyChanges();

    });

    mainNode.appendChild(nodeToggle);

    mainNode.addEventListener("mouseout", hideTooltip);

    mainNode.addEventListener("mouseover", function () {

        const boundary = mainNode.getBoundingClientRect();

        setTooltipInfo(displayName, propertyName, "<strong class='boolean'>boolean</strong> (true | false)", description);

        showTooltip(boundary);
    });

    document.querySelector(".properties-wrapper-grid").appendChild(mainNode);
}

/**
 * Creates a select node.
 * @param {string} propertyName
 * @param {string} displayName
 * @param {string} description
 * @param {Array} options
 */
function createSelectNode(propertyName, displayName, description, options) {

    const nodeID = generateUniqueID(18).id;

    const mainNode = document.createElement("div");
    mainNode.className = "grid-cell properties-item";

    mainNode.setAttribute("node-id", nodeID);
    mainNode.setAttribute("node-type", "select");
    mainNode.setAttribute("property-name", propertyName);
    mainNode.setAttribute("property-value", options[0]);
    mainNode.setAttribute("data-description", description);

    const nodeTitle = document.createElement("div");
    nodeTitle.className = "grid-cell-title";

    nodeTitle.innerHTML = `<span>${displayName}</span>`;
    mainNode.appendChild(nodeTitle);


    const selectNode = document.createElement("div");
    selectNode.className = "grid-cell-select";

    selectNode.setAttribute("data-value", options[0]);
    selectNode.setAttribute("node-id", nodeID);


    const selectValueNode = document.createElement("div");
    selectValueNode.className = "grid-cell-select-value";

    selectValueNode.innerHTML = `<span>${options[0]}</span>`;

    selectValueNode.addEventListener("click", function () {

        if (selectNode.classList.contains("active")) {
            selectNode.classList.remove("active");

        } else {
            selectNode.classList.add("active");

        }

    });

    selectNode.appendChild(selectValueNode);

    mainNode.appendChild(selectNode);


    const selectOptionsNode = document.createElement("div");
    selectOptionsNode.className = "grid-cell-select-options";


    options.forEach(function (option) {

        const optionNode = document.createElement("div");

        optionNode.className = "grid-cell-select-option";
        optionNode.innerText = option;

        optionNode.addEventListener("click", function () {

            selectNode.setAttribute("data-value", option);
            mainNode.setAttribute("property-value", option);

            selectValueNode.innerHTML = `<span>${option}</span>`;

            selectNode.classList.remove("active");

            applyChanges();
        });

        selectOptionsNode.appendChild(optionNode);
    });



    selectNode.appendChild(selectOptionsNode);



    mainNode.addEventListener("mouseout", hideTooltip);

    mainNode.addEventListener("mouseover", function () {

        const boundary = mainNode.getBoundingClientRect();

        const o = [];

        options.forEach(function (option) {

            o.push(`<strong class="string">"${option}"</strong>`)

        });

        setTooltipInfo(displayName, propertyName, `<strong class="boolean">string</strong> (${o.join(" | ")})`, description);

        showTooltip(boundary);
    });

    document.querySelector(".properties-wrapper-grid").appendChild(mainNode);

}

export function handlePropertiesData(data) {

    if (typeof data !== "object") return false;

    for (const key in data) {

        const property = data[key];

        switch (property.type) {
            case "boolean":

                createBoolNode(key, property.displayname, property.description);

                break;
            case "dropdown":

                createSelectNode(key, property.displayname, property.description, property.items);

                break;
        }
            
    }

    emit("app:getPropertiesFile", null);

    listen("app_response:getPropertiesFile", function (res) {
        importSettings(res.parsedData);
    });
}