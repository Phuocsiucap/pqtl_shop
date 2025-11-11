import React from 'react';
import { Link } from 'react-router-dom';

// Giả định Product type được import từ types/product
// import { Product } from '../../types/product'; 

function ProductCard({ product }) {
    const rating = Math.round(product.rating || 0);
    const finalPrice = product.price - product.discount;

    return (
        <div className="bg-white border rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300">
            <Link to={`/products/${product.id}`}>
                <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-40 object-cover" 
                />
            </Link>
            <div className="p-4">
                <h3 className="text-sm font-semibold h-10 overflow-hidden mb-1">
                    <Link to={`/products/${product.id}`} className="hover:text-primary">{product.name}</Link>
                </h3>
                
                {/* Rating */}
                <div className="flex items-center text-xs mb-2">
                    <span className="text-yellow-500 mr-1">
                        {'★'.repeat(rating)}
                        {'☆'.repeat(5 - rating)}
                    </span>
                    <span className="text-gray-500">({product.reviewCount})</span>
                </div>

                {/* Price */}
                <div className="flex items-center mb-3">
                    {product.discount > 0 && (
                        <span className="text-xs text-gray-400 line-through mr-2">{product.price.toLocaleString()} VND</span>
                    )}
                    <span className="text-lg font-bold text-red-600">{finalPrice.toLocaleString()} VND</span>
                </div>

                {/* Add to Cart Button */}
                <button className="w-full py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition">
                    Thêm vào Giỏ hàng
                </button>
            </div>
        </div>
    );
}

export default ProductCard;