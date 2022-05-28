// Import modules
import http from "http";
import WebSocket from "websocket";

const port = 8080;

const WebSocketServer = WebSocket.server;
let Clients = [];

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
    let Connection = request.accept(null, request.origin);

    Connection.on("close", e => {
        console.log("Client disconnection")
        Clients.splice(Clients.indexOf(Connection),1);
    });

    Connection.on("message", message => {
        const messageJson = JSON.parse(message.utf8Data);
        console.log(`[Client ${messageJson.name}] ${messageJson.data}`);
    });

    Clients.push(Connection);
    console.log("Client connected");
})

// Listen for incoming request on "http://localhost:8080/"
httpserver.listen(port, () =>{
    console.log(`Server is listening on port ${port}`);
});

/*
every5seconds();

// Send a random number to each Client
function every5seconds(){
    Clients.forEach(Connection => {
        Connection.send(Math.random())
    });
    setTimeout(every5seconds, 5000);
}
*/