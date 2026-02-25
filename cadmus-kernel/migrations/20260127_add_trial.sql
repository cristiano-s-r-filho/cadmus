-- Adds a 'trial_expires_at' column to the `users` table.
-- This column is used to manage user trial periods, indicating when a free trial account expires.
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMP;
