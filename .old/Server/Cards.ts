import Card from "./Card"

export default class Cards{
    private cards : Card[];

    constructor(){
        this.cards = [];
    }

    public add(card : Card){
        this.cards.push(card);
    }

    public remove(card : Card){
        this.cards.slice(this.cards.indexOf(card));
    }

    /**
     * returns an Array of cards filtered by their types
     * @param type 
     */
    public getPerType(type : string){
        let filteredCards : Card[];
        this.cards.forEach(card => {
            if(card.Type == type){
                filteredCards.push(card);
            }
        });
        return filteredCards;
    }

    public getUsableCards(card : Card){
        let usableCards = this.getPerType(card.Type);
        return usableCards.length == 0 ? this.cards : usableCards;
    }
}