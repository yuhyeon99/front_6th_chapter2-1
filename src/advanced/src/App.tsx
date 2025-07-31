import React, { useEffect } from 'react';
import Header from './components/Header';
import Layout from './components/Layout';
import Selector from './components/Selector';
import HelpModal from './components/HelpModal';
import Cart from './components/Cart';
import { useProductState } from './hooks/useProductState';
import { useCartState } from './hooks/useCartState';
import { calcCartTotals, calcBonusPoints } from './utils/calculation';
import { ERROR_MESSAGES } from './utils/errorMessages';
import { DISCOUNT_RATES } from './utils/constants';

function App() {
  const { productList, setProductList } = useProductState();
  const { cartState, setCartState } = useCartState();

  useEffect(() => {
    const lightningDelay = Math.random() * 10000;
    const initialTimer = setTimeout(() => {
      const intervalId = setInterval(() => {
        setProductList(prevProducts => {
          const availableProducts = prevProducts.filter(p => p.stock > 0 && !p.onSale);
          if (availableProducts.length === 0) return prevProducts;

          const luckyIdx = Math.floor(Math.random() * availableProducts.length);
          const luckyItem = availableProducts[luckyIdx];

          const updatedProducts = prevProducts.map(p => {
            if (p.id === luckyItem.id) {
              const newPrice = Math.round(p.originalVal * (1 - DISCOUNT_RATES.LIGHTNING_SALE));
              // alert(`⚡번개세일! ${p.name}이(가) 20% 할인 중입니다!`);
              return { ...p, val: newPrice, onSale: true };
            }
            return p;
          });
          return updatedProducts;
        });
      }, 30000);

      return () => clearInterval(intervalId);
    }, lightningDelay);

    return () => clearTimeout(initialTimer);
  }, [setProductList]);

  const handleAdd = (productId: string) => {
    const product = productList.find(p => p.id === productId);
    if (!product || product.stock <= 0) {
      alert(ERROR_MESSAGES.OUT_OF_STOCK);
      return;
    }

    setProductList(prev => 
      prev.map(p => 
        p.id === productId ? { ...p, stock: p.stock - 1 } : p
      )
    );

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
    const button = target.closest('.quantity-change, .remove-item');
    if (!button) return;

    const productId = button.getAttribute('data-product-id');
    if (!productId) return;

    if (button.classList.contains('remove-item')) {
      setCartState(prev => {
        const itemToRemove = prev.cartItems.find(item => item.id === productId);
        if (!itemToRemove) return prev;

        setProductList(prevProducts => 
          prevProducts.map(p => 
            p.id === productId ? { ...p, stock: p.stock + itemToRemove.quantity } : p
          )
        );

        const newCartItems = prev.cartItems.filter(item => item.id !== productId);
        return { ...prev, cartItems: newCartItems };
      });
      return;
    }

    const change = parseInt(button.getAttribute('data-change') || '0', 10);
    const product = productList.find(p => p.id === productId);
    if (!product) return;

    if (change > 0 && product.stock < 1) {
      alert(ERROR_MESSAGES.OUT_OF_STOCK);
      return;
    }

    setCartState(prev => {
      const newCartItems = prev.cartItems.map(item => {
        if (item.id === productId) {
          const newQuantity = item.quantity + change;
          if (newQuantity <= 0) {
            setProductList(prevProducts => 
              prevProducts.map(p => 
                p.id === productId ? { ...p, stock: p.stock + item.quantity } : p
              )
            );
            return null;
          }
          setProductList(prevProducts => 
            prevProducts.map(p => 
              p.id === productId ? { ...p, stock: p.stock - change } : p
            )
          );
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as any;

      return { ...prev, cartItems: newCartItems };
    });
  };

  const totals = calcCartTotals(cartState.cartItems, productList, new Date());
  const bonus = calcBonusPoints(cartState.cartItems, productList, new Date());

  const LeftContent = (
    <>
      <Selector 
        productList={productList} 
        lastSelectedProduct={cartState.lastSelectedProduct} 
        onAdd={handleAdd} 
      />
      <Cart 
        cartItems={cartState.cartItems} 
        productList={productList}
        onCartClick={handleCartClick} 
      />
    </>
  );

  const RightContent = (
    <>
      <h2 className="text-xs font-medium mb-5 tracking-extra-wide uppercase">Order Summary</h2>
      <div className="flex-1 flex flex-col">
        <div id="summary-details" className="space-y-3">
          {/* main.original.js의 summaryDetails.innerHTML 부분 */}
          {cartState.cartItems.map(item => {
            const product = productList.find(p => p.id === item.id);
            if (!product) return null;
            return (
              <div key={item.id} className="flex justify-between text-xs tracking-wide text-gray-400">
                <span>{product.name} x {item.quantity}</span>
                <span>₩{(product.val * item.quantity).toLocaleString()}</span>
              </div>
            );
          })}
          {cartState.cartItems.length > 0 && (
            <>
              <div className="border-t border-white/10 my-3"></div>
              <div className="flex justify-between text-sm tracking-wide">
                <span>Subtotal</span>
                <span>₩{totals.subtotal.toLocaleString()}</span>
              </div>
            </>
          )}
          {totals.itemCnt >= 30 && (
            <div className="flex justify-between text-sm tracking-wide text-green-400">
              <span className="text-xs">🎉 대량구매 할인 (30개 이상)</span>
              <span className="text-xs">-25%</span>
            </div>
          )}
          {totals.itemDiscounts.length > 0 && totals.itemCnt < 30 && (
            totals.itemDiscounts.map((disc, index) => (
              <div key={index} className="flex justify-between text-sm tracking-wide text-green-400">
                <span className="text-xs">{disc.name} (10개↑)</span>
                <span className="text-xs">-{disc.discount}%</span>
              </div>
            ))
          )}
          {totals.isTue && totals.amount > 0 && (
            <div className="flex justify-between text-sm tracking-wide text-purple-400">
              <span className="text-xs">🌟 화요일 추가 할인</span>
              <span className="text-xs">-10%</span>
            </div>
          )}
          <div className="flex justify-between text-sm tracking-wide text-gray-400">
            <span>Shipping</span>
            <span>Free</span>
          </div>
        </div>
        <div className="mt-auto">
          <div id="discount-info" className="mb-4">
            {totals.discountRate > 0 && totals.amount > 0 && (
              <div className="bg-green-500/20 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
                  <span className="text-sm font-medium text-green-400">{(totals.discountRate * 100).toFixed(1)}%</span>
                </div>
                <div className="text-2xs text-gray-300">₩{Math.round(totals.originalTotal - totals.amount).toLocaleString()} 할인되었습니다</div>
              </div>
            )}
          </div>
          <div id="cart-total" className="pt-5 border-t border-white/10">
            <div className="flex justify-between items-baseline">
              <span className="text-sm uppercase tracking-wider">Total</span>
              <div className="text-2xl tracking-tight">₩{Math.round(totals.amount).toLocaleString()}</div>
            </div>
            <div id="loyalty-points" className="text-xs text-blue-400 mt-2 text-right">
              {bonus.point > 0 ? (
                <>
                  적립 포인트: <span className="font-bold">{bonus.point}p</span>
                  <br />
                  <span className="text-2xs opacity-70">{bonus.details.join(', ')}</span>
                </>
              ) : (
                '적립 포인트: 0p'
              )}
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
      <button className="w-full py-4 bg-white text-black text-sm font-normal uppercase tracking-super-wide cursor-pointer mt-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30">
        Proceed to Checkout
      </button>
      <p className="mt-4 text-2xs text-white/60 text-center leading-relaxed">
        Free shipping on all orders.<br />
        <span id="points-notice">Earn loyalty points with purchase.</span>
      </p>
    </>
  );

  return (
    <>
      <Header itemCount={totals.itemCnt} />
      <Layout leftContent={LeftContent} rightContent={RightContent} />
      <HelpModal />
    </>
  );
}

export default App;
