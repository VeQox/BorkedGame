import Card from "./Card"
import Websocket from "ws";
import Parse from "./Parse";

export default class Client {
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

    calcPoints(){
        if(this.calls == this.hits){
            this.points += this.calls + 1;
        }
            
        if(this.calls > this.hits){
            this.points += this.hits - this.calls;
        }

        if(this.calls < this.hits){
            this.points += this.calls - this.hits;
        }

        this.updatePoints;
    }

    updatePoints(){
        this.send(Parse("server", "updatePoints", this.points));
    }

    send(msg: string) {
        this.connection.send(msg);
    }

    removeSelected(){
        this.cards.splice(this.cards.indexOf(this.selectedCard as Card), 1);
    }

    updateCards(){
        this.send(Parse("server", "updateCards", this.cards));
    }

    isReady(){
        return this.ready;
    }

    hasSelected(){
        return this.selectedCard !== undefined
    }
}