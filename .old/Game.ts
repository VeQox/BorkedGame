import Card from "./Card";
import Cards from "./Cards";
import Player from "./Player";
import Players from "./Players";

export default class Game {
    public players : Players = {} as Players;
    public usedCards : Card[] = [];

    public static stack : Card[] = Game.initStack();
    private static initStack(){
        let tmp : Card[] = [];
        Card.types.forEach(Type => {
            Card.values.forEach(Value => {
                let card: Card = Card.Card(Type, Value);
                tmp.push(card);
            });
        });
        console.log(tmp)
        return tmp;
    }

    updateCards(){
        
    }

    emit(message : string){
        this.players.emit(message);
    }

    public getNewHands(amount : number){
        this.usedCards = [];
        this.players.players.forEach(player => {
            player.cards = this.withdrawCards(amount);
        });
    }

    private withdrawCards(amount : number){
        let cards : Cards;
        for (let i = 0; i < amount; i++) {
            const card : Card = this.withdrawCard();
            cards.add(card);
            this.usedCards.push(card);
        }
        return cards;
    }

    private withdrawCard(){
        let card : Card;
        do {
            card = Game.stack[Math.floor(Math.random()*Game.stack.length)];
        } while (this.usedCards.indexOf(card) !== -1);
        return card;
    }

}