import { gql } from "@apollo/client";

export const EDIT_CARD = gql`
    mutation EDIT_CARD($isArchived: Boolean, $note: String, $projectCardId: ID!) {
      updateProjectCard(input: {isArchived: $isArchived, note: $note, projectCardId: $projectCardId }) {
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
      addProjectCard(input: { contentId: $contentId, note: $note, projectColumnId: $projectColumnId }) {
        clientMutationId
      }
    }

  `;

export const SWITCH_CARD_COLUMN = gql`
    mutation SWITCH_CARD_COLUMN($afterCardId: ID, $cardId: ID!, $columnId: ID!) {
      moveProjectCard(input: { afterCardId: $afterCardId, cardId: $cardId, columnId: $columnId }) {
        clientMutationId
      }
    }

  `;

export const CONVERT_CARD_TO_ISSUE = gql`
    mutation CONVERT_CARD_TO_ISSUE($body: String, $projectCardId: ID!, $repositoryId: ID!, $title: String) {
      convertProjectCardNoteToIssue(input: { body: $body, projectCardId: $projectCardId, repositoryId: $repositoryId, title: $title }) {
        clientMutationId
      }
    }

  `;

export const GET_REPO_PROJECT_INFO = gql`
    query GetRepoProjectInfo($name: String!, $owner: String!, $number: Int!) {
      repository(name: $name, owner: $owner) {
        id
        project(number: $number) {
          name
          body
          columns(first: 100) {
            nodes {
              id
              name
              cards(first: 100) {
                nodes {
                  content {
                    ...fieldsIssue
                    ...fieldsPR
                  }
                  id
                  note
                  isArchived
                  state
                }
              }
            }
          }
        }
      }
      rateLimit {
        limit
        cost
        remaining
        resetAt
      }
    }

    fragment fieldsIssue on Issue {
      title
    }

    fragment fieldsPR on PullRequest {
      title
    }
  `;

export const GET_ORG_PROJECT_INFO = gql`
    query GetOrgProjectInfo($login: String!, $number: Int!) {
      organization(login: $login) {
        project(number: $number) {
          name
          body
          columns(first: 100) {
            nodes {
              id
              name
              cards(first: 100) {
                nodes {
                  content {
                    ...fieldsIssue
                    ...fieldsPR
                  }
                  note
                  isArchived
                  state
                }
              }
            }
          }
        }
      }
      rateLimit {
        limit
        cost
        remaining
        resetAt
      }
    }

    fragment fieldsIssue on Issue {
      title
    }

    fragment fieldsPR on PullRequest {
      title
    }
  `;