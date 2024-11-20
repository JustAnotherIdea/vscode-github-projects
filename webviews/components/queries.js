import { gql } from "@apollo/client";

// Card Mutations

export const EDIT_CARD = gql`
  mutation EDIT_CARD($isArchived: Boolean, $note: String, $projectCardId: ID!) {
    updateProjectCard(
      input: {
        isArchived: $isArchived
        note: $note
        projectCardId: $projectCardId
      }
    ) {
      clientMutationId
    }
  }
`;

export const DELETE_CARD = gql`
  mutation DELETE_CARD($cardId: ID!) {
    deleteProjectCard(input: { cardId: $cardId }) {
      clientMutationId
    }
  }
`;

export const ADD_CARD = gql`
  mutation ADD_CARD($contentId: ID, $note: String, $projectColumnId: ID!) {
    addProjectCard(
      input: {
        contentId: $contentId
        note: $note
        projectColumnId: $projectColumnId
      }
    ) {
      clientMutationId
    }
  }
`;

export const SWITCH_CARD_COLUMN = gql`
  mutation SWITCH_CARD_COLUMN($afterCardId: ID, $cardId: ID!, $columnId: ID!) {
    moveProjectCard(
      input: { afterCardId: $afterCardId, cardId: $cardId, columnId: $columnId }
    ) {
      clientMutationId
    }
  }
`;

export const CREATE_ISSUE = gql`
  mutation CreateIssue($repositoryId: ID!, $title: String!, $body: String) {
    createIssue(input: {
      repositoryId: $repositoryId,
      title: $title,
      body: $body
    }) {
      issue {
        id
      }
    }
  }
`;

// Column Mutations

export const DELETE_COLUMN = gql`
  mutation DELETE_COLUMN($columnId: ID!) {
    deleteProjectColumn(input: { columnId: $columnId }) {
      clientMutationId
    }
  }
`;

export const ADD_COLUMN = gql`
  mutation ADD_COLUMN($name: String!, $projectId: ID!) {
    addProjectColumn(input: { name: $name, projectId: $projectId }) {
      clientMutationId
    }
  }
`;

export const EDIT_COLUMN = gql`
  mutation EDIT_COLUMN($name: String!, $projectColumnId: ID!) {
    updateProjectColumn(
      input: { name: $name, projectColumnId: $projectColumnId }
    ) {
      clientMutationId
    }
  }
`;

export const GET_CONTAINER_WITH_PROJECT = gql`
  query {
    viewer {
      login
      repositories(first: 100) {
        nodes {
          id
          name
          owner {
            login
          }
          projectsV2(first: 10) {
            nodes {
              id
              title
              number
              shortDescription
              closed
            }
          }
        }
      }
      projectsV2(first: 20) {
        nodes {
          id
          title
          number
          shortDescription
          closed
          repositories(first: 10) {
            nodes {
              id
              name
              owner {
                login
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_REPO_PROJECT_INFO = gql`
  query GetRepoProjectInfo($owner: String!, $name: String!, $number: Int!) {
    repository(owner: $owner, name: $name) {
      projectV2(number: $number) {
        id
        title
        shortDescription
        url
        repositories(first: 10) {
          nodes {
            id
            name
          }
        }
        fields(first: 20) {
          nodes {
            ... on ProjectV2Field {
              id
              name
            }
            ... on ProjectV2SingleSelectField {
              id
              name
              options {
                id
                name
              }
            }
          }
        }
        items(first: 100) {
          nodes {
            id
            fieldValues(first: 100) {
              nodes {
                __typename
                ... on ProjectV2ItemFieldTextValue {
                  text
                  field {
                    ... on ProjectV2FieldCommon {
                      name
                      __typename
                    }
                  }
                }
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                  field {
                    ... on ProjectV2FieldCommon {
                      name
                      __typename
                    }

                  }

                }
              }
            }
            content {
              ... on DraftIssue {
                title
              }
              ... on Issue {
                title
                url
              }
              ... on PullRequest {
                title
                url
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_ORG_PROJECT_INFO = gql`
  query GetOrgProjectInfo($login: String!, $number: Int!) {
    organization(login: $login) {
      projectV2(number: $number) {
        id
        title
        shortDescription
        url
        repositories(first: 10) {
          nodes {
            id
            name
          }
        }
        fields(first: 20) {
          nodes {
            ... on ProjectV2Field {
              id
              name
            }
            ... on ProjectV2SingleSelectField {
              id
              name
              options {
                id
                name
              }
            }
          }
        }
        items(first: 100) {
          nodes {
            id
            content {
              ... on DraftIssue {
                title
                __typename
              }
              ... on Issue {
                title
                __typename
              }
              ... on PullRequest {
                title
                __typename
              }
            }
            fieldValues(first: 8) {
              nodes {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                  field {
                    ... on ProjectV2SingleSelectField {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_USER_PROJECT_INFO = gql`
  query GetUserProjectInfo($number: Int!) {
    viewer {
      projectV2(number: $number) {
        id
        title
        shortDescription
        url
        repositories(first: 10) {
          nodes {
            id
            name
          }
        }
        fields(first: 20) {
          nodes {
            ... on ProjectV2Field {
              id
              name
            }
            ... on ProjectV2SingleSelectField {
              id
              name
              options {
                id
                name
              }
            }
          }
        }
        items(first: 100) {
          nodes {
            id
            content {
              ... on DraftIssue {
                title
                __typename
              }
              ... on Issue {
                title
                __typename
              }
              ... on PullRequest {
                title
                __typename
              }
            }
            fieldValues(first: 8) {
              nodes {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                  field {
                    ... on ProjectV2SingleSelectField {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_REPO_COLLABORATORS = gql`
  query GetRepoCollaborators($name: String!, $owner: String!) {
    repository(name: $name, owner: $owner) {
      collaborators(affiliation: ALL) {
        nodes {
          name
        }
      }
    }
  }
`;

export const GET_ORG_MEMBERS = gql`
  query GetRepoMembers($login: String!) {
    organization(login: $login) {
      membersWithRole(first: 100) {
        nodes {
          name
        }
      }
    }
  }
`;

export const UPDATE_PROJECT_V2_ITEM_FIELD = gql`
  mutation UpdateProjectV2ItemField(
    $projectId: ID!
    $itemId: ID!
    $fieldId: ID!
    $value: ProjectV2FieldValue!
  ) {
    updateProjectV2ItemFieldValue(
      input: {
        projectId: $projectId
        itemId: $itemId
        fieldId: $fieldId
        value: $value
      }
    ) {
      projectV2Item {
        id
      }
    }
  }
`;

export const DELETE_PROJECT_V2_ITEM = gql`
  mutation DeleteProjectV2Item($projectId: ID!, $itemId: ID!) {
    deleteProjectV2Item(input: {
      projectId: $projectId,
      itemId: $itemId
    }) {
      deletedItemId
    }
  }
`;

export const ADD_PROJECT_V2_ITEM = gql`
  mutation AddProjectV2DraftItem($projectId: ID!, $title: String!) {
    addProjectV2DraftIssue(input: {
      projectId: $projectId,
      title: $title
    }) {
      projectItem {
        id
      }
    }
  }
`;

export const GET_PROJECT_INFO = gql`
  query GetProjectInfo($login: String!, $number: Int!) {
    viewer {
      projectV2(number: $number) {
        id
        title
        repositories(first: 10) {
          nodes {
            id
            name
          }
        }
        # ... rest of your existing query fields
      }
    }
  }
`;

export const ARCHIVE_PROJECT_V2_ITEM = gql`
  mutation ArchiveProjectV2Item($projectId: ID!, $itemId: ID!) {
    archiveProjectV2Item(input: {
      projectId: $projectId,
      itemId: $itemId
    }) {
      item {
        id
      }
    }
  }
`;



