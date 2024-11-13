<script>
  import { getContext } from 'svelte';
  import AddCard from './AddCard.svelte';
  export let column, handlers;
  const { open } = getContext('simple-modal');
  let note = "";
  let error = null;

  const add_card = () => {
    open(AddCard, { handlers: handlers, message: column }, {closeButton: ""});
  };
</script>

<p><button on:click={add_card} style="width: 100%; margin-top: 5px;">Add Card</button></p>