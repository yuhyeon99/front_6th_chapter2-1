import { CartState } from '../types/cart';
import { DISCOUNT_THRESHOLDS, DISCOUNT_RATES, BONUS, PRODUCT_ID_KEYBOARD, PRODUCT_ID_MOUSE, PRODUCT_ID_MONITOR_ARM } from './constants';

function calcItemDiscount(pid: string, qty: number): number {
  const rates: { [key: string]: number } = {
    [PRODUCT_ID_KEYBOARD]: DISCOUNT_RATES.KEYBOARD,
    [PRODUCT_ID_MOUSE]: DISCOUNT_RATES.MOUSE,
    [PRODUCT_ID_MONITOR_ARM]: DISCOUNT_RATES.MONITOR_ARM,
  };
  return qty >= DISCOUNT_THRESHOLDS.ITEM ? rates[pid] || 0 : 0;
}

export function calcCartTotals(st: CartState, date: Date = new Date()) {
  const cart = st.cartItems;

  let subtotal = 0;
  let amount = 0;
  const itemDiscounts: { name: string; discount: number }[] = [];

  const itemCnt = cart.reduce((acc, c) => acc + c.quantity, 0);

  cart.forEach((ci) => {
    const itemPrice = ci.price * ci.quantity;
    subtotal += itemPrice;
    const rate = calcItemDiscount(ci.id, ci.quantity);
    if (rate > 0) itemDiscounts.push({ name: ci.name, discount: rate * 100 });
    amount += itemPrice * (1 - rate);
  });

  let discountRate = subtotal > 0 ? (subtotal - amount) / subtotal : 0;
  if (itemCnt >= DISCOUNT_THRESHOLDS.BULK) {
    amount = subtotal * (1 - DISCOUNT_RATES.BULK);
    discountRate = DISCOUNT_RATES.BULK;
  }

  const isTue = date.getDay() === 2;
  if (isTue && amount > 0) {
    amount *= 1 - DISCOUNT_RATES.TUESDAY;
    discountRate = 1 - (amount / subtotal);
  }

  return {
    itemCnt,
    amount,
    subtotal,
    itemDiscounts,
    discountRate,
    isTue,
    originalTotal: subtotal,
  };
}

export function calcBonusPoints(st: CartState, date: Date = new Date()) {
  const { amount, itemCnt } = calcCartTotals(st, date);
  let base = Math.floor(amount / 1000);
  let pt = base;
  const det: string[] = [];

  if (base > 0) det.push(`기본: ${base}p`);
  if (date.getDay() === 2 && base > 0) {
    pt *= BONUS.TUES_DAY_X2;
    det.push('화요일 2배');
  }

  const ids = st.cartItems.map((c) => c.id);
  const hasK = ids.includes(PRODUCT_ID_KEYBOARD),
    hasM = ids.includes(PRODUCT_ID_MOUSE),
    hasA = ids.includes(PRODUCT_ID_MONITOR_ARM);
  if (hasK && hasM) {
    pt += BONUS.SET_KM;
    det.push('키보드+마우스 세트 +50p');
  }
  if (hasK && hasM && hasA) {
    pt += BONUS.SET_FULL;
    det.push('풀세트 구매 +100p');
  }

  if (itemCnt >= 30) {
    pt += BONUS.QTY30;
    det.push('대량구매(30개+) +100p');
  } else if (itemCnt >= 20) {
    pt += BONUS.QTY20;
    det.push('대량구매(20개+) +50p');
  } else if (itemCnt >= 10) {
    pt += BONUS.QTY10;
    det.push('대량구매(10개+) +20p');
  }

  return { point: pt, details: det };
}
