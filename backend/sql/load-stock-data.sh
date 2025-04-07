#!/bin/sh

# Check file eists (argument 1)
if [ ! -f $1 ]; then
  echo "File \"$1\" not found"
  exit 1
fi

# Load data into PostgreSQL database
psql -U postgres -d c43_project << EOF
    BEGIN;

    -- Do not calculate stock stats while loading stock data
    ALTER TABLE stock_history DISABLE TRIGGER stock_cache_refresh;

    CREATE TABLE stock_data_temp (
        timestamp DATE,
        open REAL,
        high REAL,
        low REAL,
        close REAL,
        volume INT,
        symbol VARCHAR(5),
        PRIMARY KEY (timestamp, symbol)    
    );

    \copy stock_data_temp FROM '$1' DELIMITER ',' CSV HEADER;

    INSERT INTO stocks (symbol)
    SELECT DISTINCT symbol FROM stock_data_temp
    ON CONFLICT DO NOTHING;

    INSERT INTO stock_history (timestamp, open, high, low, close, volume, symbol)
    SELECT timestamp, open, high, low, close, volume, symbol
    FROM stock_data_temp
    ON CONFLICT (timestamp, symbol) DO NOTHING;

    DROP TABLE stock_data_temp;

    -- Re-enable stock stats trigger
    ALTER TABLE stock_history ENABLE TRIGGER stock_cache_refresh;

    COMMIT;
EOF

if [ $? -ne 0 ]; then
  echo "Error connecting to database"
  exit 1
fi
