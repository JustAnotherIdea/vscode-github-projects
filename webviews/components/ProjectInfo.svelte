<script>
  import Board from "./Board.svelte";
  import { mutation, query } from "svelte-apollo";
  import { createEventDispatcher } from "svelte";
  import * as queries from "./queries.js";
  import KeyboardBackspace from "svelte-material-icons/KeyboardBackspace.svelte";
  import Modal from "svelte-simple-modal";

  export let type = '', name = '', owner = '', login = '', number = 0;

  const dispatch = createEventDispatcher();

  const projectInfo = query(
    type === "repo"
      ? queries.GET_REPO_PROJECT_INFO
      : type === "org"
      ? queries.GET_ORG_PROJECT_INFO
      : queries.GET_USER_PROJECT_INFO,
    {
      variables:
        type === "repo"
          ? { name, owner, number }
          : type === "org"
          ? { login, number }
          : { number },
      pollInterval: 5000,
    }
  );

  let project;
  let fields = [];
  let items = [];
  let statusField;
  let columns = [];

  $: {
    if ($projectInfo.data) {
      console.log("Project Info Data:", $projectInfo.data);
      project =
        type === "repo"
          ? $projectInfo.data.repository.projectV2
          : type === "org"
          ? $projectInfo.data.organization.projectV2
          : $projectInfo.data.viewer.projectV2;
      
      console.log("Project:", project);

      if (project) {
        fields = project.fields.nodes;
        items = project.items.nodes;
        
        console.log("Fields:", fields);
        console.log("Items:", items);
        
        statusField = fields.find(f => {
          console.log("Checking field:", f);
          return f?.__typename === "ProjectV2SingleSelectField" && 
                 f?.name?.toLowerCase?.()?.includes("status");
        });
        
        console.log("Status Field:", statusField);

        if (statusField) {
          console.log("Status Field Options:", statusField.options);
          columns = statusField.options.map(option => {
            const cards = items.filter(item => {
              const fieldValues = item.fieldValues?.nodes || [];
              return fieldValues.some(fv => 
                fv?.__typename === "ProjectV2ItemFieldSingleSelectValue" &&
                fv?.name === option.name
              );
            }).map(item => ({
              id: item.id,
              content: {
                title: item.content.title,
                __typename: item.content.__typename
              },
              fieldValues: {
                nodes: item.fieldValues.nodes
              },
              __typename: item.__typename
            }));
            
            console.log(`Cards for column ${option.name}:`, cards);
            
            return {
              id: option.id,
              name: option.name,
              cards
            };
          });
          console.log("Generated Columns:", columns);
        }
      }
    }
  }

  // Card mutations for Projects V2
  const addItem = mutation(queries.ADD_PROJECT_V2_ITEM);
  const deleteItem = mutation(queries.DELETE_PROJECT_V2_ITEM);
  const updateItemField = mutation(queries.UPDATE_PROJECT_V2_ITEM_FIELD);
  const convertToIssue = mutation(queries.CREATE_ISSUE);

  async function handleCardMutations(card, request, payload) {
    try {
      if (!project?.id) {
        throw new Error('Project ID is undefined');
      }

      if (!statusField?.id) {
        throw new Error('Status field ID is undefined');
      }

      if (!card && request !== "addCard") {
        throw new Error('Card is undefined');
      }

      if (!card?.id && request !== "addCard") {
        throw new Error('Card ID is undefined');
      }

      switch (request) {
        case "addCard":
          if (!payload?.columnId) {
            throw new Error('Column ID is undefined');
          }
          await addItem({
            variables: {
              projectId: project.id,
              contentId: null,
              fieldId: statusField.id,
              value: payload.columnId
            },
          });
          break;

        case "deleteCard":
          await deleteItem({ 
            variables: { 
              projectId: project.id,
              itemId: card.id 
            } 
          });
          break;

        case "editCard":
          if (!payload?.columnId) {
            throw new Error('Column ID is undefined');
          }
          await updateItemField({
            variables: {
              projectId: project.id,
              itemId: card.id,
              fieldId: statusField.id,
              value: payload.columnId
            },
          });
          break;

        case "convertToIssue":
          try {
            console.log("Starting convertToIssue mutation");
            console.log("Project data:", project);
            
            // Get repository ID - first check if it's a repository project
            let repoId = $projectInfo.data?.repository?.id;
            
            // If no repository ID found (user/org project), we need to specify a repository
            if (!repoId) {
              // Show repository picker dialog
              const result = await vscode.window.showQuickPick(
                $projectInfo.data.viewer.repositories.nodes.map(repo => ({
                  label: repo.name,
                  id: repo.id
                })),
                {
                  placeHolder: 'Select a repository to create the issue in'
                }
              );
              
              if (!result) {
                throw new Error('No repository selected');
              }
              
              repoId = result.id;
            }

            console.log("Using repository ID:", repoId);
            
            if (!repoId) {
              throw new Error('Repository ID not found');
            }

            console.log("Creating issue with params:", {
              repositoryId: repoId,
              title: payload.title,
              body: payload.body
            });

            // Create the issue
            const { data: issueData } = await convertToIssue({
              variables: {
                repositoryId: repoId,
                title: payload.title,
                body: payload.body
              }
            });
            
            if (!issueData?.createIssue?.issue?.id) {
              throw new Error('Failed to create issue');
            }
            
            console.log("Issue creation response:", issueData);
          } catch (error) {
            console.error("Error in convertToIssue:", error);
            throw error;
          }
          break;

        case "editTitle":
          console.log("Available fields:", fields);
          
          const titleField = fields.find(f => 
            f.name === "Title" && 
            f.__typename === "ProjectV2Field"
          );
          
          console.log("Found title field:", titleField);
          
          if (!titleField?.id) {
            throw new Error('Title field not found');
          }
          
          await updateItemField({
            variables: {
              projectId: project.id,
              itemId: card.id,
              fieldId: titleField.id,
              text: payload.title
            },
          });
          break;

        default:
          break;
      }
    } catch (error) {
      console.error('Card mutation error:', error);
      throw error; // Re-throw to allow handling by the caller
    }
  }

  function handleMessage(event) {
    if (event.detail.payload === "stopPoll") {
      projectInfo.stopPolling();
    } else if (event.detail.payload === "startPoll") {
      projectInfo.startPolling(1800);
    }
  }

  function handleBackPressed() {
    dispatch("message", {
      container: null,
      project: null,
    });
  }
</script>

{#if $projectInfo.loading}
  Loading...
{:else if $projectInfo.error}
  Error: {$projectInfo.error.message}
{:else}
  <Modal>
    <div 
      on:click={handleBackPressed} 
      on:keydown={(e) => e.key === 'Enter' && handleBackPressed()}
      role="button"
      tabindex="0"
      class="back-button"
    >
      <KeyboardBackspace />
    </div>

    <div class="project-container">
      <h1 class="project-title">{project.title}</h1>
      {#if project.shortDescription}
        <h2 class="project-description">{project.shortDescription}</h2>
      {/if}
      <Board 
        {project}
        {columns}
        {statusField}
        {fields}
        handlers={{
          cardMutations: handleCardMutations
        }}
      />
    </div>
  </Modal>
{/if}

<style>
  .back-button {
    cursor: pointer;
    width: 25px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 1rem;
  }
  
  .project-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .project-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .project-description {
    margin: 0;
    font-size: 1rem;
    color: var(--vscode-descriptionForeground);
  }
</style>
