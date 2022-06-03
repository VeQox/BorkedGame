<script>
        import {Moon} from 'svelte-loading-spinners';
        import Modal from './Modal.svelte'

        const protocol = "ws";
        const url = "localhost";
        const port = 8000;

        let ws;
        let Name;
        let connected = false;

        let ConnectButton;
        let NameInput;
		let Points; 
        let CallsInput
        let ConfirmButton;
        let Cards = [];

        let ReadyCount = "0 / 0";

        let showModal = false;

        let UsableCards = [];

        function Connect(){
			ws = new WebSocket(`${protocol}://${url}:${port}/${Name}`);
			ws.onopen = () => {
				connected = true;
				NameInput.setAttribute("disabled", "");
				ConnectButton.setAttribute("disabled", "");
                showModal = true;
            }
			ws.onmessage = (message) => {

				const messageJson = JSON.parse(message.data);

				console.log(`[Server ${port}] ${message.data}`);

				switch(messageJson.head){
                    case "start": 
                        showModal = false;
                        break;
                    case "newRound":
                        CallsInput.removeAttribute("disabled");
                        ConfirmButton.removeAttribute("disabled");
					case "update":
						Display(messageJson.data);
						break;
                    case "updateReady":
                        ReadyCount = messageJson.data;
                        break;
					case "points":
						Points = messageJson.data;
                        break;
                    case "firstCard":
                        UsableCards = getCardsPerType();
                        if(UsableCards.length == 0){
                            UsableCards.card;
                        }
                        let UnusableCards = Cards.filter(x => !UsableCards.includes(x));
                        UsableCards.forEach(Card => {
                            let div = document.getElementById(Cards.indexOf(Card));
                            div.setAttribute("readonly", "");
                        });
                        break;
				}
			}
        }

        function getCardsPerType(card){
            let usableCards = [];
            Cards.forEach(Card => {
                if(Card.type === card.type){
                    usableCards.push(Card);
                }
            });
            return usableCards;
        }

        function Select(id){
            console.log(id)
            ws.send(JSON.stringify(Parse(Name, "select", `${id}`))) 
        }


        const Display = (CardArray) => {
            Cards = CardArray;
        }

        const SetCalls = () => {    
            if(!connected) return;

            CallsInput.setAttribute("disabled", "");
            ConfirmButton.setAttribute("disabled", "");
            const calls = CallsInput.value;

            ws.send(JSON.stringify(Parse(Name, "setCalls", calls)));
            newRound = false;
        }

        const SetReady = () => {
            ws.send(JSON.stringify(Parse(Name, "setReady", "")))
        }

        const Parse = (Name, head, data) => {
            return data = {
                "name": Name,
                "head": head,
                "data": data
            }
        }
</script>

<main>
	<nav class="navbar navbar-light bg-light">
        <div class="container-fluid">
            <a href="https://github.com/VeQox/OnlineCardGame" class="navbar-brand">CardGame</a>
            <form class="d-flex">
                <input class="form-control me-2" bind:value={Points} disabled placeholder="Points" id="points">
                <input bind:this={NameInput} class="form-control me-2" bind:value={Name}  placeholder="Name" id="Name">
                <button bind:this={ConnectButton} class="btn btn-outline-success mx-2" type="button" id="connect" on:click={Connect}>Connect</button>
            </form>
        </div>
    </nav>

    <div class="container">
        <div class="row">
            {#each Cards as Card, i}
                <div id={i} class="col text-center" on:click={() => Select(i)}>
                    {Card.type} {Card.value}
                </div>
            {/each}
        </div>
    </div>
    
    <form class="d-flex">
        <input bind:this={CallsInput} class="form-control mr-2 my-2 text-center" placeholder="Calls" id="calls" aria-label="Search">
        <button bind:this={ConfirmButton} class="btn btn-outline-success my-2 ms-2" type="button" on:click={SetCalls}>Confirm</button>
    </form>

    <Modal title="Waiting for Players" open={showModal} onClosed={SetReady}>
        <div class="d-flex justify-content-center p-2 ">
            <div style="width: 10ch;">
                <Moon color="#7b93a7" unit="ch" size=10 duration=1.5s></Moon>
            </div>
        </div>
        <div class="text-center">
            <p>
                {ReadyCount}
            </p>
        </div>
    </Modal>
</main>

<style>
    main {
        width: auto;
        height: auto;
    }

    .col {
        cursor: pointer;
    }
</style>