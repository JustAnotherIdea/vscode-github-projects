<script>
  import { getContext } from 'svelte';
  import AddColumn from './AddColumn.svelte';
  export let handlers, project;

  const { open } = getContext('simple-modal');

  const add_col = () => {
    open(AddColumn, { handlers: handlers, project: project }, {closeButton: ""});
  };
</script>

<p>
  <button 
    on:click={add_col} 
    class="w-56 mx-2 px-4 py-2 bg-vscode-button text-vscode-button-foreground rounded hover:bg-vscode-button-hoverBackground"
  >
    Add a Column
  </button>
</p>