import express, { Express, Request, Response } from "express";
import environment from "./environment";
import authRoute from "./routes/auth";

const app: Express = express();

app.use(express.json());

app.use("/auth", authRoute);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(environment.PORT, () => {
  console.log(
    `[server]: Server is running at http://localhost:${environment.PORT}`,
  );
});
