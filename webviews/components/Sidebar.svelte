<script lang="ts">
  import Collaborators from "./Collaborators.svelte";
  import { ApolloClient, InMemoryCache } from "@apollo/client";
  import { setClient } from "svelte-apollo";
  import { getVsCodeApi } from '../utils/vscode';

  const vscode = getVsCodeApi();

  let filterInclude = ["Repository"];

  $: vscode.postMessage({ type: "onChangeFilter", value: filterInclude });

  let menu = [
    "Personal Profile",
    "Repository",
    "Organization",
    "Include Closed Projects",
  ];

  function join(filterInclude) {
    if (filterInclude.length === 1) return filterInclude[0];
    return `${filterInclude.slice(0, -1).join(", ")} and ${
      filterInclude[filterInclude.length - 1]
    }`;
  }

  $: session = null;

  let project;
  let container;

  window.addEventListener("message", async (event) => {
    const message = event.data;

    switch (message.command) {
      case "authComplete":
        session = message.payload.session;
        break;
      case "projectChosen":
        project = message.payload.project;
        container = message.payload.container;
        break;
    }
  });
  // send message as soon as sidebar loads.
  vscode.postMessage({ type: "onSignIn", value: "success" });

  let client;

  $: {
    if (session) {
      client = new ApolloClient({
        uri: "https://api.github.com/graphql",
        cache: new InMemoryCache(),
        headers: {
          authorization: `Bearer ${session.accessToken}`,
        },
      });
      setClient(client);
    }
  }
</script>

{#if !session}
  <div class="p-4">
    <p class="mb-4">Sign in with GitHub to get started.</p>
    {#if vscode}
      <button
        on:click={() => {
          vscode.postMessage({ type: "onSignIn", value: "success" });
        }}
        class="px-4 py-2 bg-vscode-button text-vscode-button-foreground rounded hover:bg-vscode-button-hoverBackground"
      >
        Sign in with GitHub
      </button>
    {:else}
      <p class="text-vscode-error">Error: VS Code API not available</p>
    {/if}
  </div>
{:else if !project}
  <div class="p-4">
    <h2 class="mb-4">Filter Projects</h2>

    {#each menu as flavour}
      <label class="flex items-center mb-2 cursor-pointer">
        <input
          type="checkbox"
          bind:group={filterInclude}
          value={flavour}
          class="mr-2"
        />
        <span>{flavour}</span>
      </label>
    {/each}
  </div>
{:else}
  <div class="p-4">
    <h2 class="text-lg font-semibold mb-2">Project</h2>
    <h4 class="mb-6">{project.name}</h4>
    <h2 class="text-lg font-semibold mb-2">{container.type === "org" ? "Members" : "Collaborators"}</h2>
    <Collaborators {project} {container} />
  </div>
{/if}
