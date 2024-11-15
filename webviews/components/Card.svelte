<script>
  import IssueCard from "./IssueCard.svelte";
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
    handlers.cardMutations(card_info, "convertToIssue", {
      title: title,
      body: ""
    });
  };
</script>

{#if title || content}
<div
  style="border-style: solid;
        border-color: white;
        border-width: 1px;
        border-radius: 5px;
        padding: 1rem 1rem 1rem 1rem;
        margin-top: 1rem;"
>
  {#if title}
    <div>
      {#if isEditing}
        {#if error}
          <div class="error" style="color: red; margin-bottom: 10px;">
            {error}
          </div>
        {/if}
        <input 
          bind:value={editedTitle} 
          placeholder="Enter title" 
          style="width: 100%; margin-bottom: 10px; padding: 5px;"
        />
        <div style="display:flex; flex-direction: row; margin-top:5px;">
          <button on:click={handleSave} style="margin-right:5px;" disabled={!editedTitle.trim()}>
            Save
          </button>
          <button on:click={deleteCard} style="margin-right:5px;">
            Delete
          </button>
          <button on:click={archiveCard} style="margin-right:5px;">
            Archive
          </button>
          <button on:click={convertToIssue}>
            Convert to Issue
          </button>
          <button on:click={handleCancel}>
            Cancel
          </button>
        </div>
      {:else}
        <p>{title}</p>
        <div style="display:flex; flex-direction: row; margin-top:5px;">
          <button on:click={() => isEditing = true} style="margin-right:5px;">
            Edit
          </button>
        </div>
      {/if}
    </div>
  {:else if content}
    <div
      style="display: flex; flex-direction: row; width: 100%; justify-content: space-between;"
    >
      <p>{content.title}</p>
      <p
        style="height: 5%; border-style: solid; border-radius: 5px; padding:2px 5px 2px 5px; border-width: 1px; margin-left: 0.2rem; margin-top: 0.2rem;"
      >
        <a style="text-decoration: none" href={content.url}>
          {content.__typename}
        </a>
      </p>
    </div>
    <IssueCard 
      card_info={card_info} 
      column_info={column_info}
      handlers={handlers} 
    />
  {/if}
</div>
{:else}
<div
  style="border-style: solid;
  border-color: white;
  border-width: 1px;
  border-radius: 5px;
  padding: 1rem 1rem 1rem 1rem;
  margin-top: 1rem;"  
>
  <p>You don't have permissions to view this item.</p>
</div>
{/if}
