export default function Parse(name : string, head : string, body : any) {
    return JSON.stringify({
        "name": name,
        "head": head,
        "body": body
    });
}