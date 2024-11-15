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

<div style="margin-top: 0.4rem">
  {#if error}
    <div class="error" style="color: red; margin-bottom: 10px;">
      {error}
    </div>
  {/if}

  <input 
    bind:value={note} 
    placeholder="Enter new title" 
    style="width: 100%; margin-bottom: 10px; padding: 5px;"
  />
  
  <div style="display: flex; flex-direction: row; width: 100%;">
    <button 
      on:click={editCard} 
      style="width:50%; margin-right: 5px;"
      disabled={!note.trim()}
    >
      Save
    </button>
    <button 
      on:click={handleCancel} 
      style="width:50%"
    >
      Cancel
    </button>
  </div>
</div>
