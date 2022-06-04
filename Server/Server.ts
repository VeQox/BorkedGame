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
});

wss.on("connection", (ws: WebSocket, request: IncomingMessage) => {
    if(!request.url || clients.count() == 4 ||started){
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
            console.log(`[Client ${name}] sent ${messageJson}`);
        
            switch(head){
                case "setReady":
                    if(client.isReady()) return;
                    client.ready = true;
                    updateReady();

                    if(clients.areReady() && clients.readyCount() >= 2){
                        started = true;
                        clients.getNewHands(1);
                        clients.send(Parse("server", "start", ""));
                        clients.updateCards();
                    }
                    break;
                case "selectCard":
                    if(!started || client.hasSelected()) return;


                    if(currentClient.hasSelected()){
                        client.selectedCard = body;
                    }
                    if(client == currentClient){
                        client.selectedCard = body;
                        clients.updateFirstSelectedCard(body);
                    }
                    

                    // Debug
                    console.log(`[Client ${client.name}] selected ${JSON.stringify(client.selectedCard)}`)
                    
                    if(clients.haveSelected()){
                        // end stitch
                    }
                    break;
            }
        });

    }
});

function updateReady(){
    clients.send(Parse("server", "updateReady", `${clients.readyCount()} / ${clients.count}`));
}