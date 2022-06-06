import { IncomingMessage } from "http";
import { WebSocket, RawData, WebSocketServer } from "ws";
import Clients from "./Player";
import Client from "./Players";
import Card from "./Card";
import Parse from "./Message";
import Game from "./Game";
import Player from "./Player";

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
    }
});