import { state } from './state.js';
import * as constants from './constants.js';
import { $ } from './utils.js';
import { onAdd, onCartClick } from './handlers.js';
import { createHeader } from './components/Header.js';
import { createLayout } from './components/Layout.js';
import { createSelector } from './components/Selector.js';
import { createHelpModal } from './components/HelpModal.js';
import { render } from './render.js';

function createShoppingCart() {

    /* ---------- 부트스트랩 ---------- */
    function init() {
        const root = document.getElementById('app');
        root.innerHTML = '';
        root.appendChild(createHeader());

        const { grid, left, right } = createLayout();
        root.appendChild(grid); grid.append(left, right);

        const { wrap, sel, btn, stockDiv } = createSelector();
        left.appendChild(wrap);

        const cartDiv = document.createElement('div');
        cartDiv.id = 'cart-items';
        left.appendChild(cartDiv);

        btn.addEventListener('click', onAdd);
        cartDiv.addEventListener('click', onCartClick);

        const { helpBtn, modal } = createHelpModal();
        root.append(helpBtn, modal);

        render();
    }

    return { init };
}

createShoppingCart().init();
