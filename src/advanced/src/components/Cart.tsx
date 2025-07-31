import React from 'react';
import { CartItem as CartItemType } from '../types/cart';

interface CartProps {
  cartItems: CartItemType[];
  totals: {
    itemCnt: number;
    amount: number;
    discountRate: number;
    originalTotal: number;
    isTue: boolean;
  };
  bonus: {
    point: number;
    details: string[];
  };
  onCartClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const Cart = ({ cartItems, totals, bonus, onCartClick }: CartProps) => {
  return (
    <>
      <div id="cart-items" onClick={onCartClick}>
        {cartItems.map(item => (
          <div key={item.id} id={item.id} className="flex justify-between items-center bg-white p-4 rounded-lg shadow mb-3">
            <div className="flex items-center">
              <span className="text-lg font-semibold">{item.name}</span>
              <span className="text-gray-500 ml-4">x{item.quantity}</span>
            </div>
            <div className="text-lg font-bold">₩{(item.price * item.quantity).toLocaleString()}</div>
            <button className="quantity-change bg-red-500 text-white px-2 py-1 rounded" data-product-id={item.id} data-change="-1">-</button>
            <button className="quantity-change bg-green-500 text-white px-2 py-1 rounded" data-product-id={item.id} data-change="1">+</button>
          </div>
        ))}
      </div>
      <div id="summary-details" className="space-y-3">
        <div className="flex justify-between">
          <span>총 상품 수</span>
          <span>{totals.itemCnt}개</span>
        </div>
        <div className="flex justify-between">
          <span>총 주문 금액</span>
          <span>₩{Math.round(totals.amount).toLocaleString()}</span>
        </div>
        {totals.discountRate > 0 && (
          <div className="bg-green-500/20 rounded-lg p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
              <span className="text-sm font-medium text-green-400">{(totals.discountRate * 100).toFixed(1)}%</span>
            </div>
            <div className="text-2xs text-gray-300">₩{Math.round(totals.originalTotal - totals.amount).toLocaleString()} 할인되었습니다</div>
          </div>
        )}
      </div>
      <div id="loyalty-points" className="text-xs text-blue-400 mt-2 text-right">
        적립 포인트: <span className="font-bold">{bonus.point}p</span>
        <br />
        <span className="text-2xs opacity-70">{bonus.details.join(', ')}</span>
      </div>
      <div id="tuesday-special" className={`mt-4 p-3 bg-white/10 rounded-lg ${totals.isTue && totals.amount > 0 ? '' : 'hidden'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xs">🎉</span>
          <span className="text-xs uppercase tracking-wide">Tuesday Special 10% Applied</span>
        </div>
      </div>
    </>
  );
};

export default Cart;