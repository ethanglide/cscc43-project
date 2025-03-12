import jwt from "jsonwebtoken";
import environment from "../environment";
import { getUser } from "../database/users";

/**
 * The time in seconds that the access token is valid for
 */
export const EXPIRES_IN = 60 * 60; // 1 hour

/**
 * Generate an access token for a user
 * @param username the username of the user
 * @returns the access token
 */
export function generateAccessToken(username: string) {
  return jwt.sign({ username }, environment.JWT_SECRET, {
    expiresIn: EXPIRES_IN,
  });
}

/**
 * Check if an access token is valid
 * @param token the access token to check
 * @returns true if the access token is valid, false otherwise
 */
export async function isAccessTokenValid(token: string) {
  let data;

  try {
    data = jwt.verify(token, environment.JWT_SECRET);
  } catch (error) {
    console.error(error);
    return false;
  }

  // Check if the user exists
  const username = (data as { username: string }).username;
  const user = await getUser(username);
  return !!user;
}
