import dotenv from "dotenv";

dotenv.config();

interface Environment {
  readonly NODE_ENV: string;
  readonly PORT: number;
  readonly DB_USER: string;
  readonly DB_PASSWORD: string;
  readonly DB_HOST: string;
  readonly DB_PORT: number;
  readonly DB_NAME: string;
  readonly DB_SOCKET_PATH: string;
  readonly JWT_SECRET: string;
}

const environment: Environment = {
  NODE_ENV: process.env.NODE_ENV as string,
  PORT: parseInt(process.env.PORT as string) || 3000,
  DB_USER: process.env.DB_USER as string,
  DB_PASSWORD: process.env.DB_PASSWORD as string,
  DB_HOST: process.env.DB_HOST as string,
  DB_PORT: parseInt(process.env.DB_PORT as string) || 5432,
  DB_NAME: process.env.DB_NAME as string,
  DB_SOCKET_PATH: process.env.DB_SOCKET_PATH as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
};

export default environment;
