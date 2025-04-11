import postgres, { Options } from "postgres";
import environment from "../environment";

const config: Options<{}> = {
  user: environment.DB_USER,
  password: environment.DB_PASSWORD,
  host: environment.DB_HOST,
  database: environment.DB_NAME,
  port: environment.DB_PORT,
};

const sql = postgres(config);

export default sql;
