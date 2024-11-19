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
      
      console.log("Full Project Object:", project);
      console.log("Project ID:", project?.id);
      console.log("Project Type:", type);

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

      switch (request) {
        case "editTitle":
          const titleField = fields.find(f => 
            f.__typename === "ProjectV2Field" && 
            f.name === "Title"
          );
          
          if (!titleField?.id) {
            throw new Error('Title field not found');
          }
          
          await updateItemField({
            variables: {
              projectId: project.id,
              itemId: card.id,
              fieldId: titleField.id,
              value: { text: payload.title }
            },
          });
          break;

        case "editCard":
          await updateItemField({
            variables: {
              projectId: project.id,
              itemId: card.id,
              fieldId: statusField.id,
              value: { singleSelectOptionId: payload.columnId }
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

        case "convertToIssue":
          const repository = project.repositories?.nodes?.[0];
          
          if (!repository?.id) {
            throw new Error('No repository found for this project. Please link a repository first.');
          }

          // Get the current status of the draft item
          const currentStatus = card.fieldValues.nodes.find(fv => 
            fv.__typename === "ProjectV2ItemFieldSingleSelectValue" &&
            fv.field.name === "Status"
          );

          // Create the issue first
          const issueResult = await convertToIssue({
            variables: {
              repositoryId: repository.id,
              title: payload.title,
              body: payload.body
            }
          });

          // Delete the draft item
          await deleteItem({
            variables: {
              projectId: project.id,
              itemId: card.id
            }
          });

          // Add the new issue to the project
          const newItem = await addItem({
            variables: {
              projectId: project.id,
              contentId: issueResult.data.createIssue.issue.id
            }
          });

          // Set the status field to match the original draft item's status
          if (currentStatus) {
            await updateItemField({
              variables: {
                projectId: project.id,
                itemId: newItem.data.addProjectV2ItemById.item.id,
                fieldId: statusField.id,
                value: { singleSelectOptionId: statusField.options.find(opt => opt.name === currentStatus.name).id }
              }
            });
          }
          break;
      }
    } catch (error) {
      console.error('Card mutation error:', error);
      throw error;
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
      class="w-6 cursor-pointer flex items-center justify-start mb-4"
    >
      <KeyboardBackspace />
    </div>

    <div class="flex flex-col gap-4">
      <h1 class="m-0 text-2xl font-semibold">{project.title}</h1>
      {#if project.shortDescription}
        <h2 class="m-0 text-base text-vscode-descriptionForeground">{project.shortDescription}</h2>
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
