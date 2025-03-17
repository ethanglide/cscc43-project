import { FriendRequest, RequestStatus } from "../models/friend-request";
import sql from "./sql";

/**
 * Class for interacting with the friend_requests table in the database
 */
export default class FriendData {
  private static _resendCooldown = 5 * 60 * 1000; // 5 minutes

  /**
   * Get all friends of a user
   * @param username the username of the user
   * @returns the usernames of the user's friends
   */
  static async getFriends(username: string) {
    // You are a friend of someone if they accepted your friend request or if you accepted theirs
    const friends = await sql<{ friend: string }[]>`
            (SELECT
                sender AS friend
            FROM
                friend_requests
            WHERE
                receiver = ${username} AND status = ${RequestStatus.accepted})
            UNION
            (SELECT
                receiver AS friend
            FROM
                friend_requests
            WHERE
                sender = ${username} AND status = ${RequestStatus.accepted})
        `;

    return friends.map((friend) => friend.friend);
  }

  /**
   * Get all incoming friend requests for a user
   * @param username the username of the user
   * @returns the incoming friend requests
   */
  static async getIncomingRequests(username: string) {
    const requests = await sql<FriendRequest[]>`
            SELECT
                sender, receiver, status, timestamp
            FROM
                friend_requests
            WHERE
                receiver = ${username}
        `;

    return requests;
  }

  /**
   * Get all outgoing friend requests for a user
   * @param username the username of the user
   * @returns the outgoing friend requests
   */
  static async getOutgoingRequests(username: string) {
    const requests = await sql<FriendRequest[]>`
            SELECT
                sender, receiver, status, timestamp
            FROM friend_requests
            WHERE
                sender = ${username}
        `;

    return requests;
  }

  /**
   * Send or resend a friend request
   * @param sender the sender of the friend request
   * @param receiver the receiver of the friend request
   */
  static async sendFriendRequest(sender: string, receiver: string) {
    await sql`
            INSERT INTO friend_requests
                (sender, receiver, status, timestamp)
            VALUES
                (${sender}, ${receiver}, ${RequestStatus.pending}, NOW())
        `;
  }

  /**
   * Accept a friend request
   * @param sender the sender of the friend request
   * @param receiver the receiver of the friend request
   */
  static async acceptFriendRequest(sender: string, receiver: string) {
    await sql`
            UPDATE friend_requests
            SET status = ${RequestStatus.accepted}
            WHERE
                sender = ${sender} AND receiver = ${receiver}
        `;
  }

  /**
   * Reject a friend request
   * @param sender the sender of the friend request
   * @param receiver the receiver of the friend request
   */
  static async rejectFriendRequest(sender: string, receiver: string) {
    await sql`
            UPDATE friend_requests
            SET status = ${RequestStatus.rejected}, timestamp = NOW()
            WHERE
                sender = ${sender} AND receiver = ${receiver}
        `;
  }

  /**
   * Delete a friend request
   * @param friend1 one of the users in the friend request
   * @param friend2 the other user in the friend request
   */
  static async deleteFriendRequest(friend1: string, friend2: string) {
    await sql`
            DELETE FROM friend_requests
            WHERE
                (sender = ${friend1} AND receiver = ${friend2})
                OR
                (sender = ${friend2} AND receiver = ${friend1})
        `;
  }
}
