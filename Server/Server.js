// Import modules
import { strictEqual } from "assert";
import http from "http";
import WebSocket from "websocket";

const port = 8080;
const Types = ["♣","♠","♦","♥"];
const Values = ["2","3","4","5","6","7","8","9","10","B","Q","K","A"];


const WebSocketServer = WebSocket.server;
let Clients = [];
let UsedCards = [];
let Stack = [];


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

    let cardArray = GetNewHand(10);

    Connection.send(JSON.stringify(cardArray));

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

const InitStack = () => {
    Types.forEach(Type => {
        Values.forEach(Value => {
            let Card = {};
            Card.type = Type;
            Card.value = Value;
            Stack.push(Card);
        });
    });
}

InitStack();

const GetNewHand = (amount) => {
    let Cards = [];
    for(let i = 0; i < amount; i++){
        let Card = GetNewCard();
        Cards.push(Card);
        UsedCards.push(Card);
    }
    return Cards;
}

const GetNewCard = () => {
    let Card = {};
    do {
        Card = Stack[Math.floor(Math.random()*Stack.length)];
    } while (UsedCards.includes(Card));
    return Card;
}