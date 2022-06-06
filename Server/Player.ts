import Card from "./Card";
import Cards from "./Cards"
import WebSocket from "ws";
import Message from "./Message"

export default class Player{
    public name : string;
    public cards : Cards;
    public points : number;
    public actualHits : number;
    public calledHits : number;
    public connection : WebSocket;
    public selectedCard : Card;
    public readyState : boolean;

    constructor(name : string, connection : WebSocket) {
        this.name = name;
        this.connection = connection;
        this.points = 0;
        this.actualHits = 0;
        this.calledHits = 0;
        this.cards = new Cards();
        this.selectedCard = {} as Card;
        this.readyState = false;
    }

    /**
     * removes the selected Card
     */
    removeSelectedCard(){
        this.cards.remove(this.selectedCard);
        this.selectedCard = {} as Card;
    }

    /**
     * calculate new point score depening on the called hits and actual hits
     */
    calcPoints(){
        if(this.calledHits == this.actualHits){
            this.points += this.calledHits + 1;
        }
            
        if(this.calledHits > this.actualHits){
            this.points += this.actualHits - this.calledHits;
        }

        if(this.calledHits < this.actualHits){
            this.points += this.calledHits - this.actualHits;
        }

        this.actualHits = 0;
        this.calledHits = 0;
    }

    /**
     * Checks if the player is ready
     * @returns 
     */
    isReady(){
        return this.readyState;
    }

    /**
     * Checks if the player has selected a card for the next trick
     * @returns 
     */
    hasSelected(){
        return this.selectedCard !== {} as Card;
    }

    /**
     * Send data to the player formatted as a JSON object
     * @param message 
     */
    send(message : string){
        this.connection.send(message);
    }

    /**
     * Update Cards on the client side
     */
    updateCards(){
        this.send(Message.parseS("server", "updateCards", this.cards));
    }

    disableSelect(){
        this.send(Message.parseS("server", "disableSelect", ""))
    }
}