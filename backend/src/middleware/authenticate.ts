import { NextFunction, Request, Response } from "express";
import { isAccessTokenValid } from "../utils/access-tokens";

async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Missing authorization header" });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Invalid authorization header" });
  }

  const token = authHeader.split(" ")[1];
  const tokenIsValid = await isAccessTokenValid(token);

  if (!tokenIsValid) {
    return res.status(401).json({ error: "Invalid access token" });
  }

  next();
}

export default authenticate;
