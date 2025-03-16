export enum RequestStatus {
  pending = "pending",
  accepted = "accepted",
  rejected = "rejected",
}

export interface FriendRequest {
  sender: string;
  receiver: string;
  status: RequestStatus;
  timestamp: number;
}
