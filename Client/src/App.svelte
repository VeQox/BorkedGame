<script>
const protocol = "ws";
        const url = "localhost";
        const port = 8000;

        let ws;
        let name;
		let points;
        let connected = false;
        let cardCount = 1;
        let newRound = true;

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
					case "display":
						Display(messageJson.data);
						break;
					case "update":
						setCalls = false;
						let points = document.getElementById("points");
						points.value = messageJson.data;
				}
			}
        }

        const Display = (CardArray) => {

            let responseElement = document.getElementById("response");
            responseElement.innerHTML = "";

            let container = document.createElement("div");
            container.classList.add("container");
            
            let row = document.createElement("div");
            row.classList.add("row");

            let count = 0;
            CardArray.forEach(Card => {
                let column = document.createElement("div");
                column.classList.add("col");
                column.id = count;

                column.addEventListener("click", (event) => {
                    ws.send(JSON.stringify(Parse(name, "select", `${event.path[0].id}`))) 
                });

                column.innerHTML = `${Card.type} ${Card.value}`;
                row.appendChild(column);
                count++;
            });

            container.appendChild(row);
            responseElement.appendChild(container);
        }

        const SetCalls = () => {
            if(!newRound || !connected) return;
            const calls = document.getElementById("calls").value;
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
                <input class="form-control me-2" bind:value={points} disabled placeholder="Points" id="points">
                <input class="form-control me-2" bind:value={name}  placeholder="Name" id="name">
                <button class="btn btn-outline-success mx-2" type="button" id="connect" on:click={Connect}>Connect</button>
            </form>
        </div>
    </nav>

    <div id="response">
    </div>
    
    <form class="d-flex">
        <input class="form-control mr-2 my-2 text-center" placeholder="Calls" id="calls" aria-label="Search">
        <button class="btn btn-outline-success my-2 ms-2" type="button" on:click={SetCalls}>Confirm</button>
    </form>
</main>