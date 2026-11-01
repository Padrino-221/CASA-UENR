import { Prisma } from '@prisma/client';

/** Strict positive currency input, limited to the database's 12 integral digits. */
export function parseMoney(value: unknown): Prisma.Decimal {
  if ((typeof value !== 'string' && typeof value !== 'number') ||
      !/^\d{1,12}(?:\.\d{1,2})?$/.test(String(value))) {
    throw new Error('Amount must be a positive monetary value with at most two decimal places');
  }
  const amount = new Prisma.Decimal(String(value));
  if (!amount.isFinite() || amount.lte(0)) throw new Error('Amount must be greater than zero');
  return amount;
}

export function validTransactionType(value: unknown): value is 'INCOME' | 'EXPENSE' {
  return value === 'INCOME' || value === 'EXPENSE';
}

/** Convert only at UI/API boundaries; storage and aggregate calculations use Decimal. */
export function moneyNumber(value: Prisma.Decimal | number | null | undefined): number {
  return Number(value ?? 0);
}
