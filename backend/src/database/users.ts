import { UserCredentials } from "../models/user-credentials";
import sql from "./sql";

/**
 * Class for interacting with the users table in the database
 */
export default class UserData {
  /**
   * Add a user to the database
   * @param username username of the user
   * @param passwordHash hash of the user's password
   */
  static async addUser(username: string, passwordHash: string) {
    await sql`
        INSERT INTO users
            (username, password_hash)
        VALUES
            (${username}, ${passwordHash})
    `;
  }

  /**
   * Get a user from the database
   * @param username the username of the user
   * @returns the user if it exists, null otherwise
   */
  static async getUser(username: string) {
    const user = await sql<UserCredentials[]>`
        SELECT
            username,
            password_hash
        FROM
            users
        WHERE
            username = ${username}
    `;

    if (user.length === 0) {
      return null;
    }

    return user[0];
  }

  /**
   * Get all users from the database
   * @returns the usernames of all users
   */
  static async getAllUsers() {
    const users = await sql<{ username: string }[]>`
        SELECT username
        FROM users
    `;

    return users.map((user) => user.username);
  }
}
