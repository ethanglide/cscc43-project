import express from "express";
import AuthValidator from "../middleware/auth-validator";
import AuthController from "../controllers/auth-controller";
import authenticate from "../middleware/authenticate";

const router = express.Router();

router.post("/register", AuthValidator.register, AuthController.register);

router.post("/login", AuthValidator.login, AuthController.login);

router.get(
  "/test",
  authenticate,
  AuthValidator.tokenTest,
  AuthController.tokenTest,
);

export default router;
