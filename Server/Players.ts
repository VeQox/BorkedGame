import Player from "./Player";

export default class Players{
    public players : Player[] = [];

    /**
     * sends a message to every player
     */
    public emit(message : string){
        this.players.forEach(player => {
            player.send(message);
        });
    }

    /**
     * retuns the amount of players
     * @returns 
     */
    public count(){
        return this.players.length;
    }

    /**
     * adds a player to the array
     */
    public add(player : Player){
        this.players.push(player);
    }

    /**
     * removes a player from the array
     * @param player 
     */
    public remove(player : Player){
        this.players.splice(this.players.indexOf(player), 1);
    }

    /**
     * returns a player at the given index
     * @param index 
     * @returns 
     */
    public getAt(index : number){
        return this.players[index];
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
     * checks if every player has selected a Card
     * @returns 
     */
    public haveSelected(){
        this.players.forEach(player => {
            if(!player.hasSelected()) return false;
        });
        return true;
    }

    /**
     * checks if every player is ready
     * @returns 
     */
    public areReady(){
        this.players.forEach(player => {
            if(!player.isReady()) return false;
        });
        return true;
    }

    /**
     * returns the amount of ready players
     * @returns 
     */
    public readyCount(){
        let count = 0;
        this.players.forEach(player => {
            if(player.isReady()) count++;
        });
        return count;
    }

    /**
     * calculate Points after every round
     */
    public calcPoints(){
        this.players.forEach(player => {
            player.calcPoints();
        });
    }

    /**
     * returns the winner of a trick (highes value card)
     * @returns 
     */
    public getWinnerOfTrick(){
        let winner : Player = this.players[0];

        this.players.forEach(player => {
            const compareValue = player.selectedCard.CompareTo(winner.selectedCard);
            if(compareValue == 1){
                winner = player;
            }
        });

        return winner;
    }

    /**
     * remove selected card from the internal array and set it to an empty object
     */
    public removeSelectedCards(){
        this.players.forEach(player => {
            player.removeSelectedCard();
        });
    }

    /**
     * update cards for display
     */
    public updateCards(){
        this.players.forEach(player => {
            player.updateCards();
        });
    }
}