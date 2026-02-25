-- Migration to add the 'required_tier' column to the `classes` table.
-- This column specifies an optional access tier required for documents of a certain class.
ALTER TABLE classes
ADD COLUMN required_tier TEXT NULL;
