import {
  OrderLineItem,
  CompoundDiscount,
  calculateCompoundDiscount,
  ProductUnitConversion,
} from '@sidaya/shared-types';

export type WholesalePricingTier =
  | 'ECERAN'
  | 'GROSIR_1'
  | 'GROSIR_2'
  | 'VIP_MEMBER'
  | 'SALESMAN';

export interface CustomerCartAttachment {
  id: string;
  name: string;
  phone: string;
  creditLimit: number;
  currentKasbon: number;
}

export interface CartItem extends OrderLineItem {
  baseRetailPrice: number;
  availableConversions?: ProductUnitConversion[] | undefined;
}

export interface POSCartState {
  items: CartItem[];
  selectedTier: WholesalePricingTier;
  customer?: CustomerCartAttachment | undefined;
  compoundFormula?: string | undefined;
  orderDiscount?: CompoundDiscount | undefined;
  subtotal: number;
  discountTotal: number;
  grandTotal: number;
}

export const TIER_DEFAULT_MULTIPLIERS: Record<WholesalePricingTier, number> = {
  ECERAN: 1.0,
  GROSIR_1: 0.95, // 5% bulk rebate
  GROSIR_2: 0.92, // 8% bulk rebate
  VIP_MEMBER: 0.88, // 12% preferred store partner
  SALESMAN: 0.85, // 15% distributor direct
};

/**
 * Parses user input string like "5%+2%+5000" into a structured CompoundDiscount
 */
export function parseCompoundDiscountFormula(formula: string): CompoundDiscount | undefined {
  if (!formula || typeof formula !== 'string') return undefined;

  const parts = formula.split('+').map((s) => s.trim()).filter(Boolean);
  let p1 = 0;
  let p2 = 0;
  let fixed = 0;

  for (const part of parts) {
    if (part.endsWith('%')) {
      const val = parseFloat(part.slice(0, -1));
      if (!isNaN(val)) {
        if (p1 === 0) p1 = val;
        else if (p2 === 0) p2 = val;
      }
    } else {
      const val = parseFloat(part.replace(/[^0-9.]/g, ''));
      if (!isNaN(val)) {
        fixed += val;
      }
    }
  }

  return {
    percent1: p1,
    percent2: p2,
    fixedAmount: fixed,
  };
}

export class POSCartManager {
  private state: POSCartState = {
    items: [],
    selectedTier: 'ECERAN',
    subtotal: 0,
    discountTotal: 0,
    grandTotal: 0,
  };

  getState(): POSCartState {
    return { ...this.state };
  }

  setTier(tier: WholesalePricingTier): void {
    this.state.selectedTier = tier;
    const multiplier = TIER_DEFAULT_MULTIPLIERS[tier];

    // Recalculate each item's unit price based on tier multiplier
    for (const item of this.state.items) {
      item.unitPrice = Math.round(item.baseRetailPrice * item.conversionFactor * multiplier);
      item.subtotal = item.quantity * item.unitPrice;
    }
    this.recalculate();
  }

  setCustomer(customer?: CustomerCartAttachment | undefined): void {
    this.state.customer = customer;
  }

  addItem(item: Omit<CartItem, 'subtotal'>): void {
    const existing = this.state.items.find(
      (i) => i.productId === item.productId && i.selectedUnit === item.selectedUnit,
    );

    if (existing) {
      existing.quantity += item.quantity;
      existing.subtotal = existing.quantity * existing.unitPrice;
    } else {
      const multiplier = TIER_DEFAULT_MULTIPLIERS[this.state.selectedTier];
      const unitPrice = Math.round(item.baseRetailPrice * item.conversionFactor * multiplier);
      const subtotal = item.quantity * unitPrice;

      this.state.items.push({
        ...item,
        unitPrice,
        subtotal,
      });
    }

    this.recalculate();
  }

  adjustQuantity(index: number, delta: number): void {
    const item = this.state.items[index];
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.state.items.splice(index, 1);
    } else {
      item.subtotal = item.quantity * item.unitPrice;
    }

    this.recalculate();
  }

  updateUnit(index: number, conversion: ProductUnitConversion): void {
    const item = this.state.items[index];
    if (!item) return;

    const multiplier = TIER_DEFAULT_MULTIPLIERS[this.state.selectedTier];
    item.selectedUnit = conversion.unitName;
    item.conversionFactor = conversion.conversionFactor;
    item.unitPrice = Math.round(item.baseRetailPrice * conversion.conversionFactor * multiplier);
    item.subtotal = item.quantity * item.unitPrice;

    this.recalculate();
  }

  setFormulaDiscount(formula: string): void {
    this.state.compoundFormula = formula;
    this.state.orderDiscount = parseCompoundDiscountFormula(formula);
    this.recalculate();
  }

  clear(): void {
    this.state = {
      items: [],
      selectedTier: 'ECERAN',
      customer: undefined,
      compoundFormula: undefined,
      orderDiscount: undefined,
      subtotal: 0,
      discountTotal: 0,
      grandTotal: 0,
    };
  }

  private recalculate(): void {
    let subtotal = 0;
    for (const item of this.state.items) {
      subtotal += item.quantity * item.unitPrice;
    }

    let discountTotal = 0;
    if (this.state.orderDiscount) {
      const breakdown = calculateCompoundDiscount(subtotal, this.state.orderDiscount);
      discountTotal = breakdown.totalDiscount;
    }

    this.state.subtotal = subtotal;
    this.state.discountTotal = discountTotal;
    this.state.grandTotal = Math.max(0, subtotal - discountTotal);
  }
}
