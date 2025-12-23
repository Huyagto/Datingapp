// src/graphql/presence.ts
import { gql } from '@apollo/client';

export const PING_ONLINE = gql`
  mutation PingOnline {
    pingOnline
  }
`;

export const IS_ONLINE = gql`
  query IsOnline($userId: String!) {
    isOnline(userId: $userId)
  }
`;