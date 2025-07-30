

import { state } from './state.js';
import * as constants from './constants.js';
import { calcCartTotals, calcBonusPoints } from './calculation.js';
import { $ } from './utils.js';

export const components = {
    createHeader() {
        const d = document.createElement('div');
        d.className = 'mb-8';
        d.innerHTML = `
<h1 class="text-xs font-medium tracking-extra-wide uppercase mb-2">🛒 Hanghae Online Store</h1>
<div class="text-5xl tracking-tight leading-none">Shopping Cart</div>
<p id="item-count" class="text-sm text-gray-500 font-normal mt-3">🛍️ 0 items in cart</p>
`;
        return d;
    },
    createLayout() {
        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden';

        const left = document.createElement('div');
        left.className = 'bg-white border border-gray-200 p-8 overflow-y-auto';
        const right = document.createElement('div');
        right.className = 'bg-black text-white p-8 flex flex-col';
        right.innerHTML = `
<h2 class="text-xs font-medium mb-5 tracking-extra-wide uppercase">Order Summary</h2>
<div class="flex-1 flex flex-col">
  <div id="summary-details" class="space-y-3"></div>
  <div class="mt-auto">
    <div id="discount-info" class="mb-4"></div>
    <div id="cart-total" class="pt-5 border-t border-white/10">
      <div class="flex justify-between items-baseline">
        <span class="text-sm uppercase tracking-wider">Total</span>
        <div class="text-2xl tracking-tight">₩0</div>
      </div>
      <div id="loyalty-points" class="text-xs text-blue-400 mt-2 text-right" style="display:none">적립 포인트: 0p</div>
    </div>
    <div id="tuesday-special" class="mt-4 p-3 bg-white/10 rounded-lg hidden">
      <div class="flex items-center gap-2">
        <span class="text-2xs">🎉</span>
        <span class="text-xs uppercase tracking-wide">Tuesday Special 10% Applied</span>
      </div>
    </div>
  </div>
</div>
<button class="w-full py-4 bg-white text-black text-sm font-normal uppercase tracking-super-wide cursor-pointer mt-6">Proceed to Checkout</button>
<p class="mt-4 text-2xs text-white/60 text-center leading-relaxed">Free shipping on all orders.<br><span id="points-notice">Earn loyalty points with purchase.</span></p>
`;
        return { grid, left, right };
    },
    createSelector() {
        const wrap = document.createElement('div');
        wrap.className = 'mb-6 pb-6 border-b border-gray-200';

        const sel = document.createElement('select');
        sel.id = 'product-select';
        sel.className = 'w-full p-3 border border-gray-300 rounded-lg text-base mb-3';

        const btn = document.createElement('button');
        btn.id = 'add-to-cart';
        btn.className = 'w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800';
        btn.textContent = 'Add to Cart';

        const stockDiv = document.createElement('div');
        stockDiv.id = 'stock-status';
        stockDiv.className = 'text-xs text-red-500 mt-3 whitespace-pre-line';

        wrap.append(sel, btn, stockDiv);
        return { wrap, sel, btn, stockDiv };
    },
    cartItemTemplate(item) {
        const p = state.productList.find(x => x.id === item.id);
        const d = document.createElement('div');
        d.id = item.id;
        d.className = 'grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0';
        d.innerHTML = `
<div class="w-20 h-20 bg-gradient-black relative overflow-hidden">
  <div class="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
</div>
<div>
  <h3 class="text-base font-normal mb-1 tracking-tight">${p.name}</h3>
  <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
  <p class="text-xs text-black mb-3">₩${p.price.toLocaleString()}</p>
  <div class="flex items-center gap-4">
    <button class="quantity-change w-6 h-6 border border-black bg-white text-sm" data-id="${p.id}" data-change="-1">−</button>
    <span class="quantity-number text-sm min-w-[20px] text-center">${item.qty}</span>
    <button class="quantity-change w-6 h-6 border border-black bg-white text-sm" data-id="${p.id}" data-change="1">+</button>
  </div>
</div>
<div class="text-right">
  <div class="text-lg mb-2">₩${(p.price * item.qty).toLocaleString()}</div>
  <a class="remove-item text-2xs text-gray-500 uppercase" data-id="${p.id}">Remove</a>
</div>`;
        return d;
    },
    createHelpModal() {
        const helpBtn = document.createElement('button');
        helpBtn.className = 'fixed top-4 right-4'; helpBtn.textContent = '?';
        const modal = document.createElement('div'); modal.className = 'fixed inset-0 hidden';
        const slide = document.createElement('div'); slide.className = 'fixed right-0 top-0 translate-x-full';
        modal.appendChild(slide);
        helpBtn.onclick = () => { modal.classList.toggle('hidden'); slide.classList.toggle('translate-x-full'); };
        modal.onclick = e => { if (e.target === modal) { modal.classList.add('hidden'); slide.classList.add('translate-x-full'); } };
        return { helpBtn, modal };
    }
};

/* ---------- 제품 옵션 렌더 ---------- */
function renderProductOptions() {
    const sel = $('#product-select');
    const current = state.lastSelectedProduct || sel.value;
    sel.innerHTML = '';
    const totalStock = state.productList.reduce((a, p) => a + p.stock, 0);
    state.productList.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        if (p.stock === 0) {
            opt.disabled = true; opt.textContent = `${p.name} - ${p.price}원 (품절)`;
            opt.className = 'text-gray-400';
        } else {
            opt.textContent = `${p.name} - ${p.price}원`;
        }
        sel.appendChild(opt);
    });
    if ([...sel.options].some(o => o.value === current && !o.disabled)) {
        sel.value = current;
    } else {
        const firstEnabled = [...sel.options].find(o => !o.disabled);
        if (firstEnabled) sel.value = firstEnabled.value;
    }

    sel.style.borderColor = totalStock < constants.LOW_STOCK_BORDER ? 'orange' : '';
}

/* ---------- 렌더 루트 ---------- */
export function render() {
    state.totals = calcCartTotals(state, new Date());
    state.bonus = calcBonusPoints(state, new Date());

    renderProductOptions();

    const cartWrap = $('#cart-items');
    const alive = new Set();

    state.cartItems.forEach(ci => {
        alive.add(ci.id);
        let row = cartWrap.querySelector(`#${ci.id}`);
        if (!row) {
            row = components.cartItemTemplate(ci);
            cartWrap.appendChild(row);
        }
        row.querySelector('.quantity-number').textContent = ci.qty;
        const price = state.productList.find(p => p.id === ci.id).price;
        row.querySelector('.text-lg').textContent = `₩${(price * ci.qty).toLocaleString()}`;
    });
    [...cartWrap.children].forEach(el => {
        if (!alive.has(el.id)) el.remove();
    });

    $('#item-count').textContent = `🛍️ ${state.totals.itemCnt} items in cart`;
    $('#cart-total .text-2xl').textContent = `₩${Math.round(state.totals.amount).toLocaleString()}`;

    const tue = $('#tuesday-special');
    if (state.totals.isTue && state.totals.amount > 0) tue.classList.remove('hidden'); else tue.classList.add('hidden');

    const discDiv = $('#discount-info');
    discDiv.innerHTML = '';
    if (state.totals.discountRate > 0) {
        const saved = state.totals.originalTotal - state.totals.amount;
        discDiv.innerHTML = `
  <div class="bg-green-500/20 rounded-lg p-3">
    <div class="flex justify-between items-center mb-1">
      <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
      <span class="text-sm font-medium text-green-400">${(state.totals.discountRate * 100).toFixed(1)}%</span>
    </div>
    <div class="text-2xs text-gray-300">₩${Math.round(saved).toLocaleString()} 할인되었습니다</div>
  </div>`;
    }

    const lp = $('#loyalty-points');
    if (state.totals.itemCnt === 0) { lp.style.display = 'none'; }
    else {
        lp.style.display = 'block';
        lp.innerHTML = `적립 포인트: <span class="font-bold">${state.bonus.point}p</span><br><span class="text-2xs opacity-70">${state.bonus.details.join(', ')}</span>`;
    }

    let stockMsg = '';
    state.productList.forEach(p => {
        if (p.stock === 0) {
            stockMsg += `${p.name}: 품절\n`;
        } else if (p.stock < constants.STOCK_ALERT) {
            stockMsg += `${p.name}: 재고 부족 (${p.stock}개 남음)\n`;
        }
    });
    $('#stock-status').textContent = stockMsg;
}
