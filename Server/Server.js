// Import modules
import http from "http";
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

const Parse = (head, data) => {
    return data = {
        "head": head,
        "data": data
    }
}

const EvaluateWinnerOfRound = () => {
    let Winner = Clients[0];

    Clients.forEach(Client => {

        if(Winner !== Client && Types.indexOf(Client.selectedCard.type) > Types.indexOf(Winner.selectedCard.type)){
            Winner = Client;
        }
        if(Winner !== Client && Values.indexOf(Client.selectedCard.value) > Types.indexOf(Winner.selectedCard.value)){
            Winner = Client;
        }
    });

    return Winner;
}

// Set Events on every "Client" who connects
websocket.on("request", request => {

    let name = request.resource.split("=")[1];
    let Connection = request.accept(null, request.origin);

    let Client = {};
    Client.name = name;
    Client.connection = Connection;
    Client.cards = [];
    Client.points = 0;
    Client.hits = 0;
    Client.calls = 0;

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
                Client.cards.splice(Client.cards.indexOf(Client.selectedCard),1);
                Client.connection.send(JSON.stringify(Parse("display", Client.cards)));
                SelectedCardsCount++;
                if(SelectedCardsCount === Clients.length){
                    const Winner = EvaluateWinnerOfRound();
                    Winner.hits++;
                    SelectedCardsCount = 0;
                    console.log(`[Client ${Winner.name} ${Winner.hits}] Won with ${JSON.stringify(Winner.selectedCard)}`)

                    Clients.forEach(client => {
                        client.selectedCard = undefined;
                    });
                }
                break; 
        
            case "getCards":
                Client.calls = messageJson.data;
                Client.cards = GetNewHand(10);
                Client.connection.send(JSON.stringify(Parse("display", Client.cards)));
        }
    });

    Clients.push(Client);
    console.log(`Client ${Client.name} connected`);
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