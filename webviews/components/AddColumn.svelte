<script>
  import { getContext } from 'svelte';

  const { close } = getContext('simple-modal');
  let text = "" //column name
  export let handlers, project;

  const closeAdd = () => {
    handlers.columnMutations(null, "addColumn", { name: text, projId: project.id });
    close();
  };
</script>

<div class="p-4">
  <input 
    bind:value={text} 
    placeholder="Add column Name" 
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
      on:click={closeAdd} 
      class="w-1/2 px-2 py-1 bg-vscode-button text-vscode-button-foreground rounded hover:bg-vscode-button-hoverBackground"
    >
      Cancel
    </button>
  </div>
</div>