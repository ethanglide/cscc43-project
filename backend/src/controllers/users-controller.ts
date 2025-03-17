import { Request, Response } from "express";
import UserData from "../database/users";

/**
 * Controller for the users route
 */
export default class UsersController {
  /**
   * Get all users
   */
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await UserData.getAllUsers();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }
}
