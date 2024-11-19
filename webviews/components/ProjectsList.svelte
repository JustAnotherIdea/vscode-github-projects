<script>
  import { query } from "svelte-apollo";
  import { createEventDispatcher } from "svelte";
  import * as queries from "./queries.js";

  const dispatch = createEventDispatcher();

  const containersInfo = query(queries.GET_CONTAINER_WITH_PROJECT, {
    pollInterval: 5000,
  });

  export let filters = [];

  let containers = [];
  let indexes = [];

  $: {
    if ($containersInfo.data) {
      console.log("Data:", $containersInfo.data);
      containers = [];
      if (filters.includes("Personal Profile")) {
        let newUser = addType($containersInfo.data.viewer, "user");
        containers = [...containers, newUser];
      }
      if (
        $containersInfo.data.viewer.repositories &&
        filters.includes("Repository")
      ) {
        for (let repo of $containersInfo.data.viewer.repositories.nodes) {
          let newRepo = addType(repo, "repo");
          containers = [...containers, newRepo];
        }
      }
      if (
        $containersInfo.data.viewer.organizations &&
        filters.includes("Organization")
      ) {
        for (let organization of $containersInfo.data.viewer.organizations.nodes) {
          let newOrg = addType(organization, "org");
          containers = [...containers, newOrg];
        }
      }

      indexes = [];
      containers.forEach((container, index) => {
        if (container.projects) {
          container.projects.nodes.forEach((project) => {
            if (
              filters.includes("Include Closed Projects") ||
              !project.closed
            ) {
              indexes = [...indexes, index];
            }
          });
        }
      });
      console.log("Containers:", containers);
    }
  }

  function handleSelectProject(container, project) {
    dispatch("message", {
      container: container,
      project: project,
    });
  }

  function addType(data, type) {
    console.log(`Adding type ${type} to:`, data);
    return {
      ...data,
      type: type,
      projects: data.projectsV2 || { nodes: [] }
    };
  }
</script>

{#if $containersInfo.loading}
  Loading...
{:else if $containersInfo.error}
  Error: {$containersInfo.error.message}
{:else}
  {#each containers as container, index}
    {#if container.projects?.nodes?.length > 0}
      <div>
        <h3>{container.name || 'Unnamed Container'}</h3>
        {#each container.projects.nodes as project}
          <div 
            on:click={() => handleSelectProject(container, project)}
            on:keydown={(e) => e.key === 'Enter' && handleSelectProject(container, project)}
            class="cursor-pointer p-2 my-1 border border-vscode-foreground rounded hover:bg-vscode-button-hover"
            role="button"
            tabindex="0"
          >
            <p>{project.title || 'Untitled Project'}</p>
            {#if project.shortDescription}
              <p class="text-sm text-vscode-description">
                {project.shortDescription}
              </p>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  {/each}
{/if}

