import { CashierShift } from '@sidaya/shared-types';

export interface OpenShiftDTO {
  storeId: string;
  stationId: string;
  openingCashFloat: number;
  cashierName: string;
}

export interface CloseShiftDTO {
  actualCashCounted: number;
}

export interface ShiftCashMovementDTO {
  amount: number;
  reason: string;
  type: 'DROP' | 'FLOAT_ADJUSTMENT';
}

export interface ShiftReportSummary {
  reportType: 'X_REPORT' | 'Z_REPORT';
  shiftId: string;
  cashierName: string;
  openedAt: Date | string;
  closedAt?: Date | string | undefined;
  openingCashFloat: number;
  totalCashSales: number;
  totalPaylinkSales: number;
  totalCashDrops: number;
  expectedCashInDrawer: number;
  actualCashCounted?: number | undefined;
  cashVariance?: number | undefined;
  zReportNumber?: string | undefined;
}

export class ShiftDomainService {
  /**
   * Opens a new cashier drawer shift
   */
  openShift(tenantId: string, cashierUserId: string, dto: OpenShiftDTO): CashierShift {
    const shiftId = `00000000-0000-0000-0002-${Math.floor(Date.now() / 1000).toString().padStart(12, '0')}`;
    const now = new Date();

    return {
      id: shiftId,
      tenantId,
      storeId: dto.storeId,
      stationId: dto.stationId,
      userId: cashierUserId,
      cashierName: dto.cashierName,
      openedAt: now,
      openingCashFloat: dto.openingCashFloat,
      totalCashSales: 0,
      totalPaylinkSales: 0,
      totalCashDrops: 0,
      expectedCashInDrawer: dto.openingCashFloat,
      status: 'OPEN',
    };
  }

  /**
   * Records cash drop or float addition during an active shift
   */
  recordMovement(
    shift: CashierShift,
    dto: ShiftCashMovementDTO,
  ): CashierShift {
    if (shift.status !== 'OPEN') {
      throw new Error('Cannot record cash movement on a closed shift.');
    }

    const delta = dto.type === 'FLOAT_ADJUSTMENT' ? dto.amount : -dto.amount;
    const newDropsTotal = dto.type === 'DROP' ? shift.totalCashDrops + dto.amount : shift.totalCashDrops;

    return {
      ...shift,
      totalCashDrops: newDropsTotal,
      expectedCashInDrawer: shift.expectedCashInDrawer + delta,
    };
  }

  /**
   * Closes the cashier shift, reconciles physical cash, and generates the Z-Report
   */
  closeShift(shift: CashierShift, dto: CloseShiftDTO): { closedShift: CashierShift; zReport: ShiftReportSummary } {
    if (shift.status !== 'OPEN') {
      throw new Error('Shift is already closed.');
    }

    const closedAt = new Date();
    const cashVariance = dto.actualCashCounted - shift.expectedCashInDrawer;
    const zReportNumber = `ZR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const closedShift: CashierShift = {
      ...shift,
      closedAt,
      actualCashCounted: dto.actualCashCounted,
      cashVariance,
      status: 'CLOSED',
      zReportNumber,
    };

    const zReport: ShiftReportSummary = {
      reportType: 'Z_REPORT',
      shiftId: closedShift.id,
      cashierName: closedShift.cashierName,
      openedAt: closedShift.openedAt,
      closedAt,
      openingCashFloat: closedShift.openingCashFloat,
      totalCashSales: closedShift.totalCashSales,
      totalPaylinkSales: closedShift.totalPaylinkSales,
      totalCashDrops: closedShift.totalCashDrops,
      expectedCashInDrawer: closedShift.expectedCashInDrawer,
      actualCashCounted: dto.actualCashCounted,
      cashVariance,
      zReportNumber,
    };

    return { closedShift, zReport };
  }

  /**
   * Generates a non-destructive mid-shift X-Report snapshot
   */
  generateXReport(shift: CashierShift): ShiftReportSummary {
    return {
      reportType: 'X_REPORT',
      shiftId: shift.id,
      cashierName: shift.cashierName,
      openedAt: shift.openedAt,
      openingCashFloat: shift.openingCashFloat,
      totalCashSales: shift.totalCashSales,
      totalPaylinkSales: shift.totalPaylinkSales,
      totalCashDrops: shift.totalCashDrops,
      expectedCashInDrawer: shift.expectedCashInDrawer,
      actualCashCounted: shift.actualCashCounted,
      cashVariance: shift.cashVariance,
    };
  }
}
