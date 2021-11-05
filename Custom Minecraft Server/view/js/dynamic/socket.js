const io = require("socket.io-client");

export const socket = io("http://localhost:8000");

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

    return event;

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