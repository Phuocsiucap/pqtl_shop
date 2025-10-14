// src/components/ProductCard/ProductModal.js
import { X, Star, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

export default function ProductModal({ product, isOpen, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const discountedPrice = product.price * (1 - product.discount);

  const handleAddToCart = () => {
    onAddToCart({ ...product, quantity });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow hover:bg-gray-100 transition"
        >
          <X size={20} />
        </button>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Hình ảnh sản phẩm */}
          <div className="bg-gray-100 rounded-xl h-96 flex items-center justify-center text-8xl">
            {product.image}
          </div>

          {/* Thông tin sản phẩm */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{product.name}</h2>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating} ({product.reviews} đánh giá)
              </span>
            </div>

            {/* Giá */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-blue-600">
                {discountedPrice.toLocaleString('vi-VN')}đ
              </span>
              {product.discount > 0 && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    {product.price.toLocaleString('vi-VN')}đ
                  </span>
                  <span className="bg-orange-500 text-white text-sm px-2 py-1 rounded-full font-semibold">
                    -{(product.discount * 100).toFixed(0)}%
                  </span>
                </>
              )}
            </div>

            {/* Mô tả */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Mô tả sản phẩm:</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Sản phẩm chất lượng cao, được chọn lọc kỹ càng từ các nhà cung cấp uy tín. 
                Đảm bảo an toàn vệ sinh thực phẩm và giữ nguyên hương vị tự nhiên.
              </p>
            </div>

            {/* Tồn kho */}
            <div className="mb-6">
              <span className="text-sm text-gray-600">
                Tình trạng: <span className="font-semibold text-green-600">Còn {product.stock} sản phẩm</span>
              </span>
            </div>

            {/* Số lượng */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Số lượng:</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition"
                >
                  <Minus size={18} />
                </button>
                <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Nút thêm vào giỏ */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}