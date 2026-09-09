import { z } from 'zod';

export const CashBankAccountSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  accountCode: z.string().min(1),
  accountName: z.string().min(1),
  accountType: z.enum(['CASH_DRAWER', 'PETTY_CASH', 'BANK_ACCOUNT', 'PAYMENT_GATEWAY_ESCROW']),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  accountHolderName: z.string().optional(),
  currentBalance: z.number().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.date().or(z.string()).optional(),
  updatedAt: z.date().or(z.string()).optional(),
});

export type CashBankAccount = z.infer<typeof CashBankAccountSchema>;

export const CashBankTransactionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  accountId: z.string().uuid(),
  transactionNumber: z.string().min(1),
  transactionType: z.enum(['INFLOW_SALES', 'INFLOW_PIUTANG', 'OUTFLOW_PURCHASE', 'OUTFLOW_EXPENSE', 'TRANSFER_INTER_ACCOUNT']),
  amount: z.number().positive(),
  balanceAfter: z.number(),
  referenceType: z.string().optional(),
  referenceId: z.string().uuid().optional(),
  description: z.string().min(1),
  operatorUserId: z.string().uuid(),
  createdAt: z.date().or(z.string()).optional(),
});

export type CashBankTransaction = z.infer<typeof CashBankTransactionSchema>;

export const FixedAssetSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  assetCode: z.string().min(1),
  assetName: z.string().min(1),
  category: z.enum(['VEHICLE', 'POS_HARDWARE', 'WAREHOUSE_EQUIPMENT', 'BUILDING_RENOVATION']),
  acquisitionDate: z.date().or(z.string()),
  acquisitionCost: z.number().positive(),
  salvageValue: z.number().nonnegative().default(0),
  usefulLifeMonths: z.number().positive(),
  depreciationMethod: z.enum(['STRAIGHT_LINE', 'DOUBLE_DECLINING']).default('STRAIGHT_LINE'),
  accumulatedDepreciation: z.number().nonnegative().default(0),
  bookValue: z.number().nonnegative(),
  status: z.enum(['ACTIVE', 'DISPOSED', 'WRITTEN_OFF']).default('ACTIVE'),
  createdAt: z.date().or(z.string()).optional(),
  updatedAt: z.date().or(z.string()).optional(),
});

export type FixedAsset = z.infer<typeof FixedAssetSchema>;
