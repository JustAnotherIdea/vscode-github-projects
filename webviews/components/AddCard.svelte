<script>
  import { getContext } from 'svelte';
  export let message, handlers;
  const { close } = getContext('simple-modal');
  let text = ""

  const closeAdd = () => {
    handlers.cardMutations(null, "addCard", { note: text, colId: message.id });
    close();
  };

  const closePop = () => {
    close();
  };

</script>

<div class="p-4">
  <input 
    bind:value={text} 
    placeholder="Add a note" 
    class="w-full mb-2.5 p-1.5 bg-vscode-input-background text-vscode-input-foreground border border-vscode-input-border rounded"
  />
  <div class="flex flex-row w-full">
    <button 
      on:click={closeAdd} 
      class="w-1/2 mr-1.5 px-2 py-1 bg-vscode-button text-vscode-button-foreground rounded hover:bg-vscode-button-hoverBackground"
    >
      Confirm
    </button>
    <button 
      on:click={closePop} 
      class="w-1/2 px-2 py-1 bg-vscode-button text-vscode-button-foreground rounded hover:bg-vscode-button-hoverBackground"
    >
      Cancel
    </button>
  </div>
</div>