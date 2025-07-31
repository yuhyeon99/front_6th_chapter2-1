import React from 'react';
import { CartItem as CartItemType } from '../types/cart';
import { Product } from '../types/product';
import CartItem from './CartItem';

interface CartProps {
  cartItems: CartItemType[];
  productList: Product[];
  onCartClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const Cart = ({ cartItems, productList, onCartClick }: CartProps) => {
  return (
    <div id="cart-items" onClick={onCartClick}>
      {cartItems.map(item => {
        const product = productList.find(p => p.id === item.id);
        if (!product) return null;
        return <CartItem key={item.id} item={item} product={product} />;
      })}
    </div>
  );
};

export default Cart;