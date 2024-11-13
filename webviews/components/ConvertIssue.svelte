<script>
  import { getContext } from 'svelte';
  export let message, handlers;
  const { close } = getContext('simple-modal');
  let body = "";
  let error = null;

  const convertIssue = async () => {
    try {
      // For Projects V2, we need to:
      // 1. Create a new issue
      // 2. Add it to the project
      // 3. Delete the draft item
      await handlers.cardMutations(message.card_info, "convertToIssue", {
        body: body,
        title: message.note,
        projectId: message.column_info.project.id
      });
      close();
    } catch (e) {
      error = e.message;
    }
  };

  const handleCancel = () => {
    close();
  };
</script>

<div>
  {#if error}
    <div class="error" style="color: red; margin-bottom: 10px;">
      {error}
    </div>
  {/if}
  
  <input 
    bind:value={body} 
    placeholder="Add a body for issue" 
    style="width: 100%; margin-bottom: 10px; padding: 5px;"
  />
  
  <div style="display: flex; flex-direction: row; width: 100%;">
    <button 
      on:click={convertIssue} 
      style="width:50%; margin-right: 5px;"
      disabled={!message.note}
    >
      Confirm
    </button>
    <button 
      on:click={handleCancel} 
      style="width:50%"
    >
      Cancel
    </button>
  </div>
</div>