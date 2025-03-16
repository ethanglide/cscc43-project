import express, { Express, Request, Response } from "express";
import environment from "./environment";
import authRoute from "./routes/auth";
import friendsRoute from "./routes/friends";
import usersRoute from "./routes/users";
import cors from "cors";
import corsOptions from "./cors-options";

const app: Express = express();

app.use(express.json());
app.use(cors(corsOptions));

app.use("/auth", authRoute);
app.use("/friends", friendsRoute);
app.use("/users", usersRoute);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(environment.PORT, () => {
  console.log(
    `[server]: Server is running at http://localhost:${environment.PORT}`,
  );
});
