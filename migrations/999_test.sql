-- migrate:up
CREATE TABLE IF NOT EXISTS _migration_test (id SERIAL PRIMARY KEY, name VARCHAR(100));

-- migrate:down
DROP TABLE IF EXISTS _migration_test;
