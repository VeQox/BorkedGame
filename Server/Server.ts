import http from "http";
import Websocket from "websocket";

const port : number = 8080;
const Types : string[] = ["♣","♠","♦","♥"];
const Values : string[] = ["2","3","4","5","6","7","8","9","10","B","Q","K","A"];

const WebSocketServer = Websocket.server;

type Card = {
    type : string,
    value : string
}
type Client = {
    name : string,
    connection : any,
    cards : Card[],
    selectedCard : Card,
    points : number,
    hits : number,
    calls : number
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
let Clients : Client[];
let UsedCards : Card[] = [];
const Stack : Card[] = InitStack();

const httpserver = http.createServer((req, res) => {
    console.log("we have received a request");
});

httpserver.listen(port, () =>{
    // Debug
    console.log(`Server is listening on port ${port}`);
});

const websocket = new WebSocketServer({
    "httpServer": httpserver
});

websocket.on("request", (request : any) => {
    let Client : Client;
    Client.name = request.ressource.split("=")[1];
    Client.connection = request.accept(null, request.origin);
    Client.points = 0;
    Client.hits = 0;
    Client.calls = 0;
    Client.cards = GetNewHand(CardsPerRound);

    Clients.push(Client);
    // Debug
    console.log(`Client ${Client.name} connected`);

    Client.connection.on("close", (code : number) => {
        // Debug
        console.log(`[Client ${Client.name}] disconnected with code ${code}`);
        Clients.splice(Clients.indexOf(Client), 1);
    });

    Client.connection.on("message", (message : any) => {
        const messageJson : Message = JSON.parse(message.utf8Data);

        switch(messageJson.head){
            case "select":
                if(Client.selectedCard !== undefined) return;

                SelectCard(Client, Client.cards[messageJson.data]);

                if(SelectedCardsCount === Clients.length) EndRound();
                break;
        }
    });
});

function SelectCard(Client : Client, selectedCard : Card){
    Client.selectedCard = selectedCard;
    Client.cards.splice(Client.cards.indexOf(Client.selectedCard), 1);
    Client.connection.send(JSON.stringify(Parse("server", "display", Client.cards)));
    SelectedCardsCount++;
}

function EndRound(){
    const Winner : Client = GetWinnerOfRound();
    Winner.hits++;
    SelectedCardsCount = 0;
    // Debug
    console.log(`[Client ${Winner.name} ${Winner.hits}] Won with ${JSON.stringify(Winner.selectedCard)}`)

    Clients.forEach(Client => {
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

function GetWinnerOfRound(){
    let Winner : Client = Clients[0];

    Clients.forEach(Client => {
        const ClientType : number = Types.indexOf(Client.selectedCard.type);
        const WinnerType : number = Types.indexOf(Winner.selectedCard.type);

        if(Winner !== Client && ClientType > WinnerType){
            Winner = Client;
        }

        const ClientValue : number = Values.indexOf(Client.selectedCard.value);
        const WinnerValue : number = Values.indexOf(Winner.selectedCard.value);

        if(Winner !== Client && ClientValue > WinnerValue){
            Winner = Client;
        }
    });

    return Winner;
}

function InitStack(){
    let tmp : Card[];
    Types.forEach(Type => {
        Values.forEach(Value => {
            let Card : Card;
            Card.type = Type;
            Card.value = Value;
            tmp.push(Card);
        });
    });
    return tmp;
}

function GetNewHand(amount : number){
    let Cards : Card[];
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
    } while (UsedCards.includes(Card));
    return Card;
}