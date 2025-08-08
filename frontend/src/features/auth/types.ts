import { type User } from "@shared/types";

export interface LoginCredentials {
  userName: string;
  password: string;
}

export interface RegisterCredentials {
  userName: string;
  password: string;
}

export interface UserDataResponse {
  user: User;
  jwt: string;
}

export interface TitleMessageResponse {
  title: string;
  message: string;
}
