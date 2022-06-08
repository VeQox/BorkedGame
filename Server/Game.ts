import Player from "./Player";
import Players from "./Players";
import Card from "./Card";
import Cards from "./Cards";
import Message from "./Message";

export default class Game{
    public players : Players = {} as Players;
    public usedCards : Card[] = [];
    public selectedCards : Card[] = [];

    public started : boolean = false;

    private startingPlayer : number = 0;
    private currentPlayer : number = this.startingPlayer;
    private cardsPerRound : number = 1;
    private currentCards : number = this.cardsPerRound;

    private reverse : boolean = false;

    public static stack : Card[] = Game.initStack();
    private static initStack(){
        let tmp : Card[] = [];
        Card.types.forEach(type => {
            Card.values.forEach(value => {
                let card: Card = new Card(Card.types.indexOf(type), Card.types.indexOf(value));
                tmp.push(card);
            });
        });
        return tmp;
    }

    /**
     * sends a message to every player
     * @param message 
     */
    emit(message : string){
        this.players.emit(message);
    }

    public updateReady(){
        this.emit(Message.parseS("server", "updateReady", `${this.players.readyCount()} / ${this.count()}`))
    }

    /**
     * retuns the amount of players
     * @returns 
     */
    public count(){
        return this.players.count();
    }

    /**
     * adds a player to the array
     */
    public add(player : Player){
        this.players.add(player);
    }

    /**
     * removes a player from the array
     * @param player 
     */
    public remove(player : Player){
        this.players.remove(player);
    }

    /**
     * returns a player at the given index
     * @param index 
     * @returns 
     */
    public getAt(index : number){
        return this.players.getAt(index);
    }

    /**
     * returns the index of the player 
     * @param player 
     * @returns 
     */
    public indexOf(player : Player){
        return this.players.indexOf(player);
    }

    /**
     * 
     * @param amount 
     */
    public getNewHands(amount : number){
        this.usedCards = [];
        this.players.players.forEach(player => {
            player.cards = this.withdrawCards(amount);
        });
    }

    /**
     * create a new deck of cards for every player
     * @param amount 
     * @returns 
     */
    private withdrawCards(amount : number){
        let cards : Cards = {} as Cards;
        for (let i = 0; i < amount; i++) {
            const card : Card = this.withdrawCard();
            cards.add(card);
            this.usedCards.push(card);
        }
        return cards;
    }

    /**
     * returns a new unused Card
     * @returns 
     */  
    private withdrawCard(){
        let card : Card;
        do {
            card = Game.stack[Math.floor(Math.random()*Game.stack.length)];
        } while (this.usedCards.indexOf(card) !== -1);
        return card;
    }

    /**
     * get winner and increment hits
     * set currentPlayer as the winner
     */
    public endTrick(){
        let winner : Player = this.players.getWinnerOfTrick();
        winner.actualHits++;
        this.selectedCards = [];
        this.currentCards--;

        this.players.removeSelectedCards();
        this.players.updateCards();

        this.currentPlayer = this.players.indexOf(winner);
    }

    /**
     * select card a card
     * @param player 
     * @param selected 
     * @returns 
     */
    public selectCard(player : Player, selected : number){
        if(player.hasSelected()) return false;
        if(player != this.players.getAt(this.currentPlayer)) return false;

        const selectedCard : Card = player.cards.getAt(selected);

        player.selectedCard = selectedCard;
        this.selectedCards.push(selectedCard);
        return true;
    }

    /**
     * calculate points after every round,
     * update starting player
     * and update cards per round
     */
    public endRound(){
        this.players.calcPoints();
        this.updateStartingPlayer();
        this.updateCardsPerRound();
    }

    /**
     * increment startingPlayer by one if it didnt reach the players.count() if it did set it as 0
     */
    private updateStartingPlayer(){
        if(this.startingPlayer == this.players.count()){
            this.startingPlayer = 0;
        }
        else{
            this.startingPlayer++;
        }
        this.currentPlayer = this.startingPlayer;
    }

    /**
     * increments or decrements cardsPerRound depending on this.reverse
     */
    private updateCardsPerRound(){
        if(this.cardsPerRound == 10){
            this.reverse = true;
        }
        if(this.reverse){
            this.cardsPerRound--;
        }
        else{
            this.cardsPerRound++;
        }
    }
    
    /**
     * set player as ready if
     * @param player 
     * @returns 
     */
    public setReady(player : Player){
        if(player.isReady()) return;
        player.readyState = true;
    }

    public start(){
        this.startingPlayer = 0;
        this.currentPlayer = this.startingPlayer;

        this.started = true;

        this.getNewHands(this.cardsPerRound);
        this.emit(Message.parseS("server", "start", ""));
        this.players.getAt(this.startingPlayer).send(Message.parseS("server", "currentPlayer", ""));
    }

    public updateCards(){
        this.players.updateCards();
    }

    public forceType(){
        this.emit(Message.parseS("server", "forcedType", this.players.getAt(this.startingPlayer).selectedCard.Type));
    }

    public isStartingPlayer(player : Player){
        if(player == this.players.getAt(this.startingPlayer)){
            return true;
        }
        return false;
    }

    public isRoundOver(){
        if(this.currentCards == 0){
            return true;
        }
        return false;
    }
}