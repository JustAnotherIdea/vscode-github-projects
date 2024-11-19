<script>
  import { getContext } from 'svelte';
  export let message, handlers;
  const { close } = getContext('simple-modal');
  let note = message.note;
  let error = null;

  const editCard = async () => {
    try {
      if (!note.trim()) {
        error = "Title cannot be empty";
        return;
      }

      // Update the title field value
      await handlers.cardMutations(message.card_info, "editTitle", {
        title: note
      });
      
      // Force close the modal
      if (close) {
        close();
      }
    } catch (e) {
      error = e.message;
    }
  };

  const handleCancel = () => {
    if (close) {
      close();
    }
  };
</script>

<div class="mt-1.5">
  {#if error}
    <div class="text-vscode-error mb-2.5">
      {error}
    </div>
  {/if}

  <input 
    bind:value={note} 
    placeholder="Enter new title" 
    class="w-full mb-2.5 p-1.5 bg-vscode-input-background text-vscode-input-foreground border border-vscode-input-border rounded"
  />
  
  <div class="flex flex-row w-full">
    <button 
      on:click={editCard} 
      class="w-1/2 mr-1.5 px-2 py-1 bg-vscode-button text-vscode-button-foreground rounded hover:bg-vscode-button-hoverBackground disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={!note.trim()}
    >
      Save
    </button>
    <button 
      on:click={handleCancel} 
      class="w-1/2 px-2 py-1 bg-vscode-button text-vscode-button-foreground rounded hover:bg-vscode-button-hoverBackground"
    >
      Cancel
    </button>
  </div>
</div>
