import React, { useState } from 'react';
import { Product } from '../types/product';

interface SelectorProps {
  productList: Product[];
  lastSelectedProduct: Product | null;
  onAdd: (productId: string) => void;
}

const Selector = ({ productList, lastSelectedProduct, onAdd }: SelectorProps) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    lastSelectedProduct?.id || (productList.find(p => p.stock > 0)?.id ?? '')
  );

  const handleAddClick = () => {
    onAdd(selectedProductId);
  };

  return (
    <div className="mb-6 pb-6 border-b border-gray-200">
      <select
        id="product-select"
        className="w-full p-3 border border-gray-300 rounded-lg text-base mb-3"
        value={selectedProductId}
        onChange={(e) => setSelectedProductId(e.target.value)}
      >
        {productList.map(product => (
          <option key={product.id} value={product.id} disabled={product.stock === 0}>
            {product.name} - {product.price}원 {product.stock === 0 ? '(품절)' : ''}
          </option>
        ))}
      </select>
      <button
        id="add-to-cart"
        className="w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800"
        onClick={handleAddClick}
        disabled={!selectedProductId}
      >
        Add to Cart
      </button>
      <div id="stock-status" className="text-xs text-red-500 mt-3 whitespace-pre-line">
        {productList.map(p => {
          if (p.stock === 0) {
            return `${p.name}: 품절\n`;
          } else if (p.stock < 10) {
            return `${p.name}: 재고 부족 (${p.stock}개 남음)\n`;
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default Selector;

