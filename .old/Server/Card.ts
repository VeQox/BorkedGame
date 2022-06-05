/**
 * ♥ A
 */
export default class Card{
    protected type : number;
    protected value : number;

    static types : string[] = ["♣","♠","♦","♥"];
    static values : string[] = ["2","3","4","5","6","7","8","9","10","B","Q","K","A"];

    public constructor(type : number, value : number){
        this.type = type;
        this.value = value;
    }

    public static Card(type : string, value : string) {
        return new Card(this.types.indexOf(type), this.values.indexOf(value));
    }

    public get Type(){
        return Card.types[this.type];
    }

    public get Value(){
        return Card.values[this.value];
    }

    /**
     * Converts Card to a string
     * @returns formatted string
     */
    public ToString(){
        return `${this.Type} ${this.Value}`;
    }

    /**
     * Compares the two cards 
     * @param other
     */
    public CompareTo(other : Card){
        if(this.type == other.type)
            return this.value > other.value ? 1 : -1;

        if(this.type > other.type)
            return 1;

        if(this.type < other.type)
            return -1;

        return 0;
    }
}