import React from 'react';
import Header from './components/Header';
import Layout from './components/Layout';
import Selector from './components/Selector';
import HelpModal from './components/HelpModal';
import Cart from './components/Cart';
import { useProductState } from './hooks/useProductState';
import { useCartState } from './hooks/useCartState';
import { usePointState } from './hooks/usePointState';
import { calcCartTotals, calcBonusPoints } from './utils/calculation';

function App() {
  const { productList, setProductList } = useProductState();
  const { cartState, setCartState } = useCartState();
  const { pointState, setPointState } = usePointState();

  const handleAdd = (productId: string) => {
    const product = productList.find(p => p.id === productId);
    if (!product) return;

    setCartState(prev => {
      const existingItem = prev.cartItems.find(item => item.id === productId);
      if (existingItem) {
        const newCartItems = prev.cartItems.map(item =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
        return { ...prev, cartItems: newCartItems, lastSelectedProduct: product };
      } else {
        const newCartItems = [...prev.cartItems, { ...product, quantity: 1 }];
        return { ...prev, cartItems: newCartItems, lastSelectedProduct: product };
      }
    });
  };

  const handleCartClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const target = e.target as HTMLElement;
    const button = target.closest('.quantity-change');
    if (!button) return;

    const productId = button.getAttribute('data-product-id');
    const change = parseInt(button.getAttribute('data-change') || '0', 10);

    setCartState(prev => {
      const newCartItems = prev.cartItems.map(item => {
        if (item.id === productId) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      }).filter(Boolean) as any;

      return { ...prev, cartItems: newCartItems };
    });
  };

  const totals = calcCartTotals(cartState, new Date());
  const bonus = calcBonusPoints(cartState, new Date());

  const LeftContent = (
    <>
      <Header itemCount={totals.itemCnt} />
      <Selector 
        productList={productList} 
        lastSelectedProduct={cartState.lastSelectedProduct} 
        onAdd={handleAdd} 
      />
      <Cart 
        cartItems={cartState.cartItems} 
        totals={totals} 
        bonus={bonus} 
        onCartClick={handleCartClick} 
      />
    </>
  );

  const RightContent = (
    <>
      <h2 className="text-xs font-medium mb-5 tracking-extra-wide uppercase">Order Summary</h2>
      <div className="flex-1 flex flex-col">
        <div id="summary-details" className="space-y-3"></div>
        <div className="mt-auto">
          <div id="discount-info" className="mb-4"></div>
          <div id="cart-total" className="pt-5 border-t border-white/10">
            <div className="flex justify-between items-baseline">
              <span className="text-sm uppercase tracking-wider">Total</span>
              <div className="text-2xl tracking-tight">₩{Math.round(totals.amount).toLocaleString()}</div>
            </div>
            <div id="loyalty-points" className="text-xs text-blue-400 mt-2 text-right">
              적립 포인트: <span className="font-bold">{bonus.point}p</span>
            </div>
          </div>
          <div id="tuesday-special" className={`mt-4 p-3 bg-white/10 rounded-lg ${totals.isTue && totals.amount > 0 ? '' : 'hidden'}`}>
            <div className="flex items-center gap-2">
              <span className="text-2xs">🎉</span>
              <span className="text-xs uppercase tracking-wide">Tuesday Special 10% Applied</span>
            </div>
          </div>
        </div>
      </div>
      <button className="w-full py-4 bg-white text-black text-sm font-normal uppercase tracking-super-wide cursor-pointer mt-6">Proceed to Checkout</button>
      <p className="mt-4 text-2xs text-white/60 text-center leading-relaxed">Free shipping on all orders.<br /><span id="points-notice">Earn loyalty points with purchase.</span></p>
    </>
  );

  return (
    <>
      <Layout leftContent={LeftContent} rightContent={RightContent} />
      <HelpModal />
    </>
  );
}

export default App;
