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
    console.log("Project:", column_info.project);
    
    open(ConvertIssue, 
      {
        message: { 
          card_info, 
          column_info,
          note: title,
          project: column_info.project
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