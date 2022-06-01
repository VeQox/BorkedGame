<script>
        const protocol = "ws";
        const url = "localhost";
        const port = 8000;

        let ws;
        let name;
        let connected = false;

		let Points; 
        let CallsInput
        let ConfirmButton;
        let Cards = [];

        function Connect(){
			ws = new WebSocket(`${protocol}://${url}:${port}/${name}`);
			ws.onopen = () => {
				connected = true;
				document.getElementById("name").setAttribute("disabled", "");
				document.getElementById("connect").setAttribute("disabled", "");
			}
			ws.onmessage = (message) => {

				const messageJson = JSON.parse(message.data);

				console.log(`[Server ${port}] ${message.data}`);

				switch(messageJson.head){
                    case "newRound":
                        CallsInput.removeAttribute("disabled");
                        ConfirmButton.removeAttribute("disabled");
					case "update":
						Display(messageJson.data);
						break;
					case "update":
						Points = messageJson.data;
				}
			}
        }

        function Select(id){
            console.log(id)
            ws.send(JSON.stringify(Parse(name, "select", `${id}`))) 
        }


        const Display = (CardArray) => {
            Cards = CardArray;
        }

        const SetCalls = () => {    
            if(!connected) return;

            CallsInput.setAttribute("disabled", "");
            const calls = CallsInput.value;
            ConfirmButton.setAttribute("disabled", "");

            ws.send(JSON.stringify(Parse(name, "setCalls", calls)));
            newRound = false;
        }

        const Parse = (name, head, data) => {
            return data = {
                "name": name,
                "head": head,
                "data": data
            }
        }
</script>

<main>
	<nav class="navbar navbar-light bg-light">
        <div class="container-fluid">
            <a href="/" class="navbar-brand">CardGame</a>
            <form class="d-flex">
                <input class="form-control me-2" bind:value={Points} disabled placeholder="Points" id="points">
                <input class="form-control me-2" bind:value={name}  placeholder="Name" id="name">
                <button class="btn btn-outline-success mx-2" type="button" id="connect" on:click={Connect}>Connect</button>
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