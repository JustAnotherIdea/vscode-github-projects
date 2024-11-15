<script>
  import { getContext, createEventDispatcher } from "svelte";
  import IssueCard from "./IssueCard.svelte";
  import ConvertIssue from "./ConvertIssue.svelte";
  import Modal from "svelte-simple-modal";
  
  const { open } = getContext("simple-modal");
  const dispatch = createEventDispatcher();
  
  export let card_info, column_info, handlers;
  
  // Get the title/content from the card's field values
  let title = card_info.content?.title || card_info.fieldValues?.nodes?.find(
    fv => fv?.__typename === "ProjectV2ItemFieldTextValue"
  )?.text || 'Untitled';

  // Get any linked content (issue/PR)
  let content = card_info.content;
  
  // Edit mode state
  let isEditing = false;
  let editedTitle = title;
  let error = null;

  async function handleSave() {
    try {
      if (!editedTitle.trim()) {
        error = "Title cannot be empty";
        return;
      }

      await handlers.cardMutations(card_info, "editTitle", {
        title: editedTitle
      });
      
      error = null;
      isEditing = false;
      title = editedTitle;
    } catch (e) {
      error = e.message;
    }
  }

  function handleCancel() {
    isEditing = false;
    editedTitle = title;
    error = null;
  }

  const deleteCard = () => {
    handlers.cardMutations(card_info, "deleteCard");
  };

  const archiveCard = () => {
    const archivedStatus = column_info.statusField.options.find(opt => 
      opt.name.toLowerCase().includes("archived")
    );

    if (archivedStatus) {
      handlers.cardMutations(card_info, "editCard", { 
        columnId: archivedStatus.id
      });
    }
  };

  const convertToIssue = () => {
    console.log("Converting to issue with title:", title);
    console.log("Card info:", card_info);
    console.log("Column info:", column_info);
    
    open(ConvertIssue, 
      {
        message: { 
          card_info, 
          column_info, 
          note: title 
        },
        handlers
      }
    );
  };
</script>

<div class="mt-4">
  {#if title || content}
    <div class="border border-vscode-foreground rounded p-4 mt-4">
      {#if title}
        <div>
          {#if isEditing}
            {#if error}
              <div class="text-vscode-error mb-2.5">
                {error}
              </div>
            {/if}
            <input 
              bind:value={editedTitle} 
              placeholder="Enter title" 
              class="w-full mb-2.5 p-1.5 bg-vscode-background text-vscode-foreground border border-vscode-foreground rounded"
            />
            <div class="flex flex-row mt-1.5 gap-1.5">
              <button 
                on:click={handleSave} 
                class="bg-vscode-button text-vscode-button-foreground px-2 py-1 rounded disabled:opacity-50"
                disabled={!editedTitle.trim()}
              >
                Save
              </button>
              <button 
                on:click={deleteCard} 
                class="bg-vscode-button text-vscode-button-foreground px-2 py-1 rounded"
              >
                Delete
              </button>
              <button 
                on:click={archiveCard} 
                class="bg-vscode-button text-vscode-button-foreground px-2 py-1 rounded"
              >
                Archive
              </button>
              <button 
                on:click={convertToIssue} 
                class="bg-vscode-button text-vscode-button-foreground px-2 py-1 rounded"
              >
                Convert to Issue
              </button>
              <button 
                on:click={handleCancel} 
                class="bg-vscode-button text-vscode-button-foreground px-2 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          {:else}
            <p>{title}</p>
            <div class="flex flex-row mt-1.5">
              <button 
                on:click={() => isEditing = true} 
                class="bg-vscode-button text-vscode-button-foreground px-2 py-1 rounded"
              >
                Edit
              </button>
            </div>
          {/if}
        </div>
      {:else if content}
        <div class="flex flex-row w-full justify-between">
          <p>{content.title}</p>
          <p class="border border-vscode-foreground rounded px-1.5 py-0.5 ml-0.5 mt-0.5">
            <a class="no-underline text-vscode-link" href={content.url}>
              {content.__typename}
            </a>
          </p>
        </div>
        <IssueCard {card_info} {column_info} {handlers} />
      {/if}
    </div>
  {:else}
    <div class="no-permissions">
      <p>You don't have permissions to view this item.</p>
    </div>
  {/if}
</div>

<style>
  .card-container {
    margin-top: 1rem;
  }

  .card-content {
    border: 1px solid var(--vscode-editor-foreground);
    border-radius: 5px;
    padding: 1rem;
    margin-top: 1rem;
  }

  .error-message {
    color: var(--vscode-errorForeground);
    margin-bottom: 10px;
  }

  .title-input {
    width: 100%;
    margin-bottom: 10px;
    padding: 5px;
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border);
  }

  .button-row {
    display: flex;
    flex-direction: row;
    margin-top: 5px;
    gap: 5px;
  }

  .action-button {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    padding: 4px 8px;
    cursor: pointer;
  }

  .action-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .content-header {
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
  }

  .content-type {
    height: 5%;
    border: 1px solid var(--vscode-editor-foreground);
    border-radius: 5px;
    padding: 2px 5px;
    margin-left: 0.2rem;
    margin-top: 0.2rem;
  }

  .content-link {
    text-decoration: none;
    color: var(--vscode-textLink-foreground);
  }

  .no-permissions {
    border: 1px solid var(--vscode-editor-foreground);
    border-radius: 5px;
    padding: 1rem;
    margin-top: 1rem;
  }
</style>