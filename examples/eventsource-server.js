// Simple evnentsource server demo
var response = require("ringo/jsgi/response");
var arrays = require("ringo/utils/arrays");

var connections = [];

exports.app = function(req) {
    return response.static(module.resolve("html/eventsource.html"), "text/html");
};

function onconnect(conn) {
    conn.addListener("open", function() {
        connections.push(conn);
        console.info("Opening connection, " + connections.length + " open");
    });
    conn.addListener("close", function() {
        arrays.remove(connections, conn);
        console.info("Closing connection, " + connections.length + " remaining");
    })
}

function broadcastTime() {
    var now = (new Date()).toString();
    connections.forEach(function(conn) {
        conn.data(now);
    });
    console.info("Broadcasting ", now);
}

if (require.main == module) {
    var server = require("ringo/httpserver").main(module.id);
    server.getDefaultContext().addEventSource("/eventsource", onconnect, {heartBeatPeriod: 1});
    setInterval(broadcastTime, 2 * 1000);
}