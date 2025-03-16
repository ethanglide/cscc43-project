import { Request, Response } from "express";
import FriendData from "../database/friends";

/**
 * Controller for the friends routes
 */
export default class FriendsController {
  static async getFriends(req: Request, res: Response) {
    const { username } = req.query;

    try {
      const friends = await FriendData.getFriends(username as string);
      res.json(friends);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  static async getIncomingRequests(req: Request, res: Response) {
    const username = res.locals.tokenData.username;

    try {
      const requests = await FriendData.getIncomingRequests(username);
      res.json(requests);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  static async getRejectedRequests(req: Request, res: Response) {
    const username = res.locals.tokenData.username;

    try {
      const requests = await FriendData.getRejectedRequests(username);
      res.json(requests);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  static async getOutgoingRequests(req: Request, res: Response) {
    const username = res.locals.tokenData.username;

    try {
      const requests = await FriendData.getOutgoingRequests(username);
      res.json(requests);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  static async sendFriendRequest(req: Request, res: Response) {
    const sender = res.locals.tokenData.username;
    const { receiver } = req.body;

    try {
      await FriendData.sendFriendRequest(sender, receiver);
      res.json({ message: "Friend request sent" });
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  static async acceptFriendRequest(req: Request, res: Response) {
    const receiver = res.locals.tokenData.username;
    const { sender } = req.body;

    try {
      await FriendData.acceptFriendRequest(sender, receiver);
      res.json({ message: "Friend request accepted" });
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  static async rejectFriendRequest(req: Request, res: Response) {
    const receiver = res.locals.tokenData.username;
    const { sender } = req.body;

    try {
      await FriendData.rejectFriendRequest(sender, receiver);
      res.json({ message: "Friend request rejected" });
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  static async deleteFriendRequest(req: Request, res: Response) {
    const username = res.locals.tokenData.username;
    const { receiver } = req.body;

    try {
      await FriendData.deleteFriendRequest(username, receiver);
      res.json({ message: "Friend removed" });
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }
}
