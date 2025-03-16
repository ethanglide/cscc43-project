import { body } from "express-validator";
import validate from "../utils/validate";

/**
 * Validator for authentication routes
 */
export default class AuthValidator {
  /**
   * Validate the request body for registering a new user
   */
  static register = validate([
    body("username").trim().notEmpty().escape().isString(),
    body("password").notEmpty().escape().isString(),
  ]);

  /**
   * Validate the request body for logging in a user
   */
  static login = validate([
    body("username").trim().notEmpty().escape().isString(),
    body("password").notEmpty().escape().isString(),
  ]);
}
