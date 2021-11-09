const outputContainer = document.querySelector(".terminal-output"),
    mainApp = document.querySelector(".app");


/**
 * Creates a output stream.
 * @param {string} stream
 * @param {string} type
 * @param {string} content
 */
export function createOutputStream(stream, type, content, force) {

    if (!force) if (typeof content === "undefined" || typeof stream === "undefined" || typeof type === "undefined") return;

    if (content == "" || content.length < 1) return null;

    const streamNode = document.createElement("div");
    streamNode.className = "terminal-output-stream";
    streamNode.classList.add(type)

    const streamTypeNode = document.createElement("div");
    streamTypeNode.className = "stream-type";
    streamTypeNode.innerHTML = "<span>" + stream + "</span>";
    streamNode.appendChild(streamTypeNode);

    streamTypeNode.addEventListener("click", function () {

        if (streamNode.classList.contains("collapsed")) {
            streamNode.classList.remove("collapsed");
        } else {
            streamNode.classList.add("collapsed");
        }
    });

    const streamContentNode = document.createElement("div");
    streamContentNode.className = "stream-content";
    streamContentNode.innerHTML = "<span>" + content + "</span>";
    streamNode.appendChild(streamContentNode);

    outputContainer.appendChild(streamNode);

    let boundary = streamNode.getBoundingClientRect()

    outputContainer.scroll({
        behavior: "smooth",
        top: outputContainer.scrollHeight + boundary.height
    });

    return streamNode;
}