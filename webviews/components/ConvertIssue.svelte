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
      console.log("Converting issue:", message);
      if (!message?.note) {
        error = "Title is required";
        return;
      }

      if (!message?.project?.id) {
        error = "Project ID is missing";
        return;
      }

      await handlers.cardMutations(message.card_info, "convertToIssue", {
        title: message.note,
        body: body,
        projectId: message.project.id
      });

      close();
    } catch (e) {
      console.log("Conversion error details:", e);
      error = e.message;
    }
  };
</script>

<div class="p-4 bg-vscode-background text-vscode-foreground rounded">
  <div class="text-xl mb-4">Convert to Issue</div>
  <div class="mb-4">
    <p class="mb-2">Title: {message?.note}</p>
    {#if error}
      <p class="text-vscode-error mb-4">{error}</p>
    {/if}
    <textarea
      bind:value={body}
      placeholder="Enter issue description"
      class="w-full min-h-[100px] mb-4 p-2 bg-vscode-input-background text-vscode-input-foreground border border-vscode-input-border rounded"
    />
    <div class="flex justify-end gap-2">
      <button 
        on:click={convertIssue}
        class="px-4 py-2 bg-vscode-button text-vscode-button-foreground rounded hover:bg-vscode-button-hoverBackground"
      >
        Convert
      </button>
      <button 
        on:click={close}
        class="px-4 py-2 bg-vscode-button text-vscode-button-foreground rounded hover:bg-vscode-button-hoverBackground"
      >
        Cancel
      </button>
    </div>
  </div>
</div>