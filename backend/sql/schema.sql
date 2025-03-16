BEGIN;

CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL
);

-- Create type if not exists [credits to rog on stackoverflow](https://stackoverflow.com/questions/7624919/check-if-a-user-defined-type-already-exists-in-postgresql)
DO $$ BEGIN
    CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS friend_requests (
    sender TEXT NOT NULL,
    receiver TEXT NOT NULL,
    status request_status NOT NULL DEFAULT 'pending',
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (sender, receiver),
    FOREIGN KEY (sender) REFERENCES users(username)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (receiver) REFERENCES users(username)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS portfolios (
    username TEXT NOT NULL,
    portfolio_name TEXT NOT NULL,
    cash REAL NOT NULL DEFAULT 0,
    PRIMARY KEY (username, portfolio_name),
    FOREIGN KEY (username) REFERENCES users(username)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS stock_lists (
    username TEXT NOT NULL,
    list_name TEXT NOT NULL,
    public BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (username, list_name),
    FOREIGN KEY (username) REFERENCES users(username)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
    owner_username TEXT NOT NULL,
    list_name TEXT NOT NULL,
    reviewer_username TEXT NOT NULL,
    review VARCHAR(4000), -- frontend will only show review if not empty
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10) DEFAULT 5,
    PRIMARY KEY (owner_username, list_name, reviewer_username),
    FOREIGN KEY (owner_username, list_name) REFERENCES stock_lists(username, list_name)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS stocks (
    symbol TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS stock_history (
    symbol VARCHAR(5) NOT NULL,
    timestamp DATE NOT NULL,
    open REAL NOT NULL,
    high REAL NOT NULL,
    low REAL NOT NULL,
    close REAL NOT NULL,
    volume INTEGER NOT NULL,
    PRIMARY KEY (symbol, timestamp),
    FOREIGN KEY (symbol) REFERENCES stocks(symbol)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS stock_list_stocks (
    username TEXT NOT NULL,
    list_name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    amount INTEGER NOT NULL,
    PRIMARY KEY (username, list_name, symbol),
    FOREIGN KEY (username, list_name) REFERENCES stock_lists(username, list_name)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (symbol) REFERENCES stocks(symbol)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS portfolio_stocks (
    username TEXT NOT NULL,
    portfolio_name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    amount INTEGER NOT NULL,
    PRIMARY KEY (username, portfolio_name, symbol),
    FOREIGN KEY (username, portfolio_name) REFERENCES portfolios(username, portfolio_name)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (symbol) REFERENCES stocks(symbol)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

COMMIT;
