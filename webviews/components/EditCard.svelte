<script>
  import { getContext, createEventDispatcher } from "svelte";
  import EditField from "./EditField.svelte";
  import ConvertIssue from "./ConvertIssue.svelte";
  export let note, card_info, column_info, handlers;

  const { open } = getContext("simple-modal");
  const dispatch = createEventDispatcher();

  const edit_card = () => {
    open(
      EditField,
      { handlers: handlers, message: { note, card_info, column_info } },
      { closeButton: "" },
      {
        onOpen: () => {
          dispatch("message", {
            payload: "stopDrag",
          });
        },
        onClose: () => {
          dispatch("message", {
            payload: "startDrag",
          });
        },
      }
    );
  };

  const convertToIssue = () => {
    open(
      ConvertIssue,
      { handlers: handlers, message: { note, card_info, column_info } },
      { closeButton: "" },
      {
        onOpen: () => {
          dispatch("message", {
            payload: "stopDrag",
          });
        },
        onClose: () => {
          dispatch("message", {
            payload: "startDrag",
          });
        },
      }
    );
  };

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
  <div class="flex flex-row mt-1.5 gap-1.5">
    <button 
      on:click={edit_card} 
      class="bg-vscode-button text-vscode-button-foreground px-2 py-1 rounded"
    >
      Edit
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
  </div>
</div>
