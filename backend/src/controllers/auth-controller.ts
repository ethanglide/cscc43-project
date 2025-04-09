import { Request, Response } from "express";
import { hashPassword, verifyPassword } from "../utils/passwords";
import { EXPIRES_IN, generateAccessToken } from "../utils/access-tokens";
import UserData from "../database/users";

/**
 * Controller for handling authentication requests
 */
export default class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response) {
    const { username, password } = req.body;

    try {
      // Check if the user already exists
      const user = await UserData.getUser(username);
      if (user) {
        res.status(400).json({ error: "User already exists" });
        return;
      }

      // Add user to database
      const passwordHash = await hashPassword(password);
      await UserData.addUser(username, passwordHash);
      res.json({ message: "User registered successfully" });
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  /**
   * Login a user
   */
  static async login(req: Request, res: Response) {
    const { username, password } = req.body;

    try {
      const user = await UserData.getUser(username);
      if (!user) {
        res.status(400).json({ error: "User does not exist" });
        return;
      }

      const isPasswordValid = await verifyPassword(
        user.password_hash,
        password,
      );
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

  /**
   * Test if the token is valid.
   * The middleware validator will check if the token is valid and not expired
   * and if the request makes it to this controller, it means the token is valid.
   */
  static async tokenTest(req: Request, res: Response) {
    res.json({ message: "Token is valid" });
  }
}
