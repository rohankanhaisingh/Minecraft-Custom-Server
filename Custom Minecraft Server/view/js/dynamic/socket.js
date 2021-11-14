const io = require("socket.io-client");

export const socket = io.connect("http://localhost:8000", {
    reconnection: true,
    reconnectionDelay: 500,
    reconnectionDelayMax: 2000
});

socket.on("connect_error", function (err) {

    location.href = location.href + "?" + err.message;

});

export function init() {

    socket.emit("client_connect", {
        timestamp: Date.now()
    });
}

/**
 * Listens for events from the server.
 * @param {string} event
 * @param {Function} callback
 */
export function listen(event, callback) {

    if (typeof event !== "string" && typeof callback !== "function") return;

    socket.on(event, callback);

    return socket;

}

/**
 * Emits data to the server.
 * @param {string} channel
 * @param {string} args
 */
export function emit(channel, args) {

    if (typeof channel !== "string" && typeof args !== "string") return;

    socket.emit(channel, args);

}