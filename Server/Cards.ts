import Card from "./Card";

export default class Cards{
    private cards : Card[] = [];

    /**
     * Adds an element from the cards array
     * @param card 
     */
    public add(card : Card){
        this.cards.push(card);
    }

    /**
     * Removes an element from the cards array
     * @param card 
     */
    public remove(card : Card){
        this.cards.splice(this.cards.indexOf(card));
    }

    /**
     * @returns internal cards array
     */
    public getCards(){
        return this.cards;
    }

    /**
     * returns the card on the given index
     * @param index 
     * @returns 
     */
    public getAt(index : number){
        return this.cards[index];
    }

    /**
     * returns an Array of cards filtered by their types
     * @param type 
     */
    
    private getPerType(type : string){
        let filteredCards : Card[] = [];
        this.cards.forEach(card => {
            if(card.Type == type){
                filteredCards.push(card);
            }
        });
        return filteredCards;
    }

    /**
     * Get the usable cards of a round due to the forced card type
     * @param card 
     * @returns 
     */
    public getUsableCards(card : Card){
        let usableCards = this.getPerType(card.Type);
        return usableCards.length == 0 ? this.cards : usableCards;
    } 
}