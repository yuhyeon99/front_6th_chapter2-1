import { state } from './state.js';
import * as constants from './constants.js';
import { calcCartTotals, calcBonusPoints } from './calculation.js';
import { $ } from './utils.js';
import { CartItem } from './components/CartItem.js';

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
            row = CartItem(ci);
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