import Client from "./Client";
import Card from "./Card";
import Parse from "./Parse";

export default class Clients{
    clients : Client[];
    
    private stack : Card[] = Clients.initStack();
    private usedCards : Card[] = [];
    private static types : string[] = ["♣","♠","♦","♥"];
    private static values : string[] = ["2","3","4","5","6","7","8","9","10","B","Q","K","A"];

    constructor(){
        this.clients = [];
    }
    
    send(msg : string){
        this.clients.forEach(client => {
            client.send(msg);
        });
    }

    count(){
        return this.clients.length;
    }

    add(client : Client){
        this.clients.push(client);
    }

    remove(client : Client){
        this.clients.splice(this.clients.indexOf(client), 1);
    }

    haveSelected(){
        this.clients.forEach(client => {
            if(!client.hasSelected()) return false;
        });
        return true;
    }

    calcPoints(){
        this.clients.forEach(client => {
            client.calcPoints();

            // Debug
            console.log(`[Client ${client.name}] has ${client.points}`);
        });
    }

    areReady(){
        this.clients.forEach(client => {
            if(!client.isReady()) return false;
        });
        return true;
    }

    readyCount(){
        let count = 0;
        this.clients.forEach(client => {
            if(client.isReady()) count++;
        });
        return count;
    }

    updateFirstSelectedCard(currentClient : Client){
        this.clients.forEach(client => {
            if(client !== currentClient){
                client.send(Parse("server", "forcedType", currentClient.selectedCard.type));
            }
        });
    }

    updateCards(){
        this.clients.forEach(client => {
            client.send(Parse("server", "updateCards", client.cards));
        });
    }

    getNewHands(amount : number){
        this.clients.forEach(client => {
            client.cards = this.getNewHand(amount);
        });
    }

    private getNewHand(amount : number){
        let cards : Card[] = [];
        for (let i = 0; i < amount; i++) {
            const card : Card = this.getNewCard();
            cards.push(card);
            this.usedCards.push(card);
        }
        return cards;
    }

    private getNewCard(){
        let card : Card;
        do {
            card = this.stack[Math.floor(Math.random()*this.stack.length)];
        } while (this.usedCards.indexOf(card) !== -1);
        return card;
    }

    static initStack(){
        let tmp : Card[] = [];
        this.types.forEach(Type => {
            this.values.forEach(Value => {
                let card: Card = new Card(Type, Value);
                tmp.push(card);
            });
        });
        console.log(tmp)
        return tmp;
    }
}