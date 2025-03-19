# cscc43-project

## Tech Stack

### Frontend

- [React](https://react.dev/) frontend *framework*
- [TailwindCSS](https://tailwindcss.com/) styling
- [DaisyUI](https://daisyui.com/) component library
- [ReactRouter](https://reactrouter.com/) routing

### Backend

- [Express](https://expressjs.com/) web server framework
- [`postgres`](https://www.npmjs.com/package/postgres) DBMS interaction
- [`express-validator`](https://express-validator.github.io/docs/) API input validation and sanitation

### Both

- [TypeScript](https://www.typescriptlang.org/) programming language
- [Prettier](https://prettier.io/) code formatting

> Note: Make sure to run `npm run prettier` before committing any code!

## Getting Started

Make sure [nodejs](https://nodejs.org/en) and [npm](https://www.npmjs.com/) are installed.

### Frontend

```sh
cd frontend # navigate to frontend directory
npm install # install dependencies
npm run dev # start dev server
```

### Backend

Populate your `.env` file with proper values as defined in `.env.example`.

If you are running in dev mode, and thus using a local postgres database rather than the cloud hosted production database, make sure Postgres is running ([setup tutorial](https://www.postgresql.org/docs/current/tutorial-install.html)) with the same configuration as defined in `.env`.

Some things to watch out for:

- You have a database with the same name as defined in `.env`
- Postgres is running on the same port as defined in `.env`
- Your username/password in `.env` corresponds to a real user and password in your database
- Local connections are allowed (set to "trust") in [`pg_hba.conf`](https://www.postgresql.org/docs/current/auth-pg-hba-conf.html)

Start the postgres server:

```sh
sudo systemctl start postgresql.service # or any other equivalent command
```

Load in the schema (make sure that `c43_project` is a database in your postgres server):

```sh
# in /backend/sql
psql -U postgres -d c43_project -f schema.sql
```

Download the historical data from quercus, then load it in:

```sh
# in /backend/sql
sudo chmod +x load-stock-data.sh # if needed
./load-stock-data.sh /path/to/data.csv
```

Start the dev server:

```sh
# in /backend
npm install # install dependencies
npm run dev # start dev server
```
