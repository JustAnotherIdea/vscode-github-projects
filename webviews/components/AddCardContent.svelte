<script>
  import { getContext } from 'svelte';
  import AddCard from './AddCard.svelte';
  export let column, handlers;
  const { open } = getContext('simple-modal');
  let note = "";
  let error = null;

  const add_card = () => {
    open(AddCard, { handlers: handlers, message: column }, {closeButton: ""});
  };
</script>

<p>
  <button 
    on:click={add_card} 
    class="w-full mt-1.5 px-2 py-1 bg-vscode-button text-vscode-button-foreground rounded hover:bg-vscode-button-hoverBackground"
  >
    Add Card
  </button>
</p>