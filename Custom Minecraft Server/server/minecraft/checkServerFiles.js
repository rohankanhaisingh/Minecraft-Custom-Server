const fs = require("fs"),
    path = require("path"),
    url = require("url"),
    colors = require("colors");

/**
 * Check server files in selected directory.
 * @param {any} data
 * @param {any} callback
 */
function check(data, callback) {

    if (typeof data["server:path"] == "string") {
        if (fs.existsSync(data["server:path"])) {

            if (fs.existsSync(path.join(data["server:path"], "ValidateFiles.js"))) {

                const x = require(path.join(data["server:path"], "ValidateFiles.js"));

                x.init(callback);
                
            }

        }
    }

}

module.exports = {
    check: check
}