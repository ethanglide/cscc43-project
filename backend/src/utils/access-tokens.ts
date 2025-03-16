import jwt from "jsonwebtoken";
import environment from "../environment";
import UserData from "../database/users";
import { get } from "http";

interface AccessTokenData {
  username: string;
}

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
 * Get the data stored in an access token
 * @param token the access token
 * @returns the data stored in the access token
 */
export async function getAccessTokenData(token: string) {
  let data;

  try {
    data = jwt.verify(token, environment.JWT_SECRET);
  } catch (error) {
    console.error(error);
    return null;
  }

  return data as AccessTokenData;
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
  const username = (data as AccessTokenData).username;
  const user = await UserData.getUser(username);
  return !!user;
}
