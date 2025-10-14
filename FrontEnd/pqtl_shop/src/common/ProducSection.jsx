// src/components/ProductCard/ProductCard.js
import { useState } from 'react';
import { Heart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductModal from '../modals/ProductModal';

const ProductCard = ({ product, onAddToCart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const discountedPrice = product.price * (1 - product.discount);

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan sang card
    onAddToCart(product);
  };

  const handleQuickView = (e) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan sang card
    setShowModal(true);
  };

  return (
    <>
      <div
        className="bg-white rounded-xl shadow hover:shadow-xl transition duration-300 overflow-hidden group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        <div className="relative">
          <div className="bg-gray-100 h-64 flex items-center justify-center text-6xl">
            {product.image}
          </div>
          
          {product.isNew && (
            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              MỚI
            </span>
          )}
          {product.isHot && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              🔥 HOT
            </span>
          )}
          {product.isBestSeller && (
            <span className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              BÁN CHẠY
            </span>
          )}
          {product.discount > 0 && (
            <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              -{(product.discount * 100).toFixed(0)}%
            </span>
          )}
          
          <button 
            onClick={(e) => e.stopPropagation()}
            className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
          >
            <Heart size={18} className="text-gray-600" />
          </button>

          {isHovered && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
              <button
                onClick={handleAddToCart}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Thêm vào giỏ
              </button>
              <button 
                onClick={handleQuickView}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                Xem nhanh
              </button>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 h-12">{product.name}</h3>
          
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.reviews})</span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl font-bold text-blue-600">
              {discountedPrice.toLocaleString('vi-VN')}đ
            </span>
            {product.discount > 0 && (
              <span className="text-sm text-gray-400 line-through">
                {product.price.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Còn {product.stock} sản phẩm</span>
            {product.stock < 10 && (
              <span className="text-xs text-red-500 font-semibold">Sắp hết hàng!</span>
            )}
          </div>
        </div>
      </div>

      {/* Modal xem nhanh */}
      <ProductModal 
        product={product}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAddToCart={onAddToCart}
      />
    </>
  );
};

const ProductSection = ({ title, icon, products, onAddToCart }) => (
  <div className="mb-12">
    <div className="flex items-center gap-3 mb-6">
      {icon}
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  </div>
);

export default ProductSection;