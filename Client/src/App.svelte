<script>
        import Modal from "./Modal.svelte";
        import {Moon} from "svelte-loading-spinners"

		// WS info
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

        for (let i = 0; i < 10; i++) {
            Cards.push({
                "type":"♥",
                "value":"A"
            });
        }

        let ReadyCount = "0 / 0";

        let showModal = true;

        let UsableCards = [];

        function Connect(){

        }
        function Select(){

        }
        function SetCalls(){

        }
        function SetReady(){

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
                <div id={i} class="col text-center m-2 border border-4" on:click={() => Select(i)}>
                    {Card.type} 
                    {Card.value}
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

</style>