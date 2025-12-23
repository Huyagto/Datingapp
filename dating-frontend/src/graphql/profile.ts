// src/graphql/queries/profile.ts
import { gql } from "@apollo/client";

export const NEARBY_PROFILES = gql`
  query NearbyProfiles {
    nearbyProfiles {
      id
      name
      age
      gender
      bio
    }
  }
`;

export const UPDATE_MY_PROFILE = gql`
  mutation UpdateMyProfile($input: UpdateProfileInput!) {
    updateMyProfile(input: $input) {
      id
      name
      gender
      bio
      age
    }
  }
`;

export const GET_MY_PROFILE = gql`
  query MyProfile {
    myProfile {
      id
      name
      gender
      bio
      age
    }
  }
`;
// export const UPDATE_MY_LOCATION = gql`
//   mutation UpdateMyLocation($input: UpdateLocationInput!) {
//     updateMyLocation(input: $input)
//   }
// `;
