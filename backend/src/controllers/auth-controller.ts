import { Request, Response } from "express";
import { addUser, getUser } from "../database/users";
import { hashPassword, verifyPassword } from "../utils/passwords";
import { EXPIRES_IN, generateAccessToken } from "../utils/access-tokens";

/**
 * Register a new user
 */
export async function registerUser(req: Request, res: Response) {
  const { username, password } = req.body;

  try {
    // Check if the user already exists
    const user = await getUser(username);
    if (user) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    // Add user to database
    const passwordHash = await hashPassword(password);
    await addUser(username, passwordHash);
    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}

/**
 * Login a user
 */
export async function loginUser(req: Request, res: Response) {
  const { username, password } = req.body;

  try {
    const user = await getUser(username);
    if (!user) {
      res.status(400).json({ error: "User does not exist" });
      return;
    }

    const isPasswordValid = await verifyPassword(user.password_hash, password);
    if (!isPasswordValid) {
      res.status(400).json({ error: "Invalid password" });
      return;
    }

    const accessToken = generateAccessToken(username);
    res.json({
      username,
      accessToken,
      expiresIn: EXPIRES_IN,
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}
