import React from 'react';

interface SelectorProps {
  onAdd: () => void; // onAdd 함수를 prop으로 받음
}

const Selector: React.FC<SelectorProps> = ({ onAdd }) => {
  return (
    <div className="mb-6 pb-6 border-b border-gray-200">
      <select
        id="product-select"
        className="w-full p-3 border border-gray-300 rounded-lg text-base mb-3"
      >
        {/* Options will be rendered here based on product data */}
      </select>
      <button
        id="add-to-cart"
        className="w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800"
        onClick={onAdd}
      >
        Add to Cart
      </button>
      <div id="stock-status" className="text-xs text-red-500 mt-3 whitespace-pre-line"></div>
    </div>
  );
};

export default Selector;
