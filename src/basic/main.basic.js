// =================================================================================================
// 전역 변수 및 상수 선언
// =================================================================================================

let productList;
let bonusPoints = 0;
let stockInfoElement;
let totalItemCount;
let lastSelectedProduct;
let productSelectElement;
let addToCartButton;
let totalAmount = 0;
let cartDisplayElement;
let totalAmountElement;

const PRODUCT_ID_KEYBOARD = 'p1';
const PRODUCT_ID_MOUSE = 'p2';
const PRODUCT_ID_MONITOR_ARM = 'p3';
const PRODUCT_ID_POUCH = 'p4';
const PRODUCT_ID_SPEAKER = `p5`;

const DISCOUNT_THRESHOLDS = {
  BULK_PURCHASE_MIN_QUANTITY: 30,
  ITEM_SPECIFIC_MIN_QUANTITY: 10,
};

const DISCOUNT_RATES = {
  BULK_PURCHASE: 0.25,
  TUESDAY_SPECIAL: 0.1,
  LIGHTNING_SALE: 0.2,
  SUGGESTION: 0.05,
  KEYBOARD: 0.1,
  MOUSE: 0.15,
  MONITOR_ARM: 0.2,
  SPEAKER: 0.25,
};

const BONUS_POINTS = {
  TUESDAY_MULTIPLIER: 2,
  KEYBOARD_MOUSE_SET: 50,
  FULL_SET: 100,
  QUANTITY_TIER_1: 10,
  QUANTITY_TIER_2: 20,
  QUANTITY_TIER_3: 30,
  POINTS_TIER_1: 20,
  POINTS_TIER_2: 50,
  POINTS_TIER_3: 100,
};

const STOCK_ALERT_THRESHOLD = 5;
const LOW_STOCK_BORDER_THRESHOLD = 50;

const PROMOTION_TIMERS = {
  LIGHTNING_SALE_INTERVAL: 30000,
  SUGGESTION_INTERVAL: 60000,
  LIGHTNING_SALE_DELAY_MAX: 10000,
  SUGGESTION_DELAY_MAX: 20000,
};

// =================================================================================================
// 주 애플리케이션 초기화 함수
// =================================================================================================

function main() {
  // --------------------------------------------------------------------------------
  // 초기화
  // --------------------------------------------------------------------------------

  initializeGlobalVariables();
  initializeProductList();

  // --------------------------------------------------------------------------------
  // UI 요소 생성 및 설정
  // --------------------------------------------------------------------------------

  const rootElement = document.getElementById('app');
  const headerElement = createHeaderElement();
  const { gridContainer, leftColumn, rightColumn } = createLayoutElements();
  const { selectorContainer, stockInfo, addBtn, sel } = createProductSelector();
  
  productSelectElement = sel;
  addToCartButton = addBtn;
  stockInfoElement = stockInfo;

  leftColumn.appendChild(selectorContainer);
  cartDisplayElement = document.createElement('div');
  cartDisplayElement.id = 'cart-items';
  leftColumn.appendChild(cartDisplayElement);

  const { manualToggle, manualOverlay } = createManualElements();

  // --------------------------------------------------------------------------------
  // UI 렌더링
  // --------------------------------------------------------------------------------

  gridContainer.appendChild(leftColumn);
  gridContainer.appendChild(rightColumn);
  rootElement.appendChild(headerElement);
  rootElement.appendChild(gridContainer);
  rootElement.appendChild(manualToggle);
  rootElement.appendChild(manualOverlay);

  totalAmountElement = rightColumn.querySelector('#cart-total');

  // --------------------------------------------------------------------------------
  // 초기 데이터 처리 및 이벤트 리스너 설정
  // --------------------------------------------------------------------------------

  updateProductSelectOptions();
  updateUI();
  setupEventListeners();
  startTimers();
}

// =================================================================================================
// 초기화 함수
// =================================================================================================

function initializeGlobalVariables() {
  totalAmount = 0;
  totalItemCount = 0;
  lastSelectedProduct = null;
}

function initializeProductList() {
  productList = [
    { id: PRODUCT_ID_KEYBOARD, name: '버그 없애는 키보드', price: 10000, originalPrice: 10000, stock: 50, onSale: false, suggestSale: false },
    { id: PRODUCT_ID_MOUSE, name: '생산성 폭발 마우스', price: 20000, originalPrice: 20000, stock: 30, onSale: false, suggestSale: false },
    { id: PRODUCT_ID_MONITOR_ARM, name: '거북목 탈출 모니터암', price: 30000, originalPrice: 30000, stock: 20, onSale: false, suggestSale: false },
    { id: PRODUCT_ID_POUCH, name: '에러 방지 노트북 파우치', price: 15000, originalPrice: 15000, stock: 0, onSale: false, suggestSale: false },
    { id: PRODUCT_ID_SPEAKER, name: `코딩할 때 듣는 Lo-Fi 스피커`, price: 25000, originalPrice: 25000, stock: 10, onSale: false, suggestSale: false },
  ];
}

// =================================================================================================
// UI 생성 함수
// =================================================================================================

function createHeaderElement() {
  const header = document.createElement('div');
  header.className = 'mb-8';
  header.innerHTML = `
    <h1 class="text-xs font-medium tracking-extra-wide uppercase mb-2">🛒 Hanghae Online Store</h1>
    <div class="text-5xl tracking-tight leading-none">Shopping Cart</div>
    <p id="item-count" class="text-sm text-gray-500 font-normal mt-3">🛍️ 0 items in cart</p>
  `;
  return header;
}

function createLayoutElements() {
  const gridContainer = document.createElement('div');
  gridContainer.className = 'grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden';

  const leftColumn = document.createElement('div');
  leftColumn.className = 'bg-white border border-gray-200 p-8 overflow-y-auto';

  const rightColumn = document.createElement('div');
  rightColumn.className = 'bg-black text-white p-8 flex flex-col';
  rightColumn.innerHTML = `
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
          <div id="loyalty-points" class="text-xs text-blue-400 mt-2 text-right">적립 포인트: 0p</div>
        </div>
        <div id="tuesday-special" class="mt-4 p-3 bg-white/10 rounded-lg hidden">
          <div class="flex items-center gap-2">
            <span class="text-2xs">🎉</span>
            <span class="text-xs uppercase tracking-wide">Tuesday Special 10% Applied</span>
          </div>
        </div>
      </div>
    </div>
    <button class="w-full py-4 bg-white text-black text-sm font-normal uppercase tracking-super-wide cursor-pointer mt-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30">
      Proceed to Checkout
    </button>
    <p class="mt-4 text-2xs text-white/60 text-center leading-relaxed">
      Free shipping on all orders.<br>
      <span id="points-notice">Earn loyalty points with purchase.</span>
    </p>
  `;

  return { gridContainer, leftColumn, rightColumn };
}

function createProductSelector() {
  const selectorContainer = document.createElement('div');
  selectorContainer.className = 'mb-6 pb-6 border-b border-gray-200';

  const sel = document.createElement('select');
  sel.id = 'product-select';
  sel.className = 'w-full p-3 border border-gray-300 rounded-lg text-base mb-3';

  const addBtn = document.createElement('button');
  addBtn.id = 'add-to-cart';
  addBtn.innerHTML = 'Add to Cart';
  addBtn.className = 'w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all';

  const stockInfo = document.createElement('div');
  stockInfo.id = 'stock-status';
  stockInfo.className = 'text-xs text-red-500 mt-3 whitespace-pre-line';

  selectorContainer.appendChild(sel);
  selectorContainer.appendChild(addBtn);
  selectorContainer.appendChild(stockInfo);

  return { selectorContainer, stockInfo, addBtn, sel };
}

function createManualElements() {
  const manualToggle = document.createElement('button');
  manualToggle.className = 'fixed top-4 right-4 bg-black text-white p-3 rounded-full hover:bg-gray-900 transition-colors z-50';
  manualToggle.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  `;
  manualToggle.onclick = () => toggleManual();

  const manualOverlay = document.createElement('div');
  manualOverlay.id = 'manual-overlay';
  manualOverlay.className = 'fixed inset-0 bg-black/50 z-40 hidden transition-opacity duration-300';
  manualOverlay.onclick = (e) => {
    if (e.target === manualOverlay) {
      toggleManual(true);
    }
  };

  const manualColumn = document.createElement('div');
  manualColumn.id = 'manual-column';
  manualColumn.className = 'fixed right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto z-50 transform translate-x-full transition-transform duration-300';
  manualColumn.innerHTML = `
    <button class="absolute top-4 right-4 text-gray-500 hover:text-black" onclick="toggleManual(true)">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
    <h2 class="text-xl font-bold mb-4">📖 이용 안내</h2>
    <div class="mb-6">
      <h3 class="text-base font-bold mb-3">💰 할인 정책</h3>
      <div class="space-y-3">
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">개별 상품</p>
          <p class="text-gray-700 text-xs pl-2">
            • 키보드 10개↑: 10%<br>
            • 마우스 10개↑: 15%<br>
            • 모니터암 10개↑: 20%<br>
            • 스피커 10개↑: 25%
          </p>
        </div>
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">전체 수량</p>
          <p class="text-gray-700 text-xs pl-2">• 30개 이상: 25%</p>
        </div>
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">특별 할인</p>
          <p class="text-gray-700 text-xs pl-2">
            • 화요일: +10%<br>
            • ⚡번개세일: 20%<br>
            • 💝추천할인: 5%
          </p>
        </div>
      </div>
    </div>
    <div class="mb-6">
      <h3 class="text-base font-bold mb-3">🎁 포인트 적립</h3>
      <div class="space-y-3">
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">기본</p>
          <p class="text-gray-700 text-xs pl-2">• 구매액의 0.1%</p>
        </div>
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">추가</p>
          <p class="text-gray-700 text-xs pl-2">
            • 화요일: 2배<br>
            • 키보드+마우스: +50p<br>
            • 풀세트: +100p<br>
            • 10개↑: +20p / 20개↑: +50p / 30개↑: +100p
          </p>
        </div>
      </div>
    </div>
    <div class="border-t border-gray-200 pt-4 mt-4">
      <p class="text-xs font-bold mb-1">💡 TIP</p>
      <p class="text-2xs text-gray-600 leading-relaxed">
        • 화요일 대량구매 = MAX 혜택<br>
        • ⚡+💝 중복 가능<br>
        • 상품4 = 품절
      </p>
    </div>
  `;

  manualOverlay.appendChild(manualColumn);

  return { manualToggle, manualOverlay };
}

// =================================================================================================
// 이벤트 리스너 설정
// =================================================================================================

function setupEventListeners() {
  addToCartButton.addEventListener('click', handleAddToCart);
  cartDisplayElement.addEventListener('click', handleCartActions);
}

// =================================================================================================
// 타이머 설정
// =================================================================================================

function startTimers() {
  const lightningSaleDelay = Math.random() * PROMOTION_TIMERS.LIGHTNING_SALE_DELAY_MAX;
  setTimeout(() => {
    setInterval(triggerLightningSale, PROMOTION_TIMERS.LIGHTNING_SALE_INTERVAL);
  }, lightningSaleDelay);

  setTimeout(() => {
    setInterval(triggerSuggestion, PROMOTION_TIMERS.SUGGESTION_INTERVAL);
  }, Math.random() * PROMOTION_TIMERS.SUGGESTION_DELAY_MAX);
}

// =================================================================================================
// 이벤트 핸들러 및 관련 함수
// =================================================================================================

function handleAddToCart() {
  const selectedProductId = productSelectElement.value;
  const productToAdd = findProductById(selectedProductId);

  if (!productToAdd || productToAdd.stock <= 0) {
    if (productToAdd && productToAdd.stock <= 0) {
      alert('재고가 부족합니다.');
    }
    return;
  }

  const cartItem = document.getElementById(productToAdd.id);

  if (cartItem) {
    const quantityElement = cartItem.querySelector('.quantity-number');
    const newQuantity = parseInt(quantityElement.textContent) + 1;
    if (newQuantity <= productToAdd.stock + parseInt(quantityElement.textContent)) {
      quantityElement.textContent = newQuantity;
      productToAdd.stock--;
    } else {
      alert('재고가 부족합니다.');
    }
  } else {
    const newCartItem = createCartItemElement(productToAdd);
    cartDisplayElement.appendChild(newCartItem);
    productToAdd.stock--;
  }

  updateUI();
  lastSelectedProduct = selectedProductId;
}

function handleCartActions(event) {
  const targetElement = event.target;
  const isQuantityChange = targetElement.classList.contains('quantity-change');
  const isRemoveItem = targetElement.classList.contains('remove-item');

  if (!isQuantityChange && !isRemoveItem) return;

  const productId = targetElement.dataset.productId;
  const cartItemElement = document.getElementById(productId);
  const product = findProductById(productId);

  if (!product) return;

  if (isQuantityChange) {
    const quantityChange = parseInt(targetElement.dataset.change);
    const quantityElement = cartItemElement.querySelector('.quantity-number');
    const currentQuantity = parseInt(quantityElement.textContent);
    const newQuantity = currentQuantity + quantityChange;

    if (newQuantity > 0 && newQuantity <= product.stock + currentQuantity) {
      quantityElement.textContent = newQuantity;
      product.stock -= quantityChange;
    } else if (newQuantity <= 0) {
      product.stock += currentQuantity;
      cartItemElement.remove();
    } else {
      alert('재고가 부족합니다.');
    }
  } else if (isRemoveItem) {
    const quantityElement = cartItemElement.querySelector('.quantity-number');
    const removedQuantity = parseInt(quantityElement.textContent);
    product.stock += removedQuantity;
    cartItemElement.remove();
  }

  updateUI();
  updateProductSelectOptions();
}

// =================================================================================================
// UI 업데이트 함수
// =================================================================================================

function updateUI() {
  const cartData = calculateCartTotals();
  totalItemCount = cartData.totalItemCount;
  totalAmount = cartData.totalAmount;

  const tuesdaySpecialElement = document.getElementById('tuesday-special');
  if (cartData.isTuesday && cartData.totalAmount > 0) {
    tuesdaySpecialElement.classList.remove('hidden');
  } else {
    tuesdaySpecialElement.classList.add('hidden');
  }

  updateCartSummaryUI(cartData.subtotal, cartData.itemDiscounts, cartData.isTuesday);
  updateCartTotalUI();
  updateDiscountInfoUI(cartData.originalTotal, cartData.totalDiscountRate);
  updateItemCountUI();
  updateStockInfoUI();
  renderBonusPoints();
}

function updateProductSelectOptions() {
  productSelectElement.innerHTML = '';
  const totalStock = productList.reduce((acc, p) => acc + p.stock, 0);

  productList.forEach(item => {
    const optionElement = document.createElement('option');
    optionElement.value = item.id;
    
    const displayDetails = getProductDisplayDetails(item);
    optionElement.textContent = displayDetails.text;
    optionElement.className = displayDetails.className;
    if (displayDetails.disabled) {
      optionElement.disabled = true;
    }
    
    productSelectElement.appendChild(optionElement);
  });

  productSelectElement.style.borderColor = totalStock < LOW_STOCK_BORDER_THRESHOLD ? 'orange' : '';
}

function updateCartItemPrices() {
  const cartItems = Array.from(cartDisplayElement.children);
  cartItems.forEach(cartItem => {
    const product = findProductById(cartItem.id);

    if (product) {
      const priceDiv = cartItem.querySelector('.text-lg');
      const nameDiv = cartItem.querySelector('h3');
      
      const displayDetails = getProductDisplayDetails(product);
      priceDiv.innerHTML = displayDetails.priceHtml;
      nameDiv.textContent = `${displayDetails.namePrefix}${product.name}`;
    }
  });
  updateUI();
}

function createCartItemElement(item) {
  const newItemElement = document.createElement('div');
  newItemElement.id = item.id;
  newItemElement.className = 'grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0';
  
  const displayDetails = getProductDisplayDetails(item);

  newItemElement.innerHTML = `
    <div class="w-20 h-20 bg-gradient-black relative overflow-hidden">
      <div class="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
    </div>
    <div>
      <h3 class="text-base font-normal mb-1 tracking-tight">${displayDetails.namePrefix}${item.name}</h3>
      <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
      <p class="text-xs text-black mb-3">${displayDetails.priceHtml}</p>
      <div class="flex items-center gap-4">
        <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${item.id}" data-change="-1">−</button>
        <span class="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums">1</span>
        <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${item.id}" data-change="1">+</button>
      </div>
    </div>
    <div class="text-right">
      <div class="text-lg mb-2 tracking-tight tabular-nums">${displayDetails.priceHtml}</div>
      <a class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black" data-product-id="${item.id}">Remove</a>
    </div>
  `;
  return newItemElement;
}

// =================================================================================================
// 계산 및 데이터 처리 함수
// =================================================================================================

function calculateCartTotals() {
  const cartItems = Array.from(cartDisplayElement.children);
  let subtotal = 0;
  const itemDiscounts = [];
  
  const totalItemCount = cartItems.reduce((acc, cartItem) => {
    const quantity = parseInt(cartItem.querySelector('.quantity-number').textContent);
    return acc + quantity;
  }, 0);

  let totalAmount = cartItems.reduce((acc, cartItem) => {
    const currentItem = findProductById(cartItem.id);
    const quantity = parseInt(cartItem.querySelector('.quantity-number').textContent);
    const itemTotal = currentItem.price * quantity;
    subtotal += itemTotal;

    let discountRate = 0;
    if (quantity >= DISCOUNT_THRESHOLDS.ITEM_SPECIFIC_MIN_QUANTITY) {
      if (currentItem.id === PRODUCT_ID_KEYBOARD) discountRate = DISCOUNT_RATES.KEYBOARD;
      else if (currentItem.id === PRODUCT_ID_MOUSE) discountRate = DISCOUNT_RATES.MOUSE;
      else if (currentItem.id === PRODUCT_ID_MONITOR_ARM) discountRate = DISCOUNT_RATES.MONITOR_ARM;
      else if (currentItem.id === PRODUCT_ID_SPEAKER) discountRate = DISCOUNT_RATES.SPEAKER;
      
      if (discountRate > 0) {
        itemDiscounts.push({ name: currentItem.name, discount: discountRate * 100 });
      }
    }
    return acc + (itemTotal * (1 - discountRate));
  }, 0);

  const originalTotal = subtotal;
  let totalDiscountRate = 0;

  if (totalItemCount >= DISCOUNT_THRESHOLDS.BULK_PURCHASE_MIN_QUANTITY) {
    totalAmount = subtotal * (1 - DISCOUNT_RATES.BULK_PURCHASE);
    totalDiscountRate = DISCOUNT_RATES.BULK_PURCHASE;
  } else {
    totalDiscountRate = subtotal > 0 ? (subtotal - totalAmount) / subtotal : 0;
  }

  const today = new Date();
  const isTuesday = today.getDay() === 2;

  if (isTuesday && totalAmount > 0) {
    totalAmount *= (1 - DISCOUNT_RATES.TUESDAY_SPECIAL);
    totalDiscountRate = 1 - totalAmount / originalTotal;
  }

  return { totalItemCount, totalAmount, subtotal, itemDiscounts, totalDiscountRate, originalTotal, isTuesday };
}

function updateCartSummaryUI(subtotal, itemDiscounts, isTuesday) {
  const summaryDetails = document.getElementById('summary-details');
  summaryDetails.innerHTML = '';

  if (subtotal > 0) {
    const cartItems = Array.from(cartDisplayElement.children);
    cartItems.forEach(cartItem => {
      const currentItem = findProductById(cartItem.id);
      const quantity = parseInt(cartItem.querySelector('.quantity-number').textContent);
      const itemTotal = currentItem.price * quantity;
      summaryDetails.innerHTML += `
        <div class="flex justify-between text-xs tracking-wide text-gray-400">
          <span>${currentItem.name} x ${quantity}</span>
          <span>₩${itemTotal.toLocaleString()}</span>
        </div>
      `;
    });

    summaryDetails.innerHTML += `
      <div class="border-t border-white/10 my-3"></div>
      <div class="flex justify-between text-sm tracking-wide">
        <span>Subtotal</span>
        <span>₩${subtotal.toLocaleString()}</span>
      </div>
    `;

    if (totalItemCount >= DISCOUNT_THRESHOLDS.BULK_PURCHASE_MIN_QUANTITY) {
      summaryDetails.innerHTML += `
        <div class="flex justify-between text-sm tracking-wide text-green-400">
          <span class="text-xs">🎉 대량구매 할인 (30개 이상)</span>
          <span class="text-xs">-${DISCOUNT_RATES.BULK_PURCHASE * 100}%</span>
        </div>
      `;
    } else if (itemDiscounts.length > 0) {
      itemDiscounts.forEach(item => {
        summaryDetails.innerHTML += `
          <div class="flex justify-between text-sm tracking-wide text-green-400">
            <span class="text-xs">${item.name} (10개↑)</span>
            <span class="text-xs">-${item.discount}%</span>
          </div>
        `;
      });
    }

    if (isTuesday && totalAmount > 0) {
      summaryDetails.innerHTML += `
        <div class="flex justify-between text-sm tracking-wide text-purple-400">
          <span class="text-xs">🌟 화요일 추가 할인</span>
          <span class="text-xs">-${DISCOUNT_RATES.TUESDAY_SPECIAL * 100}%</span>
        </div>
      `;
    }

    summaryDetails.innerHTML += `
      <div class="flex justify-between text-sm tracking-wide text-gray-400">
        <span>Shipping</span>
        <span>Free</span>
      </div>
    `;
  }
}

function updateCartTotalUI() {
  const totalDiv = totalAmountElement.querySelector('.text-2xl');
  if (totalDiv) {
    totalDiv.textContent = `₩${Math.round(totalAmount).toLocaleString()}`;
  }
}

function updateDiscountInfoUI(originalTotal, totalDiscountRate) {
  const discountInfoDiv = document.getElementById('discount-info');
  discountInfoDiv.innerHTML = '';
  if (totalDiscountRate > 0 && totalAmount > 0) {
    const savedAmount = originalTotal - totalAmount;
    discountInfoDiv.innerHTML = `
      <div class="bg-green-500/20 rounded-lg p-3">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
          <span class="text-sm font-medium text-green-400">${(totalDiscountRate * 100).toFixed(1)}%</span>
        </div>
        <div class="text-2xs text-gray-300">₩${Math.round(savedAmount).toLocaleString()} 할인되었습니다</div>
      </div>
    `;
  }
}

function updateItemCountUI() {
  const itemCountElement = document.getElementById('item-count');
  if (itemCountElement) {
    const previousCount = parseInt(itemCountElement.textContent.match(/\d+/) || '0');
    itemCountElement.textContent = `🛍️ ${totalItemCount} items in cart`;
    if (previousCount !== totalItemCount) {
      itemCountElement.setAttribute('data-changed', 'true');
    }
  }
}

function updateStockInfoUI() {
  let stockMessage = '';
  productList.forEach(item => {
    if (item.stock < STOCK_ALERT_THRESHOLD) {
      stockMessage += item.stock > 0
        ? `${item.name}: 재고 부족 (${item.stock}개 남음)\n`
        : `${item.name}: 품절\n`;
    }
  });
  stockInfoElement.textContent = stockMessage;
}

const renderBonusPoints = () => {
  const loyaltyPointsDiv = document.getElementById('loyalty-points');
  if (cartDisplayElement.children.length === 0) {
    loyaltyPointsDiv.style.display = 'none';
    return;
  }

  let basePoints = Math.floor(totalAmount / 1000);
  let finalPoints = 0;
  const pointsDetail = [];

  if (basePoints > 0) {
    finalPoints = basePoints;
    pointsDetail.push(`기본: ${basePoints}p`);
  }

  if (new Date().getDay() === 2 && basePoints > 0) {
    finalPoints = basePoints * BONUS_POINTS.TUESDAY_MULTIPLIER;
    pointsDetail.push('화요일 2배');
  }

  const hasKeyboard = Array.from(cartDisplayElement.children).some(node => node.id === PRODUCT_ID_KEYBOARD);
  const hasMouse = Array.from(cartDisplayElement.children).some(node => node.id === PRODUCT_ID_MOUSE);
  const hasMonitorArm = Array.from(cartDisplayElement.children).some(node => node.id === PRODUCT_ID_MONITOR_ARM);

  if (hasKeyboard && hasMouse) {
    finalPoints += BONUS_POINTS.KEYBOARD_MOUSE_SET;
    pointsDetail.push('키보드+마우스 세트 +50p');
  }
  if (hasKeyboard && hasMouse && hasMonitorArm) {
    finalPoints += BONUS_POINTS.FULL_SET;
    pointsDetail.push('풀세트 구매 +100p');
  }

  if (totalItemCount >= BONUS_POINTS.QUANTITY_TIER_3) {
    finalPoints += BONUS_POINTS.POINTS_TIER_3;
    pointsDetail.push('대량구매(30개+) +100p');
  } else if (totalItemCount >= BONUS_POINTS.QUANTITY_TIER_2) {
    finalPoints += BONUS_POINTS.POINTS_TIER_2;
    pointsDetail.push('대량구매(20개+) +50p');
  } else if (totalItemCount >= BONUS_POINTS.QUANTITY_TIER_1) {
    finalPoints += BONUS_POINTS.POINTS_TIER_1;
    pointsDetail.push('대량구매(10개+) +20p');
  }

  bonusPoints = finalPoints;

  if (bonusPoints > 0) {
    loyaltyPointsDiv.innerHTML = `
      <div>적립 포인트: <span class="font-bold">${bonusPoints}p</span></div>
      <div class="text-2xs opacity-70 mt-1">${pointsDetail.join(', ')}</div>
    `;
    loyaltyPointsDiv.style.display = 'block';
  } else {
    loyaltyPointsDiv.textContent = '적립 포인트: 0p';
    loyaltyPointsDiv.style.display = 'block';
  }
};

// =================================================================================================
// 유틸리티 함수
// =================================================================================================

function findProductById(id) {
  return productList.find(p => p.id === id);
}

function getProductDisplayDetails(item) {
  const details = {
    text: `${item.name} - ${item.price}원`,
    className: '',
    priceHtml: `₩${item.price.toLocaleString()}`,
    namePrefix: ''
  };

  const discountTextParts = [];
  if (item.onSale) discountTextParts.push('⚡SALE');
  if (item.suggestSale) discountTextParts.push('💝추천');
  const discountText = discountTextParts.length > 0 ? ` ${discountTextParts.join(' ')}` : '';

  if (item.stock === 0) {
    details.text = `${item.name} - ${item.price}원 (품절)${discountText}`;
    details.disabled = true;
    details.className = 'text-gray-400';
  } else if (item.onSale && item.suggestSale) {
    details.text = `⚡💝${item.name} - ${item.originalPrice}원 → ${item.price}원 (25% SUPER SALE!)`;
    details.className = 'text-purple-600 font-bold';
    details.priceHtml = `<span class="line-through text-gray-400">₩${item.originalPrice.toLocaleString()}</span> <span class="text-purple-600">₩${item.price.toLocaleString()}</span>`;
    details.namePrefix = '⚡💝';
  } else if (item.onSale) {
    details.text = `⚡${item.name} - ${item.originalPrice}원 → ${item.price}원 (20% SALE!)`;
    details.className = 'text-red-500 font-bold';
    details.priceHtml = `<span class="line-through text-gray-400">₩${item.originalPrice.toLocaleString()}</span> <span class="text-red-500">₩${item.price.toLocaleString()}</span>`;
    details.namePrefix = '⚡';
  } else if (item.suggestSale) {
    details.text = `💝${item.name} - ${item.originalPrice}원 → ${item.price}원 (5% 추천할인!)`;
    details.className = 'text-blue-500 font-bold';
    details.priceHtml = `<span class="line-through text-gray-400">₩${item.originalPrice.toLocaleString()}</span> <span class="text-blue-500">₩${item.price.toLocaleString()}</span>`;
    details.namePrefix = '💝';
  } else {
    details.text = `${item.name} - ${item.price}원${discountText}`;
  }
  return details;
}

function toggleManual(forceClose = false) {
  const manualOverlay = document.getElementById('manual-overlay');
  const manualColumn = document.getElementById('manual-column');
  if (forceClose) {
    manualOverlay.classList.add('hidden');
    manualColumn.classList.add('translate-x-full');
  } else {
    manualOverlay.classList.toggle('hidden');
    manualColumn.classList.toggle('translate-x-full');
  }
}

function getTotalStock() {
  return productList.reduce((sum, currentProduct) => sum + currentProduct.stock, 0);
}

// =================================================================================================
// 프로모션 관련 함수
// =================================================================================================

function triggerLightningSale() {
  const luckyItem = productList[Math.floor(Math.random() * productList.length)];
  if (luckyItem.stock > 0 && !luckyItem.onSale) {
    luckyItem.price = Math.round(luckyItem.originalPrice * (1 - DISCOUNT_RATES.LIGHTNING_SALE));
    luckyItem.onSale = true;
    alert(`⚡번개세일! ${luckyItem.name}이(가) 20% 할인 중입니다!`);
    updateProductSelectOptions();
    updateCartItemPrices();
  }
}

function triggerSuggestion() {
  if (cartDisplayElement.children.length === 0 || !lastSelectedProduct) return;

  const suggestedProduct = productList.find(p => p.id !== lastSelectedProduct && p.stock > 0 && !p.suggestSale);
  if (suggestedProduct) {
    alert(`💝 ${suggestedProduct.name}은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!`);
    suggestedProduct.price = Math.round(suggestedProduct.price * (1 - DISCOUNT_RATES.SUGGESTION));
    suggestedProduct.suggestSale = true;
    updateProductSelectOptions();
    updateCartItemPrices();
  }
}

// =================================================================================================
// 애플리케이션 시작
// =================================================================================================

main();
