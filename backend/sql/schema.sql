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
        ON UPDATE CASCADE,
    CHECK (sender != receiver)
);

-- Not allowed to send a friend request to someone who has already sent you a friend request
CREATE OR REPLACE FUNCTION prevent_friend_request_cycle()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM friend_requests 
        WHERE sender = NEW.receiver AND receiver = NEW.sender
    ) THEN
        RAISE EXCEPTION 'A friend request from % to % already exists', NEW.receiver, NEW.sender;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER friend_request_no_cycle
BEFORE INSERT ON friend_requests
FOR EACH ROW
EXECUTE FUNCTION prevent_friend_request_cycle();

-- Resend a friend request if the previous one was rejected and is at least 5 minutes old
CREATE OR REPLACE FUNCTION handle_resend_friend_request()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM friend_requests 
        WHERE 1 = 1
            AND sender = NEW.sender 
            AND receiver = NEW.receiver 
            AND status = 'rejected' 
            AND timestamp <= NOW() - INTERVAL '5 MINUTES'
    ) THEN
        UPDATE friend_requests 
        SET
            status = 'pending', timestamp = CURRENT_TIMESTAMP 
        WHERE 1 = 1
            AND sender = NEW.sender 
            AND receiver = NEW.receiver;
        
        -- Prevent the new row from being inserted
        RETURN NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER check_resend_friend_request
BEFORE INSERT ON friend_requests
FOR EACH ROW
EXECUTE FUNCTION handle_resend_friend_request();

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

-- Some stocks may not have all the data, hence why some columns are nullable
CREATE TABLE IF NOT EXISTS stock_history (
    symbol VARCHAR(5) NOT NULL,
    timestamp DATE NOT NULL,
    open REAL,
    high REAL,
    low REAL,
    close REAL,
    volume INTEGER,
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
        ON UPDATE CASCADE,
    CHECK (amount > 0)
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
        ON UPDATE CASCADE,
    CHECK (amount > 0)
);

COMMIT;
