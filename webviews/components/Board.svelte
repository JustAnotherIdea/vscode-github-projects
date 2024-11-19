<script>
  import Card from "./Card.svelte";
  import { dndzone } from "svelte-dnd-action";
  import { createEventDispatcher } from "svelte";
  import Modal from "svelte-simple-modal";
  import AddCardContent from "./AddCardContent.svelte";

  export let project;
  export let columns;
  export let statusField;
  export let fields;
  export let handlers;

  let prevColumns = [];
  let filteredColumns = [];
  let draggable = true;

  $: {
    if (prevColumns !== columns) {
      prevColumns = columns;
      filteredColumns = columns.map(column => ({
        ...column,
        cards: (column.cards || []).filter(card => 
          !(card.fieldValues?.nodes || []).some(fv => 
            fv?.__typename === "ProjectV2ItemFieldSingleSelectValue" &&
            fv?.name?.toLowerCase?.()?.includes("archived")
          )
        )
      }));
    }
  }

  const dispatch = createEventDispatcher();

  function handleConsiderColumns(e) {
    dispatch("message", {
      payload: "stopPoll",
    });
    filteredColumns = e.detail.items;
  }

  function handleFinalizeColumns(e) {
    dispatch("message", {
      payload: "startPoll",
    });
    filteredColumns = e.detail.items;
  }

  function handleConsiderCards(colId, e) {
    dispatch("message", {
      payload: "stopPoll",
    });

    const colIndex = filteredColumns.findIndex((column) => column.id === colId);
    filteredColumns[colIndex].cards = e.detail.items;
    filteredColumns = [...filteredColumns];
  }

  function handleFinalizeCards(colId, e) {
    dispatch("message", {
      payload: "startPoll",
    });

    const colIndex = filteredColumns.findIndex((column) => column.id === colId);
    const newCard = filteredColumns[colIndex].cards.filter(x => !e.detail.items.includes(x))[0];

    if (newCard) {
      handlers.cardMutations(newCard, "editCard", { 
        columnId: colId
      });
    }

    filteredColumns[colIndex].cards = e.detail.items;
    filteredColumns = [...filteredColumns];
  }

  let cardsOpen = 0;

  function handleMessage(event) {
    if (event.detail.payload === "stopDrag") {
      cardsOpen--;
    } else if (event.detail.payload === "startDrag") {
      cardsOpen++;
    }
    if (cardsOpen === 0) {
      draggable = true;
    } else {
      draggable = false;
    }
  }
</script>

<div class="flex flex-row overflow-x-auto">
  <div
    class="flex flex-row"
    use:dndzone={{
      items: filteredColumns,
      type: "columns",
      dragDisabled: true,
    }}
    on:consider={handleConsiderColumns}
    on:finalize={handleFinalizeColumns}
  >
    {#each filteredColumns as column (column.id)}
      <div class="border border-white rounded-md flex flex-col p-4 mr-4 overflow-y-hidden min-h-[30rem] max-h-full min-w-[20rem] w-1/4">
        <h2>{column.name}</h2>
        <div
          class="h-full overflow-y-auto min-h-[30rem] mb-1"
          use:dndzone={{ items: column.cards, dragDisabled: !draggable }}
          on:consider={(e) => handleConsiderCards(column.id, e)}
          on:finalize={(e) => handleFinalizeCards(column.id, e)}
        >
          {#if column.cards}
            {#each column.cards as card (card.id)}
              <Card 
                card_info={card} 
                column_info={{ 
                  id: column.id,
                  name: column.name,
                  statusField: statusField
                }}
                {handlers}
                on:message={handleMessage}
              />
            {/each}
          {/if}
        </div>
        <Modal>
          <AddCardContent {column} {handlers} />
        </Modal>
      </div>
    {/each}
  </div>
</div>
