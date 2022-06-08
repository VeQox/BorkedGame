import { IncomingMessage } from "http";
import { WebSocket, RawData, WebSocketServer } from "ws";
import Clients from "./Player";
import Client from "./Players";
import Card from "./Card";
import Parse from "./Message";
import Game from "./Game";
import Player from "./Player";
import Message from "./Message";

const port = 8000;

let CardGame : Game = new Game();

const wss : WebSocketServer = new WebSocket.Server({port});

wss.on("listening", () => {
    console.log(`Server is listening on port ${port}`);
})

wss.on("connection",  (ws: WebSocket, request: IncomingMessage) => {
    if(!request.url || CardGame.started || CardGame.count() == 4){
        console.log(`[Client ${(request.url as string).substring(1)}] connection failed`);
        ws.close(1013);
    }
    else{
        let player : Player = new Player((request.url as string).substring(1), ws);
        CardGame.add(player);

        console.log(`[Client ${player.name}] connected`);

        ws.on("message", (message : RawData) => {
            const messageJSON = JSON.parse(message.toString());
            const name = messageJSON.name;
            const head = messageJSON.head;
            const body = messageJSON.body;

            //Debug
            console.log(`[Client ${name}] sent ${message.toString()}`);

            switch(head){
                case "setReady":
                    CardGame.setReady(player);
                    CardGame.updateReady();

                    if(CardGame.players.areReady() && CardGame.players.readyCount() >= 2){
                        CardGame.start();
                        CardGame.updateCards();
                    }
                    break;
                case "selectCard":
                    if(CardGame.selectCard(player, body)){
                        CardGame.players.updateCards();
                        player.disableSelect();

                        // Debug
                        console.log(`[Client ${player.name}] selected ${JSON.stringify(player.selectedCard)}`);

                        if(CardGame.isStartingPlayer(player)){
                            CardGame.forceType();
                        }

                        if(CardGame.players.haveSelected()){
                            CardGame.endTrick();

                            if(CardGame.isRoundOver()){
                                CardGame.endRound();
                            }
                        }
                    }
                    break;
                case "setCall":
                    
                    break;
                
            }
        });
    }
});