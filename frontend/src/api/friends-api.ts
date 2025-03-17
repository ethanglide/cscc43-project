import { HttpClient, MessageResponse, ErrorResponse } from "./http-client";

type FriendsResponse = string[];

export interface FriendRequest {
  sender: string;
  receiver: string;
  status: string;
  timestamp: number;
}

export default class FriendsApi {
  static async getFriends(username: string) {
    const response = await HttpClient.get(`/friends?username=${username}`);
    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as FriendsResponse;
  }

  static async getIncomingRequests(token: string) {
    const response = await HttpClient.get("/friends/incoming", token);
    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as FriendRequest[];
  }

  static async getOutgoingRequests(token: string) {
    const response = await HttpClient.get("/friends/outgoing", token);
    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as FriendRequest[];
  }

  static async sendFriendRequest(token: string, receiver: string) {
    const response = await HttpClient.post(
      "/friends/send",
      { receiver },
      token,
    );
    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as MessageResponse;
  }

  static async acceptFriendRequest(token: string, sender: string) {
    const response = await HttpClient.post(
      "/friends/accept",
      { sender },
      token,
    );
    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as MessageResponse;
  }

  static async rejectFriendRequest(token: string, sender: string) {
    const response = await HttpClient.post(
      "/friends/reject",
      { sender },
      token,
    );
    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as MessageResponse;
  }

  static async deleteFriendRequest(token: string, friend: string) {
    const response = await HttpClient.post(
      "/friends/delete",
      { friend },
      token,
    );
    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as MessageResponse;
  }
}
