-- Atomic stock decrement function.
-- Returns true if stock was successfully decremented, false if insufficient stock.
-- This prevents race conditions and negative inventory in a single atomic operation.

CREATE OR REPLACE FUNCTION decrement_stock(
  p_variant_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  UPDATE product_variants
  SET stock_quantity = stock_quantity - p_quantity
  WHERE id = p_variant_id
    AND stock_quantity >= p_quantity;

  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$;
