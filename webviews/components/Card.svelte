<script>
  import Modal from "svelte-simple-modal";
  import EditCard from "./EditCard.svelte";
  import IssueCard from "./IssueCard.svelte";
  export let card_info, column_info, handlers;

  // Get the title/content from the card's field values
  let title = card_info.content?.title || card_info.fieldValues?.nodes?.find(
    fv => fv?.__typename === "ProjectV2ItemFieldTextValue"
  )?.text || 'Untitled';

  // Get any linked content (issue/PR)
  let content = card_info.content;
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
      <p>{title}</p>
      <Modal>
        <EditCard 
          card_info={card_info} 
          column_info={column_info} 
          note={title} 
          handlers={handlers} 
          on:message
        />
      </Modal>
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
    <Modal>
      <IssueCard 
        card_info={card_info} 
        column_info={column_info}
        handlers={handlers} 
      />
    </Modal>
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
