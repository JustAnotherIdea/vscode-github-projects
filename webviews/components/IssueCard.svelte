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
        columnId: archivedStatus.i
      });
    }
  };
</script>

<div>
  <div style="display:flex; flex-direction: row; margin-top:5px;">
    <button on:click={deleteCard} style="margin-right:5px;"> Delete </button>
    <button on:click={archiveCard} > Archive </button>
  </div>
</div>
