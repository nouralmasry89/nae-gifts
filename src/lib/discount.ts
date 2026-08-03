export const DISCOUNT_RATE = 0.10;

export const applyDiscount = (amount: number, active: boolean): number =>
  active && amount > 0 ? Math.round(amount * (1 - DISCOUNT_RATE)) : amount;
