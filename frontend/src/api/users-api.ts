import { ErrorResponse, HttpClient } from "./http-client";

type UsersResponse = string[];

export class UsersApi {
  static async getAllUsers() {
    const response = await HttpClient.get("/users");
    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as UsersResponse;
  }
}
