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
  query GetContainerWithProject {
    viewer {
      login
      projectsV2(first: 20) {
        nodes {
          id
          title
          shortDescription
          number
          closed
          url
        }
      }
      repositories(first: 20) {
        nodes {
          id
          name
          owner {
            login
          }
          projectsV2(first: 20) {
            nodes {
              id
              title
              shortDescription
              number
              closed
              url
            }
          }
        }
      }
      organizations(first: 20) {
        nodes {
          id
          login
          projectsV2(first: 20) {
            nodes {
              id
              title
              shortDescription
              number
              closed
              url
            }
          }
        }
      }
    }
  }
`;

export const GET_REPO_PROJECT_INFO = gql`
  query GetRepoProjectInfo($name: String!, $owner: String!, $number: Int!) {
    repository(name: $name, owner: $owner) {
      projectV2(number: $number) {
        id
        title
        shortDescription
        url
        fields(first: 20) {
          nodes {
            ... on ProjectV2FieldCommon {
              id
              name
              __typename
            }
            ... on ProjectV2SingleSelectField {
              id
              name
              __typename
              options {
                id
                name
                __typename
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
        fields(first: 20) {
          nodes {
            ... on ProjectV2FieldCommon {
              id
              name
              __typename
            }
            ... on ProjectV2SingleSelectField {
              id
              name
              __typename
              options {
                id
                name
                __typename
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

export const GET_USER_PROJECT_INFO = gql`
  query GetUserProjectInfo($number: Int!) {
    viewer {
      projectV2(number: $number) {
        id
        title
        shortDescription
        url
        fields(first: 20) {
          nodes {
            ... on ProjectV2Field {
              id
              name
              __typename
            }
            ... on ProjectV2SingleSelectField {
              id
              name
              options {
                id
                name
              }
              __typename
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
                url
                __typename
              }
              ... on PullRequest {
                title
                url
                __typename
              }
            }
            fieldValues(first: 20) {
              nodes {
                ... on ProjectV2ItemFieldTextValue {
                  text
                  field {
                    ... on ProjectV2Field {
                      name
                    }
                  }
                }
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
      repositories(first: 100) {
        nodes {
          id
          name
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

export const ADD_PROJECT_V2_ITEM = gql`
  mutation AddProjectV2Item($projectId: ID!, $contentId: ID!) {
    addProjectV2Item(input: { projectId: $projectId, contentId: $contentId }) {
      item {
        id
      }
    }
  }
`;

export const DELETE_PROJECT_V2_ITEM = gql`
  mutation DeleteProjectV2Item($itemId: ID!) {
    deleteProjectV2Item(input: { projectId: $itemId }) {
      deletedItemId
    }
  }
`;

export const UPDATE_PROJECT_V2_ITEM_FIELD = gql`
  mutation UpdateProjectV2ItemFieldValue(
    $projectId: ID!
    $itemId: ID!
    $fieldId: ID!
    $text: String!
  ) {
    updateProjectV2ItemFieldValue(
      input: {
        projectId: $projectId
        itemId: $itemId
        fieldId: $fieldId
        value: { text: $text }
      }
    ) {
      projectV2Item {
        id
      }
    }
  }
`;

