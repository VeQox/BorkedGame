import Player from "./Player";
import Parse from "./Parse";

export default class Players{
    players : Player[] = [];

    updateCards(){
        this.players.forEach(player => {
            player.updateCards();
        });
    }

    updateForcedType(){
        this.emit()
    }

    emit(message : string){
        this.players.forEach(player => {
            player.send(message);
        });
    }

    count(){
        return this.players.length;
    }

    add(player : Player){
        this.players.push(player);
    }

    remove(player : Player){
        this.players.splice(this.players.indexOf(player), 1);
    }

    getAt(index : number){
        return this.players[index];
    }

    haveSelected(){
        this.players.forEach(player => {
            if(!player.hasSelected()) return false;
        });
        return true;
    }

    areReady(){
        this.players.forEach(player => {
            if(!player.isReady()) return false;
        });
        return true;
    }

    readyCount(){
        let count = 0;
        this.players.forEach(player => {
            if(player.isReady()) count++;
        });
        return count;
    }
}