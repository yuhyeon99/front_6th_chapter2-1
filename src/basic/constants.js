
export const PRODUCT_ID_KEYBOARD = 'p1';
export const PRODUCT_ID_MOUSE = 'p2';
export const PRODUCT_ID_MONITOR_ARM = 'p3';
export const PRODUCT_ID_POUCH = 'p4';
export const PRODUCT_ID_SPEAKER = 'p5';

export const DISCOUNT_THRESHOLDS = { BULK: 30, ITEM: 10 };
export const DISCOUNT_RATES = {
    BULK: .25, TUESDAY: .10,
    [PRODUCT_ID_KEYBOARD]: .10,
    [PRODUCT_ID_MOUSE]: .15,
    [PRODUCT_ID_MONITOR_ARM]: .20,
    [PRODUCT_ID_SPEAKER]: .25,
};
export const BONUS = {
    TUES_DAY_X2: 2,
    SET_KM: 50,
    SET_FULL: 100,
    QTY10: 20, QTY20: 50, QTY30: 100,
};
export const STOCK_ALERT = 5, LOW_STOCK_BORDER = 50;
export const ERROR_MESSAGES = {
    OUT_OF_STOCK: '재고가 부족합니다.',
    INVALID_QUANTITY: '유효하지 않은 수량입니다.',
};
