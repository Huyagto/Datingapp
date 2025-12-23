import { gql } from "@apollo/client";

export const MY_MATCHES = gql`
  query MyMatches {
    myMatches {
      id
      userA
      userB
      createdAt
    }
  }
`;
