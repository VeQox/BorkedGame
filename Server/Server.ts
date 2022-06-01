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

    constructor(name: string, connection: any, cards: Card[]) {
        this.name = name;
        this.connection = connection;
        this.points = 0;
        this.hits = 0;
        this.calls = 0;
        this.cards = cards;
        this.selectedCard = undefined; // didnt find a init value
    }

    send(msg: string) {
        this.connection.send(msg);
    }
}
type Message = {
    "name" : string,
    "head" : string,
    "data" : string,
}

let CardsPerRound : number = 1;
let CurrentCardsCount : number = CardsPerRound;
let reverse : boolean  = false;
let SelectedCardsCount : number = 0;
let clients : Client[] = [];
let UsedCards : Card[] = [];
const Stack : Card[] = InitStack();

wss.on("listening", () => {
    // Debug
    console.log(`Server is listenng on port ${port}`)
});

wss.on("connection", (ws: Websocket.WebSocket, request: IncomingMessage) => {
    if (!request.url) {
        ws.close(500);
    } else {
        let client : Client = new Client(request.url.substring(1), ws, GetNewHand(CardsPerRound));
        client.send(JSON.stringify(Parse("server", "newRound", client.cards)));
        clients.push(client);
        // Debug
        console.log(`[Client ${client.name}] connected`);

        ws.on('close', (code : number) => {
            // Debug
            console.log(`[Client ${client.name}] disconnected with code ${code}`);
            clients.splice(clients.indexOf(client), 1);
        });

        ws.on("message", (message : RawData) => {
            const messageJson : Message = JSON.parse(message.toString());

            console.log(`[Client ${messageJson.name}] sent "${messageJson.data}"`);

            switch(messageJson.head){
                case "select":
                    if(HasSelected(client)) return;

                    SelectCard(client, client.cards[parseInt(messageJson.data)]);
                    SelectedCardsCount++;

                    if(SelectedCardsCount === clients.length){

                        EndTrick(GetWinnerOfTrick());

                        if(CurrentCardsCount == 0){

                            CalculatePoints();

                            SetCardsPerRound();

                            UsedCards = [];
                            clients.forEach(client => {
                                client.cards = GetNewHand(CardsPerRound);
                                client.send(JSON.stringify(Parse("server", "newRound", client.cards)))
                            });
                        }
                    } 
                    break;
                case "setCalls":
                    SetCalls(client, parseInt(messageJson.data));
                    break;
            }
        });
    }
});

function RemoveSelectedCard(Client : Client){
    Client.cards.splice(Client.cards.indexOf(Client.selectedCard as Card), 1);
    Client.send(JSON.stringify(Parse("server", "update", Client.cards)));
}

function HasSelected(Client: Client){
    return Client.selectedCard !== undefined
}

function SetCalls(Client : Client, call : number){
    Client.calls = isNaN(call) ? 0 : call;
    // Debug
    console.log(`Client ${Client.name} sets their call as ${Client.calls}`)
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
        RemoveSelectedCard(Client);
        Client.selectedCard = undefined;
    });
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

function GetNewHand(amount : number){
    let Cards : Card[] = [];
    for(let i = 0; i < amount; i++){
        let Card = GetNewCard();
        Cards.push(Card);
        UsedCards.push(Card);
    }
    return Cards;
}

function GetNewCard(){
    let Card : Card;
    do {
        Card = Stack[Math.floor(Math.random()*Stack.length)];
    } while (UsedCards.indexOf(Card) !== -1);
    return Card;
}