import { gql } from "@apollo/client";

export const MESSAGES = gql`
  query Messages($matchId: String!) {
    messages(matchId: $matchId) {
      id
      text
      senderId
      createdAt
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($matchId: String!, $text: String!) {
    sendMessage(matchId: $matchId, text: $text) {
      id
      text
      senderId
      createdAt
    }
  }
`;

export const ON_MESSAGE = gql`
  subscription OnMessage($matchId: String!) {
    onMessage(matchId: $matchId) {
      id
      text
      senderId
      createdAt
    }
  }
`;
