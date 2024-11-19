<script>
  export let card_info, column_info, handlers;

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
</script>

<div>
  <div class="flex flex-row mt-1.5">
    <button 
      on:click={deleteCard} 
      class="px-2 py-1 mr-1.5 bg-vscode-button text-vscode-button-foreground rounded hover:bg-vscode-button-hoverBackground"
    >
      Delete
    </button>
    <button 
      on:click={archiveCard}
      class="px-2 py-1 bg-vscode-button text-vscode-button-foreground rounded hover:bg-vscode-button-hoverBackground"
    >
      Archive
    </button>
  </div>
</div>
