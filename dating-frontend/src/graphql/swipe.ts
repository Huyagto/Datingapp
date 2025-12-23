// src/graphql/mutations/swipe.ts
import { gql } from '@apollo/client';

export const SWIPE_USER = gql`
  mutation SwipeUser($input: SwipeInput!) {
    swipeUser(input: $input) {
      isMatch
      matchId
    }
  }
`;
