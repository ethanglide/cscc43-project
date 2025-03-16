CREATE DATABASE c43_project;

CREATE TABLE users (
    username TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL
);

CREATE TABLE friend_requests (
    sender TEXT NOT NULL,
    receiver TEXT NOT NULL,
    accepted BOOLEAN NOT NULL DEFAULT FALSE,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (sender, receiver),
    FOREIGN KEY (sender) REFERENCES users(username)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (receiver) REFERENCES users(username)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE portfolios (
    username TEXT NOT NULL,
    portfolio_name TEXT NOT NULL,
    cash REAL NOT NULL DEFAULT 0,
    PRIMARY KEY (username, portfolio_name),
    FOREIGN KEY (username) REFERENCES users(username)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE stock_lists (
    username TEXT NOT NULL,
    list_name TEXT NOT NULL,
    public BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (username, list_name),
    FOREIGN KEY (username) REFERENCES users(username)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE reviews (
    owner_username TEXT NOT NULL,
    list_name TEXT NOT NULL,
    reviewer_username TEXT NOT NULL,
    review VARCHAR(4000), -- frontend will only show review if not empty
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10) DEFAULT 5,
    PRIMARY KEY (owner_username, list_name, reviewer_username),
    FOREIGN KEY (owner_username, list_name) REFERENCES stock_lists(username, list_name)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
);

CREATE TABLE stocks (
    symbol TEXT PRIMARY KEY,
);

CREATE TABLE stock_history (
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

CREATE TABLE stock_list_stocks (
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

CREATE TABLE portfolio_stocks (
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
