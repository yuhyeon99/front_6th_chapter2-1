import { state } from './state.js';
import * as constants from './constants.js';
import { components, render } from './dom.js';
import { $ } from './utils.js';
import { onAdd, onCartClick } from './handlers.js';

function createShoppingCart() {

    /* ---------- 부트스트랩 ---------- */
    function init() {
        const root = document.getElementById('app');
        root.innerHTML = '';
        root.appendChild(components.createHeader());

        const { grid, left, right } = components.createLayout();
        root.appendChild(grid); grid.append(left, right);

        const { wrap, sel, btn, stockDiv } = components.createSelector();
        left.appendChild(wrap);

        const cartDiv = document.createElement('div');
        cartDiv.id = 'cart-items';
        left.appendChild(cartDiv);

        btn.addEventListener('click', onAdd);
        cartDiv.addEventListener('click', onCartClick);

        const { helpBtn, modal } = components.createHelpModal();
        root.append(helpBtn, modal);

        render();
    }

    return { init };
}

createShoppingCart().init();
