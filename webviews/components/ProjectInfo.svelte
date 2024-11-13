<script>
  import Board from "./Board.svelte";
  import { mutation, query } from "svelte-apollo";
  import { createEventDispatcher } from "svelte";
  import * as queries from "./queries.js";
  import KeyboardBackspace from "svelte-material-icons/KeyboardBackspace.svelte";

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
      switch (request) {
        case "addCard":
          addItem({
            variables: {
              projectId: project.id,
              contentId: null,
              fieldId: statusField.id,
              value: payload.columnId
            },
          });
          break;

        case "deleteCard":
          deleteItem({ 
            variables: { 
              projectId: project.id,
              itemId: card.id 
            } 
          });
          break;

        case "editCard":
          updateItemField({
            variables: {
              projectId: project.id,
              itemId: card.id,
              fieldId: statusField.id,
              value: payload.columnId
            },
          });
          break;

        case "convertToIssue":
          // Step 1: Create the issue
          const { data: issueData } = await mutation(queries.CREATE_ISSUE)({
            variables: {
              repositoryId: repoId,
              title: payload.title,
              body: payload.body
            }
          });
          
          if (issueData?.createIssue?.issue?.id) {
            // Step 2: Add the issue to the project
            await addItem({
              variables: {
                projectId: project.id,
                contentId: issueData.createIssue.issue.id
              }
            });

            // Step 3: Delete the original draft item
            await deleteItem({ 
              variables: { 
                projectId: project.id,
                itemId: card.id 
              } 
            });
          }
          break;

        case "editTitle":
          updateItemField({
            variables: {
              projectId: project.id,
              itemId: card.id,
              fieldId: fields.find(f => 
                f.__typename === "ProjectV2FieldTextValue" && 
                f.name.toLowerCase() === "title"
              ).id,
              value: payload.title
            },
          });
          break;

        default:
          break;
      }
    } catch (error) {
      console.log(error.message);
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
  <div 
    on:click={handleBackPressed} 
    on:keydown={(e) => e.key === 'Enter' && handleBackPressed()}
    role="button"
    tabindex="0"
    style="cursor: pointer; width: 25px"
  >
    <KeyboardBackspace width="25" height="25" />
  </div>

  <div style="display: flex; flex-direction: column">
    <h1>{project.title}</h1>
    <h2>{project.shortDescription}</h2>
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
{/if}
