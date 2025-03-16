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
                receiver = ${username} AND status = ${RequestStatus.pending}
        `;

    return requests;
  }

  /**
   * Get all rejected friend requests sent by a user
   * @param username the username of the user
   * @returns the rejected friend requests
   */
  static async getRejectedRequests(username: string) {
    const requests = await sql<FriendRequest[]>`
            SELECT
                sender, receiver, status, timestamp
            FROM friend_requests
            WHERE
                sender = ${username} AND status = ${RequestStatus.rejected}
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
                sender = ${username} AND status = ${RequestStatus.pending}
        `;

    return requests;
  }

  /**
   * Send or resend a friend request
   * @param sender the sender of the friend request
   * @param receiver the receiver of the friend request
   */
  static async sendFriendRequest(sender: string, receiver: string) {
    // If the request already exists and is rejected,
    // it can be resent if it has passed the cooldown period
    const existingRequest = await sql<FriendRequest[]>`
            SELECT sender, receiver, status, timestamp
            FROM friend_requests
            WHERE
                sender = ${sender} AND receiver = ${receiver}
        `;

    if (existingRequest.length > 0) {
      if (existingRequest[0].status === RequestStatus.rejected) {
        const timestamp = existingRequest[0].timestamp;
        const now = Date.now();
        if (now - timestamp < FriendData._resendCooldown) {
          throw new Error(
            "Friend request has been rejected and cannot be resent yet",
          );
        }

        // Resend the friend request
        await sql`
                    UPDATE friend_requests
                    SET
                        status = ${RequestStatus.pending}, timestamp = NOW()
                    WHERE
                        sender = ${sender} AND receiver = ${receiver}
                `;

        return;
      } else {
        throw new Error("Friend request already exists");
      }
    }

    // Create a new friend request
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
   * @param sender the sender of the friend request
   * @param receiver the receiver of the friend request
   */
  static async deleteFriendRequest(sender: string, receiver: string) {
    await sql`
            DELETE FROM friend_requests
            WHERE
                sender = ${sender} AND receiver = ${receiver}
        `;
  }
}
