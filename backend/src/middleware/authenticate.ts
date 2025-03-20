import { NextFunction, Request, Response } from "express";
import { getAccessTokenData } from "../utils/access-tokens";
import UserData from "../database/users";

async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: "Missing authorization header" });
    return;
  }

  if (!authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Invalid authorization header" });
    return;
  }

  const token = authHeader.split(" ")[1];
  const tokenData = await getAccessTokenData(token);

  if (!tokenData) {
    res.status(401).json({ error: "Invalid access token" });
    return;
  }

  const user = await UserData.getUser(tokenData.username);
  if (!user) {
    res.status(401).json({ error: "User does not exist" });
    return;
  }

  // Store the token data in res.locals so it can be accessed by the controllers
  res.locals.tokenData = tokenData;

  next();
}

export default authenticate;
