// src/types/profile.types.ts
export type Profile = {
  id: string;
  name: string;
  gender: string;
  bio: string;
  birthday: string;
  photos?: string[];
  interests?: string[];
  createdAt: string;
};

export type UpdateProfileInput = {
  name?: string;
  gender?: string;
  bio?: string;
  birthday?: string;
  interests?: string[];
};

export type UploadPhotosResponse = {
  uploadPhotos: string[];
};

export type DeletePhotoResponse = {
  deletePhoto: boolean;
};