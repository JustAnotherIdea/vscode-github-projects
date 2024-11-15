<script>
  import { getContext, onMount } from 'svelte';
  export let message, handlers;
  const { close } = getContext('simple-modal');
  let body = "";
  let error = null;
  let mounted = false;

  onMount(() => {
    console.log("ConvertIssue component mounted");
    console.log("Initial message:", message);
    console.log("Initial handlers:", handlers);
    mounted = true;
  });

  const convertIssue = async () => {
    try {
      if (!message?.note) {
        error = "Title is required";
        return;
      }

      if (!message.column_info?.project?.id) {
        error = "Project ID is missing";
        return;
      }

      const result = await handlers.cardMutations(message.card_info, "convertToIssue", {
        body: body,
        title: message.note,
        projectId: message.column_info.project.id
      });

      console.log("Conversion result:", result);
      close();
    } catch (e) {
      console.error('Conversion error details:', e);
      error = e.message || "Failed to convert to issue";
    }
  };
</script>

<style>
  .modal-container {
    padding: 1rem;
    background: var(--vscode-editor-background);
    color: var(--vscode-editor-foreground);
    border-radius: 4px;
  }
  
  .modal-title {
    font-size: 1.2em;
    margin-bottom: 1rem;
  }
  
  .modal-body {
    margin-bottom: 1rem;
  }
  
  .modal-textarea {
    width: 100%;
    min-height: 100px;
    margin-bottom: 1rem;
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border);
    padding: 0.5rem;
  }
  
  .modal-error {
    color: var(--vscode-errorForeground);
    margin-bottom: 1rem;
  }
  
  .modal-buttons {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }
  
  .modal-button {
    padding: 0.5rem 1rem;
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    border-radius: 2px;
    cursor: pointer;
  }
  
  .modal-button:hover {
    background: var(--vscode-button-hoverBackground);
  }
</style>

<div class="modal-container">
  <div class="modal-title">Convert to Issue</div>
  <div class="modal-body">
    <p>Title: {message?.note}</p>
    <textarea
      class="modal-textarea"
      bind:value={body}
      placeholder="Enter issue description (optional)"
    ></textarea>
    {#if error}
      <div class="modal-error">{error}</div>
    {/if}
  </div>
  <div class="modal-buttons">
    <button class="modal-button" on:click={convertIssue}>Convert</button>
    <button class="modal-button" on:click={close}>Cancel</button>
  </div>
</div>