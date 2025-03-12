import { UserCredentials } from "../models/user-credentials";
import sql from "./sql";

/**
 * Add a user to the database
 * @param username username of the user
 * @param passwordHash hash of the user's password
 */
export async function addUser(username: string, passwordHash: string) {
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
export async function getUser(username: string) {
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
