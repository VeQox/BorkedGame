type messageType = {
    name : string;
    head : string;
    body : any;
}

export default class Message{
    /**
     * Parse data to an Message JSON object
     * @param name 
     * @param head 
     * @param body 
     * @returns 
     */
    public static parse(name : string, head : string, body : any) {
        return {
            "name": name,
            "head": head,
            "body": body
        }as messageType
    }

    /**
     * parse data directly into string format ready to send
     * @param name 
     * @param head 
     * @param body 
     * @returns 
     */
    public static parseS(name : string, head : string, body : any){
        return Message.stringify(Message.parse(name, head, body));
    }

    /**
     * Convert Message JSON object to string
     * @param message 
     */
    public static stringify(message : messageType){
        return JSON.stringify(message);
    }
}