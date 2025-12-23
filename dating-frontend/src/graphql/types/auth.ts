// src/graphql/types/auth.ts

export interface LoginResponse {
  login: {
    accessToken: string;
  };
}

export interface LoginVariables {
  input: {
    email: string;
    password: string;
  };
}

export interface RegisterVariables {
  input: {
    username: string;
    email: string;
    phone: string;
    password: string;
  };
}

export interface RegisterResponse {
  register: {
    accessToken: string;
    user: {
      id: string;
      name: string;
    };
  };
}

