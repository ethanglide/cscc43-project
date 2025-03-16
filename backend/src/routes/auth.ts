import express from "express";
import AuthValidator from "../middleware/auth-validator";
import AuthController from "../controllers/auth-controller";

const router = express.Router();

router.post("/register", AuthValidator.register, AuthController.register);

router.post("/login", AuthValidator.login, AuthController.login);

export default router;
