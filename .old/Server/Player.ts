import Card from "./Card";
import Cards from "./Cards";
import WebSocket from "ws";
import Parse from "./Parse";

export default class Player{
    public name : string;
    public cards : Cards;
    public points : number;
    public hits : number;
    public calls : number; 
    public connection : WebSocket;
    public selectedCard : Card;
    public readyState :  boolean;

    constructor(name : string = "", connection : WebSocket) {
        this.name = name;
        this.connection = connection;
        this.points = 0;
        this.calls = 0;
        this.cards = new Cards();
        this.selectedCard = {} as Card;
        this.readyState = false;
    }

    removeSelectedCard(){
        this.cards.remove(this.selectedCard);
        this.selectedCard = {} as Card;
    }

    // Calculations
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

        this.hits = 0;
        this.calls = 0;
    }
    // ---


    // Communication
    updatePoints(){
        this.send(Parse("server", "updatePoints", this.points));
    }

    updateCards(){
        this.send(Parse("server", "updateCards", this.cards));
    }

    updateForcedType(type : string){
        this.send(Parse("server", "updateForcedType", type));
    }

    send(message : string){
        this.connection.send(message); 
    }
    // ---

    // Checks
    isReady(){
        return this.readyState;
    }

    hasSelected(){
        return this.selectedCard !== {} as Card;
    }
    // ---
}