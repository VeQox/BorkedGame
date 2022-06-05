import { IncomingMessage } from "http";
import { WebSocket, RawData } from "ws";
import Clients from "./Clients";
import Client from "./Client";
import Card from "./Card";
import Parse from "./Parse";
import { Message } from "./Message"

const port : number = 8000;

let startingClient : Client;
let currentClient : Client;

let selectedCards : Card[];

let clients : Clients;

let started : boolean = false;
let reverse : boolean = false;

let cardsPerRound : number = 1; // Default value on a new Game
let currentCardsAmount : number;

const wss = new WebSocket.Server({
    port
});

wss.on("listening", () => {
    // Debug
    console.log(`Server is listening on port ${port}`);
    clients = new Clients();
});

wss.on("connection", (ws: WebSocket, request: IncomingMessage) => {
    if(!request.url ||started){
        if(clients == undefined || clients.count() == 4) return;
        console.log(`[Client ${(request.url as string).substring(1)}] connection failed`);
        ws.close(1013); // Close connection
    } 
    else {
        let client : Client = new Client((request.url as string).substring(1), ws);
        clients.add(client);

        // Debug
        console.log(`[Client ${client.name}] connected`);

        updateReady();

        ws.on("close", (code : number) => {
            clients.remove(client);

            // Debug
            console.log(`[Client ${client.name}] disconnected with code ${code}`);
        });

        ws.on("message", (message : RawData) => {
            const messageJson : Message = JSON.parse(message.toString());
            const name = messageJson.name;  
            const head = messageJson.head;
            const body = messageJson.body;
            
            //Debug
            console.log(`[Client ${name}] sent ${message.toString()}`);
        
            switch(head){
                case "setReady":
                    if(client.isReady()) return;
                    client.ready = true;
                    updateReady();

                    if(clients.areReady() && clients.readyCount() >= 2){
                        startingClient = clients.clients[0];
                        currentClient = startingClient;

                        started = true;
                        clients.getNewHands(1);
                        clients.send(Parse("server", "start", ""));
                        clients.send(Parse("server", "currentPlayer", `${currentClient.name}`))
                        clients.updateCards();
                    }
                    break;
                case "selectCard":
                    if(!started || client.hasSelected()) return;
                    if(client != currentClient) return;

                    const selectedCard = client.cards[body]
             
                    client.selectedCard = selectedCard;
                    selectedCards.push(selectedCard);

                    clients.send(Parse("server", "updateSelectedCards", selectedCards));
                
                    client.send(Parse("server", "disableSelect", ""));

                    // Debug
                    console.log(`[Client ${client.name}] selected ${JSON.stringify(client.selectedCard)}`)

                    if(client == startingClient){
                        clients.updateFirstSelectedCard(client);
                    }

                    if(clients.haveSelected()){

                        endTrick(getWinnerOfTrick());

                        if(currentCardsAmount === 0){
                            clients.calcPoints();

                            updateStartingPlayer();
                            updateCardsPerRound();
                        }
                    }
                    break;
                case "setCall":
                    if(!started) return;

                    client.calls = isNaN(body) ? 0 : body;
                    
                    // Debug
                    console.log(`[Client ${client.name}] sets their call as ${client.calls}`)
                    break;
            }
        });

    }
});

function updateReady(){
    let readyScreen = `${clients.readyCount()} / ${clients.count()}`;
    clients.send(Parse("server", "updateReady", `${readyScreen}`));
}

function updateCardsPerRound(){
    if(cardsPerRound == 10) reverse = true;
    reverse ? cardsPerRound-- : cardsPerRound++;
    currentCardsAmount == cardsPerRound;
}

function getWinnerOfTrick(){
    let winner : Client = clients.clients[0];

    clients.clients.forEach(client => {
        const CLIENT_VALUE : number = client.selectedCard.getValue();
        const WINNER_VALUE : number = winner.selectedCard.getValue();

        if(CLIENT_VALUE > WINNER_VALUE){
            winner = client;
        }
    });

    return winner;
}

function endTrick(winner : Client){
    winner.hits++;

    selectedCards.length = 0;

    currentCardsAmount--;

    clients.clients.forEach(client => {
        client.removeSelected();
        client.updateCards();
    });

    currentClient = winner;

    // Debug
    console.log(`[Client ${winner.name}] Won with ${JSON.stringify(winner.selectedCard)}`);
}

function updateStartingPlayer(){
    const indexStarting : number = clients.clients.indexOf(startingClient);
    if(indexStarting == clients.count()){
        startingClient = clients.clients[0];
    }
    else{
        startingClient = clients.clients[indexStarting + 1];
    }
    currentClient = startingClient;
}