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
        WHERE sender = NEW.sender 
            AND receiver = NEW.receiver 
            AND status = 'rejected' 
            AND timestamp <= NOW() - INTERVAL '5 MINUTES'
    ) THEN
        UPDATE friend_requests 
        SET
            status = 'pending', timestamp = CURRENT_TIMESTAMP 
        WHERE sender = NEW.sender 
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

DO $$ BEGIN
    CREATE TYPE stock_list_type AS ENUM ('public', 'private', 'portfolio');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS stock_lists (
    username TEXT NOT NULL,
    list_name TEXT NOT NULL,
    list_type stock_list_type NOT NULL DEFAULT 'private',
    cash REAL NOT NULL DEFAULT 0 CHECK(cash >= 0), -- Only for portfolios
    PRIMARY KEY (username, list_name),
    FOREIGN KEY (username) REFERENCES users(username)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
    owner_username TEXT NOT NULL,
    list_name TEXT NOT NULL,
    reviewer_username TEXT NOT NULL,
    review VARCHAR(4000) NOT NULL DEFAULT '', -- frontend will only show review if not empty
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10) DEFAULT 5,
    PRIMARY KEY (owner_username, list_name, reviewer_username),
    FOREIGN KEY (owner_username, list_name) REFERENCES stock_lists(username, list_name)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (reviewer_username) REFERENCES users(username)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CHECK (owner_username != reviewer_username)
);

-- Not allowed to review portfolios
CREATE OR REPLACE FUNCTION prevent_portfolio_review()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM stock_lists
        WHERE username = NEW.owner_username
            AND list_name = NEW.list_name
            AND list_type = 'portfolio'
    ) THEN
        RAISE EXCEPTION 'Cannot review a portfolio';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER check_portfolio_review
BEFORE INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION prevent_portfolio_review();

-- Update review and rating if the review already exists
CREATE OR REPLACE FUNCTION update_review()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM reviews
        WHERE owner_username = NEW.owner_username
            AND list_name = NEW.list_name
            AND reviewer_username = NEW.reviewer_username
    ) THEN
        UPDATE reviews
        SET review = NEW.review, rating = NEW.rating
        WHERE owner_username = NEW.owner_username
            AND list_name = NEW.list_name
            AND reviewer_username = NEW.reviewer_username;
        
        -- Prevent the new row from being inserted
        RETURN NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER check_update_review
BEFORE INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_review();

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

CREATE TABLE IF NOT EXISTS stock_CV (
    symbol VARCHAR(5) NOT NULL, 
    CV REAL CHECK (CV >= 0) DEFAULT 0, 
    PRIMARY KEY (symbol), 
    FOREIGN KEY (symbol) REFERENCES stocks(symbol)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS stock_beta (
    symbol VARCHAR(5) NOT NULL, 
    beta REAL CHECK (-1 <= beta AND beta <= 1) DEFAULT 0, 
    PRIMARY KEY (symbol), 
    FOREIGN KEY (symbol) REFERENCES stocks(symbol)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Refresh stock statistics (CV and beta)
CREATE OR REPLACE FUNCTION refresh_stock_cache()
RETURNS TRIGGER AS $$
DECLARE
    affected_symbol VARCHAR(5) := COALESCE(NEW.symbol, OLD.symbol);
BEGIN
    -- Recalculate changed stock CV(s)
    DELETE FROM stock_CV WHERE symbol = affected_symbol;
    INSERT INTO 
        stock_CV 
    SELECT
        symbol, 
        (STDDEV(close) / NULLIF(AVG(close), 0)) * 100 AS CV
    FROM
        stock_history
    WHERE
        symbol = affected_symbol
    GROUP BY 
        symbol
    HAVING 
        COUNT(close) > 0;

    -- Recalculate changed stock beta(s)
    DELETE FROM stock_beta WHERE symbol = affected_symbol;
    INSERT INTO 
        stock_beta
    WITH market_return AS (
        SELECT 
            timestamp,
            SUM(close) AS market_close
        FROM 
            stock_history
        GROUP BY 
            timestamp
    )
    SELECT 
        sh.symbol,
        COVAR_POP(sh.close, mr.market_close) / NULLIF(VAR_POP(mr.market_close), 0) AS beta
    FROM 
        stock_history sh
    JOIN 
        market_return mr ON 
        sh.timestamp = mr.timestamp
    WHERE
        symbol = affected_symbol
    GROUP BY 
        sh.symbol;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recalculate changed stock CV(s) and beta(s) on stock change
CREATE OR REPLACE TRIGGER stock_cache_refresh
AFTER INSERT OR UPDATE OR DELETE ON stock_history
FOR EACH ROW
EXECUTE FUNCTION refresh_stock_cache();

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

-- Update user cash when adding/removing stocks to/from a portfolio
CREATE OR REPLACE FUNCTION update_portfolio_cash()
RETURNS TRIGGER AS $$
DECLARE
    stock_price REAL;
    old_cash REAL;
    amt_diff INT;
    list_type stock_list_type;
BEGIN
    -- Get current user cash and list_type
    SELECT 
        stock_lists.cash, stock_lists.list_type INTO 
        old_cash, list_type
    FROM 
        stock_lists
    WHERE 
        username = COALESCE(NEW.username, OLD.username) AND 
        list_name = COALESCE(NEW.list_name, OLD.list_name);

    -- Trigger only on portfolios
    IF list_type IS DISTINCT FROM 'portfolio' THEN
        return NEW;
    END IF;

    -- Get most recent stock price from stock_history
    SELECT 
        close INTO stock_price
    FROM 
        stock_history
    WHERE 
        symbol = COALESCE(NEW.symbol, OLD.symbol)
    ORDER BY 
        timestamp DESC -- Order by most recent close prices
    LIMIT 1;           -- Get first record

    -- Upon adding a stock from a portfolio, subtract cash
    IF TG_OP = 'INSERT' THEN
        -- Check for sufficient funds
        IF old_cash < (NEW.amount * stock_price) THEN
            RAISE EXCEPTION 'Insufficient funds. Attempted to buy $% worth of stocks, but current cash is $%.', (NEW.amount * stock_price), old_cash;
        END IF;

        UPDATE 
            stock_lists
        SET 
            cash = old_cash - (NEW.amount * stock_price)
        WHERE 
            username = NEW.username AND 
            list_name = NEW.list_name;

    -- Upon adding/remove an existing stock from a portfolio, adjust cash
    ELSIF TG_OP = 'UPDATE' THEN 
        amt_diff = NEW.amount - OLD.amount;

        -- If buying more stocks, subtract cash
        IF amt_diff > 0 THEN
            -- Check for sufficient funds
            IF old_cash < (amt_diff * stock_price) THEN
                RAISE EXCEPTION 'Insufficient funds. Attempted to buy $% worth of additional stocks, but current cash is $%.', (amt_diff * stock_price), old_cash;
            END IF;

            UPDATE 
                stock_lists
            SET 
                cash = old_cash - (amt_diff * stock_price)
            WHERE 
                username = NEW.username AND 
                list_name = NEW.list_name;

        -- If selling stocks, add cash
        ELSIF amt_diff < 0 THEN
            UPDATE 
                stock_lists
            SET 
                cash = old_cash + (ABS(amt_diff) * stock_price)
            WHERE 
                username = NEW.username AND 
                list_name = NEW.list_name;
        END IF;

    -- Upon removing a stock from a portfolio, add cash
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE 
            stock_lists
        SET 
            cash = old_cash + (OLD.amount * stock_price)
        WHERE 
            username = OLD.username AND 
            list_name = OLD.list_name;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER portfolio_cash_update
AFTER INSERT OR UPDATE OR DELETE ON stock_list_stocks
FOR EACH ROW
EXECUTE FUNCTION update_portfolio_cash();

CREATE OR REPLACE FUNCTION update_stock_history()
RETURNS TRIGGER AS $$
DECLARE
    stock_price REAL;
    current_volume INTEGER;
    current_date DATE := CURRENT_DATE;
BEGIN
    -- Get most recent stock price from stock_history
    SELECT 
        close INTO stock_price
    FROM 
        stock_history
    WHERE 
        symbol = COALESCE(NEW.symbol, OLD.symbol)
    ORDER BY 
        timestamp DESC  -- Order by most recent close prices
    LIMIT 1;            -- Get first record

    IF TG_OP = 'INSERT' THEN
        INSERT INTO stock_history 
            (symbol, timestamp, open, high, low, close, volume)
        VALUES 
            (NEW.symbol, current_date, stock_price, stock_price, stock_price, stock_price, NEW.amount)
        ON CONFLICT (symbol, timestamp) DO UPDATE   -- If (symbol, timestamp) pair already exists in stock_history, accumulate volume
        SET
            open = LEAST(stock_history.open, stock_price),
            high = GREATEST(stock_history.high, stock_price),
            low = LEAST(stock_history.low, stock_price),
            close = stock_price,
            volume = stock_history.volume + EXCLUDED.volume;

    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE 
            stock_history
        SET
            close = stock_price,
            high = GREATEST(high, stock_price),
            low = LEAST(low, stock_price),
            volume = volume + (NEW.amount - OLD.amount)
        WHERE 
            symbol = NEW.symbol AND 
            timestamp = current_date;

    ELSIF TG_OP = 'DELETE' THEN
        -- Get current volume
        SELECT 
            volume INTO current_volume
        FROM 
            stock_history
        WHERE 
            symbol = OLD.symbol AND 
            timestamp = current_date;

        -- If all stocks are sold, delete stock_history entry
        IF current_volume - OLD.amount <= 0 THEN
            DELETE FROM 
                stock_history
            WHERE 
                symbol = OLD.symbol AND 
                timestamp = current_date;
        
        -- Otherwise, subtract volume
        ELSE
            UPDATE 
                stock_history
            SET 
                volume = volume - OLD.amount
            WHERE 
                symbol = OLD.symbol AND 
                timestamp = current_date;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER stock_history_update
AFTER INSERT OR UPDATE OR DELETE ON stock_list_stocks
FOR EACH ROW
EXECUTE FUNCTION update_stock_history();

CREATE TABLE IF NOT EXISTS portfolio_corr_mtx (
    username TEXT NOT NULL,
    list_name TEXT NOT NULL,
    stock1 TEXT NOT NULL,
    stock2 TEXT NOT NULL,
    correlation REAL CHECK (-1 <= correlation AND correlation <= 1) DEFAULT 0,
    PRIMARY KEY (username, list_name, stock1, stock2), 
    FOREIGN KEY (username, list_name) REFERENCES stock_lists(username, list_name)
        ON DELETE CASCADE
        ON UPDATE CASCADE, 
    FOREIGN KEY (stock1) REFERENCES stocks(symbol)
        ON DELETE CASCADE
        ON UPDATE CASCADE, 
    FOREIGN KEY (stock2) REFERENCES stocks(symbol)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Refresh portfolio statistics (correlation matrix)
CREATE OR REPLACE FUNCTION refresh_portfolio_cache()
RETURNS TRIGGER AS $$
DECLARE
    affected_portfolio RECORD;
BEGIN
    -- For all affected portfolios...
    FOR affected_portfolio IN 
        SELECT DISTINCT 
            username, 
            list_name 
        FROM 
            stock_list_stocks 
        WHERE 
            username = COALESCE(OLD.username, NEW.username) AND 
            list_name = COALESCE(OLD.list_name, NEW.list_name)
    LOOP
        -- Delete affected portfolios
        DELETE FROM 
            portfolio_corr_mtx 
        WHERE 
            username = affected_portfolio.username AND 
            list_name = affected_portfolio.list_name;

        -- Recalculate correlation matrices for affected portfolios
        INSERT INTO 
            portfolio_corr_mtx 
        WITH stock_returns AS (
            SELECT 
                sls.username,
                sls.list_name,
                sh.symbol,
                sh.timestamp,
                (
                    (sh.close - LAG(sh.close) OVER (PARTITION BY sls.username, sls.list_name, sh.symbol ORDER BY sh.timestamp)) / 
                    NULLIF(LAG(sh.close) OVER (PARTITION BY sls.username, sls.list_name, sh.symbol ORDER BY sh.timestamp), 0)
                ) AS return
            FROM 
                stock_history sh
            JOIN 
                stock_list_stocks sls ON 
                sh.symbol = sls.symbol
            WHERE 
                sls.username = affected_portfolio.username AND 
                sls.list_name = affected_portfolio.list_name
        )
        SELECT 
            s1.username,
            s1.list_name,
            s1.symbol AS stock1,
            s2.symbol AS stock2,
            CORR(s1.return, s2.return) AS correlation
        FROM 
            stock_returns s1
        JOIN 
            stock_returns s2 ON 
            s1.username = s2.username AND 
            s1.list_name = s2.list_name AND 
            s1.timestamp = s2.timestamp AND 
            s1.symbol < s2.symbol
        GROUP BY 
            s1.username, 
            s1.list_name, 
            s1.symbol, 
            s2.symbol
        HAVING
            COUNT(s1.return) > 0 AND 
            COUNT(s2.return) > 0;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recalculate portfolio correlation matrices on portfolio change
CREATE OR REPLACE TRIGGER portfolio_cache_refresh
AFTER INSERT OR UPDATE OR DELETE ON stock_list_stocks
FOR EACH ROW
EXECUTE FUNCTION refresh_portfolio_cache();

-- Update stock amount if the stock is already in the list
CREATE OR REPLACE FUNCTION update_stock_amount()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM stock_list_stocks
        WHERE username = NEW.username
            AND list_name = NEW.list_name
            AND symbol = NEW.symbol
    ) THEN
        UPDATE stock_list_stocks
        SET amount = NEW.amount
        WHERE username = NEW.username
            AND list_name = NEW.list_name
            AND symbol = NEW.symbol;
        
        -- Prevent the new row from being inserted
        RETURN NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER check_update_stock_amount
BEFORE INSERT ON stock_list_stocks
FOR EACH ROW
EXECUTE FUNCTION update_stock_amount();

DO $$ BEGIN
    CREATE TYPE date_unit AS ENUM ('day', 'month', 'year');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Predicts stock price for a given number of days/months/years. 
-- Interval units are optional. Defaults to 'day'.
-- Example usage: 
--      SELECT * FROM predict_stock_price('AAPL', 10);          -- Predict AAPL stock prices 10 days. 
--      SELECT * FROM predict_stock_price('AAPL', 10, 'day');   -- Equivalent to the above. 
--      SELECT * FROM predict_stock_price('VTR', 3, 'month');   -- Predict VTR stock prices for 3 months. 
--      SELECT * FROM predict_stock_price('AMZN', 100, 'year'); -- Predict AMZN stock prices for 100 years. 
CREATE OR REPLACE FUNCTION predict_stock_price(
    stock_symbol VARCHAR(5), 
    num_intervals INTEGER, 
    interval_unit date_unit DEFAULT 'day'
)
RETURNS TABLE (
    symbol VARCHAR(5), 
    date DATE, 
    predicted_price REAL
) AS $$
BEGIN
    RETURN QUERY
    WITH numeric_dates AS (
        SELECT 
            close,
            EXTRACT(EPOCH FROM timestamp) / 86400 AS date_ordinal
        FROM 
            stock_history
        WHERE 
            stock_history.symbol = stock_symbol
    ),
    regression AS (
        SELECT 
            REGR_SLOPE(close, date_ordinal) AS slope,
            REGR_INTERCEPT(close, date_ordinal) AS intercept
        FROM 
            numeric_dates
    ),
    future_dates AS (
        SELECT 
            generate_series(CURRENT_DATE, 
                            (CURRENT_DATE + (num_intervals || ' ' || interval_unit || 's')::INTERVAL)::date, 
                            ('1 ' || interval_unit)::INTERVAL
            )::date AS gen_date
    ),
    prediction_input AS (
        SELECT 
            EXTRACT(EPOCH FROM gen_date) / 86400 AS date_ordinal,
            gen_date
        FROM 
            future_dates
    )
    SELECT 
        stock_symbol AS symbol, 
        p.gen_date AS date, 
        (r.slope * p.date_ordinal + r.intercept)::REAL AS predicted_price
    FROM 
        regression r, 
        prediction_input p;
END;
$$ LANGUAGE plpgsql;

COMMIT;
