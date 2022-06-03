import {IncomingMessage} from 'http';
import Websocket, { RawData } from "ws";

const port : number = 8000;
const Types : string[] = ["♣","♠","♦","♥"];
const Values : string[] = ["2","3","4","5","6","7","8","9","10","B","Q","K","A"];

const wss = new Websocket.Server({port});

class Card {
    type : string;
    value : string;

    constructor(type: string, value: string) {
        this.type = type;
        this.value = value;
    }
}

class Client {
    name : string;
    connection : Websocket.WebSocket;
    cards : Card[];
    selectedCard : Card | undefined;
    points : number;
    hits : number;
    calls : number;
    ready : boolean;

    constructor(name: string, connection: any) {
        this.name = name;
        this.connection = connection;
        this.points = 0;
        this.hits = 0;
        this.calls = 0;
        this.cards = [] as Card[];
        this.selectedCard = undefined; // didnt find a init value
        this.ready = false;
    }

    send(msg: string) {
        this.connection.send(msg);
    }

    removeSelected(){
        this.cards.splice(this.cards.indexOf(this.selectedCard as Card), 1);
    }

    update(){
        this.send(JSON.stringify(Parse("server", "update", this.cards)));
    }

    isReady(){
        return this.ready;
    }

    hasSelected(){
        return this.selectedCard !== undefined
    }

    getNewHand(amount : number){
        this.cards = [];
        for(let i = 0; i < amount; i++){
            let Card = this.getNewCard();
            this.cards.push(Card);
            UsedCards.push(Card);
        }
    }

    getNewCard(){
        let Card : Card;
        do {
            Card = Stack[Math.floor(Math.random()*Stack.length)];
        } while (UsedCards.indexOf(Card) !== -1);
        return Card;
    }
}

type Message = {
    "name" : string,
    "head" : string,
    "data" : string,
}

let ReadyCount : number = 0;
let currentClient : Client;
let CardsPerRound : number = 1;
let CurrentCardsCount : number = CardsPerRound;
let started : boolean = false;
let reverse : boolean  = false;
let SelectedCardsCount : number = 0;
let clients : Client[] = [];
let UsedCards : Card[] = [];
const Stack : Card[] = InitStack();

wss.on("listening", () => {
    // Debug
    console.log(`Server is listening on port ${port}`)
});

wss.on("connection", (ws: Websocket.WebSocket, request: IncomingMessage) => {
    if (!request.url || clients.length == 4 || started) {
        console.log(`[Client ${(request.url as string).substring(1)}] connection failed`)
        ws.close(1000);
    } else {
        let client : Client = new Client((request.url as string).substring(1), ws);
        client.getNewHand(CardsPerRound);
        //client.send(JSON.stringify(Parse("server", "newRound", client.cards)));
        clients.push(client);
        currentClient = clients[0];

        clients.forEach(Client => {
            Client.send(JSON.stringify(Parse("server", "updateReady", `${ReadyCount} / ${clients.length}`)))
        });

        // Debug
        console.log(`[Client ${client.name}] connected`);

        ws.on('close', (code : number) => {
            // Debug
            if(client.isReady()){
                ReadyCount--;
            }
            console.log(`[Client ${client.name}] disconnected with code ${code}`);
            clients.splice(clients.indexOf(client), 1);
        });

        ws.on("message", (message : RawData) => {
            const messageJson : Message = JSON.parse(message.toString());

            console.log(`[Client ${messageJson.name}] sent "${messageJson.data}"`);

            switch(messageJson.head){
                case "setReady":
                    if(client.isReady()) return;
                    client.ready = true;
                    ReadyCount++;
                    clients.forEach(Client => {
                        Client.send(JSON.stringify(Parse("server", "updateReady", `${ReadyCount} / ${clients.length}`)))
                    });

                    if(ReadyCount == clients.length && ReadyCount >= 2){
                        started = true;
                        clients.forEach(Client => {
                            Client.send(JSON.stringify(Parse("server", "start", "")));
                            Client.send(JSON.stringify(Parse("server", "update", Client.cards)))
                        });
                    }
                    break;
                case "select":
                    if(!started) return;
                    if(client.hasSelected()) return;
                    if(!currentClient.hasSelected() && client != currentClient) return;

                    SelectCard(client, client.cards[parseInt(messageJson.data)]);
                    SelectedCardsCount++;

                    if(currentClient == client){
                        clients.forEach(Client => {
                            if(Client !== currentClient){
                                Client.send(JSON.stringify(Parse("server", "firstCard", currentClient.selectedCard)));
                            }
                        });
                    }

                    if(SelectedCardsCount === clients.length){ // if everyone has set a Card

                        EndTrick(GetWinnerOfTrick());

                        if(CurrentCardsCount == 0){
                            CalculatePoints();

                            SetCardsPerRound();

                            UsedCards = [];
                            clients.forEach(Client => {
                                Client.getNewHand(CardsPerRound);
                                Client.send(JSON.stringify(Parse("server", "newRound", Client.cards)))
                            });
                        }
                    } 
                    break;
                case "setCalls":
                    if(!started) return;
                    SetCalls(client, parseInt(messageJson.data));
                    break;
            }
        });
    }
});

function AreReady(){
    clients.forEach(Client => {
        if(!Client.isReady()){
            return false;
        }
    });
    return true;
}

function SetCalls(Client : Client, call : number){
    Client.calls = isNaN(call) ? 0 : call;
    // Debug
    console.log(`[Client ${Client.name}] sets their call as ${Client.calls}`)
}

function SetCardsPerRound(){
    if(CardsPerRound === 10){
        reverse = true;
    }
    if(!reverse){
        CardsPerRound++;
        CurrentCardsCount = CardsPerRound;
    }
    else{
        CardsPerRound--;
        CurrentCardsCount = CardsPerRound;
    }
}

function CalculatePoints(){
    clients.forEach(Client => {
        if(Client.calls === Client.hits){
            Client.points += Client.calls + 1;
        }
        else if(Client.calls > Client.hits){
            Client.points += Client.hits - Client.calls;
        }
        else if(Client.calls < Client.hits){
            Client.points += Client.calls - Client.hits;
        }
        Client.send(JSON.stringify(Parse("server", "points", Client.points)));
    });
}

function SelectCard(Client : Client, selectedCard : Card){
    // Debug
    console.log(`[Client ${Client.name}] selected ${JSON.stringify(selectedCard)}`)
    Client.selectedCard = selectedCard;
}

function EndTrick(Winner : Client){
    Winner.hits++;
    // Debug
    console.log(`[Client ${Winner.name}] Won with ${JSON.stringify(Winner.selectedCard)}`);

    SelectedCardsCount = 0;
    CurrentCardsCount--;
    clients.forEach(Client => {
        Client.removeSelected();
        Client.update();
        Client.selectedCard = undefined;
    });
    currentClient = clients.indexOf(currentClient) == clients.length ? clients[0] : clients[clients.indexOf(currentClient)+1];
}

function Parse(name : string, head : string, data : any){
    const message : Message = {
        "name": name,
        "head": head,
        "data": data
    }
    return message;
}

function GetWinnerOfTrick(){
    let winner : Client = clients[0];

    clients.forEach(client => {
        const CLIENT_TYPE : number = Types.indexOf((client.selectedCard as Card).type);
        const WINNER_TYPE : number = Types.indexOf((winner.selectedCard as Card).type);

        if(winner !== client && CLIENT_TYPE > WINNER_TYPE){
            winner = client;
        }

        const CLIENT_VALUE : number = Values.indexOf((client.selectedCard as Card).value);
        const WINNER_VALUE : number = Values.indexOf((winner.selectedCard as Card).value);

        if(winner !== client && CLIENT_VALUE > WINNER_VALUE){
            winner = client;
        }
    });

    return winner;
}

function InitStack(){
    let tmp : Card[] = [];
    Types.forEach(Type => {
        Values.forEach(Value => {
            let card: Card = new Card(Type, Value);
            tmp.push(card);
        });
    });
    return tmp;
}