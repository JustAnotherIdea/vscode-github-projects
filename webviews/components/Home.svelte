<script>
  import "../styles/app.css";
  import { ApolloClient, InMemoryCache } from "@apollo/client";

  import { setClient } from "svelte-apollo";
  import ProjectsList from "./ProjectsList.svelte";
  import ProjectInfo from "./ProjectInfo.svelte";
  import { getVsCodeApi } from '../utils/vscode';

  const vscode = getVsCodeApi();

  let session;
  let currentRepo;
  let filters = ["Repository"];

  window.addEventListener("message", async (event) => {
    const message = event.data;
    switch (message.command) {
      case "authComplete":
        session = message.payload.session;
        break;
      case "changeFilters":
        filters = message.payload.filters;
        break;
      case "returnSession":
        session = message.payload.session;
        break;
      case "setCurrentRepo":
        currentRepo = message.payload.repo;
        break;
    }
  });

  let client;

  $: {
    if (!session) {
      vscode.postMessage({
        type: "getSession",
      });
    }
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

  let selectedContainer;
  let selectedProject;

  function handleMessage(event) {
    selectedContainer = event.detail.container;
    selectedProject = event.detail.project;
    vscode.postMessage({
      type: "onChooseProject",
      value: { project: selectedProject, container: selectedContainer },
    });
  }
</script>

{#if !client}
  <!-- When webview is reloaded, client is not defined. -->
  <p>Client is not set, Sign In with GitHub first.</p>
{:else if !selectedProject}
  <ProjectsList on:message={handleMessage} {filters} {currentRepo} />
{:else if selectedContainer.type === "repo"}
  <ProjectInfo
    type="repo"
    name={selectedContainer.name}
    owner={selectedContainer.owner.login}
    number={selectedProject.number}
    on:message={handleMessage}
  />
{:else if selectedContainer.type === "org"}
  <ProjectInfo
    type="org"
    login={selectedContainer.login}
    number={selectedProject.number}
    on:message={handleMessage}
  />
{:else if selectedContainer.type === "user"}
  <ProjectInfo
    type="user"
    number={selectedProject.number}
    on:message={handleMessage}
  />
{/if}
