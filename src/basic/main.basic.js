function createShoppingCart() {
    /* ---------- 상수 ---------- */
    const PRODUCT_ID_KEYBOARD = 'p1';
    const PRODUCT_ID_MOUSE = 'p2';
    const PRODUCT_ID_MONITOR_ARM = 'p3';
    const PRODUCT_ID_POUCH = 'p4';
    const PRODUCT_ID_SPEAKER = 'p5';

    const DISCOUNT_THRESHOLDS = { BULK: 30, ITEM: 10 };
    const DISCOUNT_RATES = {
        BULK: .25, TUESDAY: .10,
        [PRODUCT_ID_KEYBOARD]: .10,
        [PRODUCT_ID_MOUSE]: .15,
        [PRODUCT_ID_MONITOR_ARM]: .20,
        [PRODUCT_ID_SPEAKER]: .25,
    };
    const BONUS = {
        TUES_DAY_X2: 2,
        SET_KM: 50,
        SET_FULL: 100,
        QTY10: 20, QTY20: 50, QTY30: 100,
    };
    const STOCK_ALERT = 5, LOW_STOCK_BORDER = 50;
    const ERROR_MESSAGES = {
        OUT_OF_STOCK: '재고가 부족합니다.',
        INVALID_QUANTITY: '유효하지 않은 수량입니다.',
    };

    /* ---------- 상태 ---------- */
    const state = {
        productList: [
            { id: PRODUCT_ID_KEYBOARD, name: '버그 없애는 키보드', price: 10000, stock: 50, originalPrice: 10000, onSale: false, suggest: false },
            { id: PRODUCT_ID_MOUSE, name: '생산성 폭발 마우스', price: 20000, stock: 30, originalPrice: 20000, onSale: false, suggest: false },
            { id: PRODUCT_ID_MONITOR_ARM, name: '거북목 탈출 모니터암', price: 30000, stock: 20, originalPrice: 30000, onSale: false, suggest: false },
            { id: PRODUCT_ID_POUCH, name: '에러 방지 노트북 파우치', price: 15000, stock: 0, originalPrice: 15000, onSale: false, suggest: false },
            { id: PRODUCT_ID_SPEAKER, name: '코딩할 때 듣는 Lo-Fi 스피커', price: 25000, stock: 10, originalPrice: 25000, onSale: false, suggest: false },
        ],
        cartItems: [],
        lastSelectedProduct: null,
        totals: { itemCnt: 0, amount: 0, discountRate: 0 },
        bonus: { point: 0, details: [] },
    };

    /* ---------- 순수 계산 함수 ---------- */
    function calcItemDiscount(pid, qty) {
        return qty >= DISCOUNT_THRESHOLDS.ITEM ? (DISCOUNT_RATES[pid] || 0) : 0;
    }

    function calcCartTotals(st, date = new Date()) {
        const cart = st.cartItems;
        const plist = st.productList;

        let subtotal = 0;
        let amount = 0;
        const itemDiscounts = [];

        const itemCnt = cart.reduce((acc, c) => (acc + c.qty), 0);

        cart.forEach(ci => {
            const p = plist.find(x => x.id === ci.id);
            const itemPrice = p.price * ci.qty;
            subtotal += itemPrice;
            const rate = calcItemDiscount(ci.id, ci.qty);
            if (rate > 0) itemDiscounts.push({ name: p.name, discount: rate * 100 });
            amount += itemPrice * (1 - rate);
        });

        let discountRate = subtotal > 0 ? (subtotal - amount) / subtotal : 0;
        if (itemCnt >= DISCOUNT_THRESHOLDS.BULK) {
            amount = subtotal * (1 - DISCOUNT_RATES.BULK);
            discountRate = DISCOUNT_RATES.BULK;
        }

        const isTue = date.getDay() === 2;
        if (isTue && amount > 0) {
            amount *= (1 - DISCOUNT_RATES.TUESDAY);
            discountRate = 1 - amount / subtotal;
        }

        return { itemCnt, amount, subtotal, itemDiscounts, discountRate, isTue, originalTotal: subtotal };
    }

    function calcBonusPoints(st, date = new Date()) {
        const { amount } = st.totals;
        let base = Math.floor(amount / 1000);
        let pt = base;
        const det = [];

        if (base > 0) det.push(`기본: ${base}p`);
        if (date.getDay() === 2 && base > 0) { pt *= BONUS.TUES_DAY_X2; det.push('화요일 2배'); }

        const ids = st.cartItems.map(c => c.id);
        const hasK = ids.includes(PRODUCT_ID_KEYBOARD), hasM = ids.includes(PRODUCT_ID_MOUSE), hasA = ids.includes(PRODUCT_ID_MONITOR_ARM);
        if (hasK && hasM) { pt += BONUS.SET_KM; det.push('키보드+마우스 세트 +50p'); }
        if (hasK && hasM && hasA) { pt += BONUS.SET_FULL; det.push('풀세트 구매 +100p'); }

        const qty = st.totals.itemCnt;
        if (qty >= 30) { pt += BONUS.QTY30; det.push('대량구매(30개+) +100p'); }
        else if (qty >= 20) { pt += BONUS.QTY20; det.push('대량구매(20개+) +50p'); }
        else if (qty >= 10) { pt += BONUS.QTY10; det.push('대량구매(10개+) +20p'); }

        return { point: pt, details: det };
    }

    /* ---------- DOM 생성 유틸 ---------- */
    const $ = sel => document.querySelector(sel);

    const components = {
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

        sel.style.borderColor = totalStock < LOW_STOCK_BORDER ? 'orange' : '';
    }

    /* ---------- Cart DOM 한 개 ---------- */
    function cartItemTemplate(item) {
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
    }

    /* ---------- 렌더 루트 ---------- */
    function render() {
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
            } else if (p.stock < STOCK_ALERT) {
                stockMsg += `${p.name}: 재고 부족 (${p.stock}개 남음)\n`;
            }
        });
        $('#stock-status').textContent = stockMsg;
    }

    /* ---------- 이벤트 핸들러 ---------- */
    function onAdd() {
        const pid = $('#product-select').value;
        const prod = state.productList.find(p => p.id === pid);
        if (!prod || prod.stock <= 0) { alert(ERROR_MESSAGES.OUT_OF_STOCK); return; }

        const existing = state.cartItems.find(c => c.id === pid);
        if (existing) { existing.qty++; }
        else { state.cartItems.push({ id: pid, qty: 1 }); }
        prod.stock--;
        state.lastSelectedProduct = pid;
        render();
    }

    function onCartClick(e) {
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
                alert(ERROR_MESSAGES.INVALID_QUANTITY);
                return;
            }
            const newQty = ci.qty + delta;

            if (delta > 0 && prod.stock < 1) {
                alert(ERROR_MESSAGES.OUT_OF_STOCK);
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
