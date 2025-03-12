import { ErrorResponse, HttpClient, MessageResponse } from "./http-client";

interface RegisterUserRequest {
  username: string;
  password: string;
}

export interface LoginUserResponse {
  username: string;
  accessToken: string;
  expiresIn: number;
}

export class AuthApi {
  static async registerUser(user: RegisterUserRequest) {
    const response = await HttpClient.post("/auth/register", user);

    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as MessageResponse;
  }

  static async loginUser(user: RegisterUserRequest) {
    const response = await HttpClient.post("/auth/login", user);

    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as LoginUserResponse;
  }
}
