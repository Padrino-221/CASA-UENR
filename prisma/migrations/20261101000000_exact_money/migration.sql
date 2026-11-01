-- Existing values are rounded to cents. Verify the preflight query in README before deployment.
ALTER TABLE "Transaction" ALTER COLUMN "amount" TYPE DECIMAL(14,2)
USING round("amount"::numeric, 2);
