-- Update existing orders to use INR currency
UPDATE "orders" SET "currency" = 'INR' WHERE "currency" = 'USD';