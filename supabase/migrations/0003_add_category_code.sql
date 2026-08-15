-- Add a code column to categories table for SKU prefixes
ALTER TABLE categories ADD COLUMN code text UNIQUE;
