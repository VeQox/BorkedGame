// Import modules
import http from "http";
import WebSocket from "websocket";

const WebSocketServer = WebSocket.server;
let connections = [];

// Create a http Server
const httpserver = http.createServer((req, res) => {
    console.log("we have received a request");
});

// Create a WebSocketServer
const websocket = new WebSocketServer({
    "httpServer": httpserver
});

// Set Events on every "Client" who connects
websocket.on("request", request => {

    let connection = request.accept(null, request.origin);

    connection.on("close", e => {
        console.log("Client disconnection")
        connections.splice(connections.indexOf(connection),1);
    });

    connection.on("message", message => {
        console.log(`Reveived Message [${message.utf8Data}]`);
    });

    console.log("Client connected");

    connections.push(connection);
})

// Listen for incoming request on "http://localhost:8080/"
httpserver.listen(8080, () =>{
    console.log("Server is listening on port 8080");
});

every5seconds();

// Send a random number to each Client
function every5seconds(){
    connections.forEach(connection => {
        connection.send(`Message: ${Math.random()}`)
    });
    setTimeout(every5seconds, 5000);
}