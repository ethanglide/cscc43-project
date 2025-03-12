import express from "express";
import { loginUser, registerUser } from "../controllers/auth-controller";
import {
  validateLoginUser,
  validateRegisterUser,
} from "../middleware/auth-validator";

const router = express.Router();

router.post("/register", validateRegisterUser, registerUser);

router.post("/login", validateLoginUser, loginUser);

export default router;
