// Import modules
import { strictEqual } from "assert";
import http from "http";
import { connect } from "http2";
import { resolve } from "path";
import WebSocket from "websocket";

const port = 8080;
const Types = ["♣","♠","♦","♥"];
const Values = ["2","3","4","5","6","7","8","9","10","B","Q","K","A"];


const WebSocketServer = WebSocket.server;
let SelectedCardsCount = 0;
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

// Wait for every Client to Select a card
const WaitForSelection = () => {
    return new Promise(resolve => {
        if(SelectedCardsCount === Clients.length){

            resolve();
        }
    })
}

// Set Events on every "Client" who connects
websocket.on("request", request => {

    let name = request.resource.split("=")[1];
    let Connection = request.accept(null, request.origin);

    let Client = {};
    Client.name = name;
    Client.connection = Connection;
    Client.cards = GetNewHand(10);
    
    Client.connection.send(JSON.stringify(Client.cards));

    Client.connection.on("close", e => {
        console.log("Client disconnection")
        Clients.splice(Clients.indexOf(Client),1);
    });

    Client.connection.on("message", message => {
        const messageJson = JSON.parse(message.utf8Data);

        switch(messageJson.head){
            case "":
                console.log(`[Client ${Client.name}] ${messageJson.data}`);
                break;
            
            case "select":
                if(Client.selectedCard !== undefined){
                    return;
                }
                console.log(`[Client ${Client.name}] selected ${messageJson.data}`);
                Client.selectedCard = Client.cards[messageJson.data];
                SelectedCardsCount++;
                break; 
        }
    });

    Clients.push(Client);
    console.log(`Client ${Client.name} connected`);
})

const kok = async () => {
    const result = await WaitForSelection();
    console.log(result);
}

kok();

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