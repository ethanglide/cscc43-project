import { body, param } from "express-validator";
import validate from "../utils/validate";

export default class FriendsValidator {
  static getFriends = validate([
    param("username").trim().notEmpty().escape().isString(),
  ]);

  static sendFriendRequest = validate([
    body("receiver").trim().notEmpty().escape().isString(),
  ]);

  static acceptFriendRequest = validate([
    body("sender").trim().notEmpty().escape().isString(),
  ]);

  static rejectFriendRequest = validate([
    body("sender").trim().notEmpty().escape().isString(),
  ]);

  static deleteFriendRequest = validate([
    body("receiver").trim().notEmpty().escape().isString(),
  ]);
}
