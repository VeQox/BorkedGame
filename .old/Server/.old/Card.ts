export default class Card {
    type : string;
    value : string;

    private static types : string[] = ["♣","♠","♦","♥"];
    private static values : string[] = ["2","3","4","5","6","7","8","9","10","B","Q","K","A"];

    constructor(type: string, value: string) {
        this.type = type;
        this.value = value;
    }

    getValue(){
        const typeVal : number = Card.types.indexOf(this.type);
        const valueVal : number = Card.values.indexOf(this.value);

        return 100*typeVal+valueVal;
    }
}
