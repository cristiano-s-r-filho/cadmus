-- Adds user profile fields to the `users` table.

-- Adds a column to store the URL of the user's avatar image.
ALTER TABLE users ADD COLUMN avatar_url TEXT;

-- Adds a column to store a recovery key for password reset or account recovery.
ALTER TABLE users ADD COLUMN recovery_key TEXT;
