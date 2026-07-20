-- up migration
ALTER TABLE refresh_tokens ALTER COLUMN expires_at DROP NOT NULL;

-- down migration
ALTER TABLE refresh_tokens ALTER COLUMN expires_at SET NOT NULL;
