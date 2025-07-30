import { state } from './state.js';
import * as constants from './constants.js';
import { $ } from './utils.js';
import { onAdd, onCartClick } from './handlers.js';
import { Header } from './components/Header.js';
import { Layout } from './components/Layout.js';
import { Selector } from './components/Selector.js';
import { HelpModal } from './components/HelpModal.js';
import { render } from './render.js';

function createShoppingCart() {

    /* ---------- 부트스트랩 ---------- */
    function init() {
        const root = document.getElementById('app');
        root.innerHTML = '';
        root.appendChild(Header());

        const { grid, left, right } = Layout();
        root.appendChild(grid); grid.append(left, right);

        const { wrap, sel, btn, stockDiv } = Selector();
        left.appendChild(wrap);

        const cartDiv = document.createElement('div');
        cartDiv.id = 'cart-items';
        left.appendChild(cartDiv);

        btn.addEventListener('click', onAdd);
        cartDiv.addEventListener('click', onCartClick);

        const { helpBtn, modal } = HelpModal();
        root.append(helpBtn, modal);

        render();
    }

    return { init };
}

createShoppingCart().init();
