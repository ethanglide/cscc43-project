import postgres, { Options } from "postgres";
import environment from "../environment";

const config: Options<{}> = {
  user: environment.DB_USER,
  password: environment.DB_PASSWORD,
  host: environment.DB_HOST,
  database: environment.DB_NAME,
};

// // If the environment is prod, use the socket path
if (environment.NODE_ENV === "prod") {
  config.path = "/cloudsql/" + environment.DB_SOCKET_PATH + "/.s.PGSQL.5432";
} else {
  config.host = environment.DB_HOST;
  config.port = environment.DB_PORT;
}

const sql = postgres(config);

export default sql;
