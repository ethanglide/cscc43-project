import { body, param } from "express-validator";
import validate from "../utils/validate";

/**
 * Validate the request body for registering a new user
 */
export const validateRegisterUser = validate([
  body("username").trim().notEmpty().escape().isString(),
  body("password").notEmpty().escape().isString(),
]);

/**
 * Validate the request body for logging in a user
 */
export const validateLoginUser = validate([
  body("username").trim().notEmpty().escape().isString(),
  body("password").notEmpty().escape().isString(),
]);

/**
 * Validate the request body for removing a user
 */
export const validateRemoveUser = validate([
  param("id").notEmpty().isNumeric(),
]);
