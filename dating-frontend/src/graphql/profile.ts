// src/graphql/profile.ts
import { gql } from '@apollo/client';

export const GET_MY_PROFILE = gql`
  query GetMyProfile {
    myProfile {
      id
      name
      gender
      bio
      birthday
      photos  # 🔥 Thêm photos
      interests
      createdAt
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
      birthday
      photos  # 🔥 Thêm photos
      interests
      createdAt
    }
  }
`;

export const UPLOAD_PHOTOS = gql`
  mutation UploadPhotos($photos: [String!]!) {
    uploadPhotos(photos: $photos)
  }
`;

export const DELETE_PHOTO = gql`
  mutation DeletePhoto($photoUrl: String!) {
    deletePhoto(photoUrl: $photoUrl)
  }
`;

export const SET_PRIMARY_PHOTO = gql`
  mutation SetPrimaryPhoto($photoUrl: String!) {
    setPrimaryPhoto(photoUrl: $photoUrl)
  }
`;
export const SUGGESTED_PROFILES = gql`
  query SuggestedProfiles($limit: Int = 20) {
    suggestedProfiles(limit: $limit) {
      id
      name
      age
      gender
      bio
      photos
      birthday
      distance
      distanceUnit
      interests
      commonInterestsCount
      matchPercentage
      score
      createdAt
    }
  }
`;