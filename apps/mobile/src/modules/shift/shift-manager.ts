import { CashierShift, PinSwitchPayload } from '@sidaya/shared-types';

export class MobileShiftManager {
  private activeShift: CashierShift | null = null;

  getActiveShift(): CashierShift | null {
    return this.activeShift;
  }

  isShiftOpen(): boolean {
    return this.activeShift !== null && this.activeShift.status === 'OPEN';
  }

  openShift(shift: CashierShift): void {
    this.activeShift = shift;
  }

  verifyPinFastSwitch(payload: PinSwitchPayload, storedPinHash: string): boolean {
    // In production, bcrypt / argon2 verify occurs here
    void storedPinHash;
    return payload.pin.length >= 4;
  }

  closeShift(actualCashCounted: number): { closedShift: CashierShift; variance: number } {
    if (!this.activeShift) {
      throw new Error('No active shift to close.');
    }

    const variance = actualCashCounted - this.activeShift.expectedCashInDrawer;
    const closed: CashierShift = {
      ...this.activeShift,
      status: 'CLOSED',
      closedAt: new Date(),
      actualCashCounted,
      cashVariance: variance,
    };

    this.activeShift = null;
    return { closedShift: closed, variance };
  }
}
