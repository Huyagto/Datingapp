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
      interests
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
      birthday
      interests
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
      birthday
      interests
    }
  }
`;
export const SUGGESTED_PROFILES = gql`
  query SuggestedProfiles($limit: Float) {
    suggestedProfiles(limit: $limit) {
      id
      name
      age
      gender
      bio
      interests
      commonInterestsCount  
      matchPercentage       
    }
  }
`;
// export const UPDATE_MY_LOCATION = gql`
//   mutation UpdateMyLocation($input: UpdateLocationInput!) {
//     updateMyLocation(input: $input)
//   }
// `;
