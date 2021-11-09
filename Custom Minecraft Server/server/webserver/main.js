const express = require("express"),
    path = require("path"),
    session = require("express-session"),
    history = require("../history");

const { initialize, handleGETRequests } = require("./router");

const port = 3232 || process.env.PORT;

const app = express();
const router = express.Router();

app.use(session({ secret: "bruh" }));

initialize(router);

handleGETRequests(router);

app.use("/", router);

function listen() {

    app.listen(port, function () {

        history.writeNewData("App", "log", `Started listening local web-server on port ${port}.`).log();

    });

}

module.exports = {
    listen: listen,
    app: app,
    router: router
}