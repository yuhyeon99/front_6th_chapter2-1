import { state } from './state.js';
import * as constants from './constants.js';
import { render } from './render.js';
import { $ } from './utils.js';

export function onAdd() {
    const pid = $('#product-select').value;
    const prod = state.productList.find(p => p.id === pid);
    if (!prod || prod.stock <= 0) { alert(constants.ERROR_MESSAGES.OUT_OF_STOCK); return; }

    const existing = state.cartItems.find(c => c.id === pid);
    if (existing) { existing.qty++; }
    else { state.cartItems.push({ id: pid, qty: 1 }); }
    prod.stock--;
    state.lastSelectedProduct = pid;
    render();
}

export function onCartClick(e) {
    const btn = e.target.closest('.quantity-change, .remove-item');
    if (!btn) return;

    const id = btn.dataset.id;
    const prod = state.productList.find(p => p.id === id);
    const idx = state.cartItems.findIndex(c => c.id === id);
    if (idx === -1 || !prod) return;
    const ci = state.cartItems[idx];

    if (btn.classList.contains('quantity-change')) {
        const delta = parseInt(btn.dataset.change, 10);
        if (isNaN(delta)) {
            alert(constants.ERROR_MESSAGES.INVALID_QUANTITY);
            return;
        }
        const newQty = ci.qty + delta;

        if (delta > 0 && prod.stock < 1) {
            alert(constants.ERROR_MESSAGES.OUT_OF_STOCK);
            return;
        }

        if (newQty <= 0) {
            prod.stock += ci.qty;
            state.cartItems = state.cartItems.filter(c => c.id !== id);
        } else {
            prod.stock -= delta;
            state.cartItems[idx] = { ...ci, qty: newQty };
        }
    } else if (btn.classList.contains('remove-item')) {
        prod.stock += ci.qty;
        state.cartItems = state.cartItems.filter(c => c.id !== id);
    }
    render();
}