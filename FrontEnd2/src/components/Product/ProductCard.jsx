import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { request1 } from '../../utils/request';
import { getCSRFTokenFromCookie } from '../../Component/Token/getCSRFToken';

function ProductCard({ product }) {
    const navigate = useNavigate();
    const statusUser = useSelector((state) => state.user.status);
    const [isAdding, setIsAdding] = useState(false);
    
    const rating = Math.round(product.rating || 0);
    const computedFinalPrice = product.finalPrice ?? (product.price - (product.discount || 0));

    const handleAddToCart = async (e) => {
        e.preventDefault(); // Ngăn chặn navigation khi click vào button
        e.stopPropagation(); // Ngăn chặn event bubble
        
        if (!statusUser) {
            if (window.confirm("Bạn chưa đăng nhập. Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.")) {
                navigate("/login");
            }
            return;
        }

        // Kiểm tra số lượng tồn kho
        if (product.stockQuantity !== undefined && product.stockQuantity <= 0) {
            alert("Sản phẩm này đã hết hàng. Vui lòng chọn sản phẩm khác.");
            return;
        }

        if (!window.confirm("Bạn xác nhận thêm sản phẩm này vào giỏ hàng?")) {
            return;
        }

        // Lấy token mỗi lần gọi API để đảm bảo token luôn mới nhất
        const access_token = getCSRFTokenFromCookie("access_token");
        
        if (!access_token) {
            alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            navigate("/login");
            return;
        }

        setIsAdding(true);
        try {
            // Tính toán giá cuối cùng
            const finalPrice = computedFinalPrice;
            const total = finalPrice * 1; // quantity = 1

            // Format dữ liệu theo yêu cầu của backend CartItem
            const cartItem = {
                productId: product.id,
                productName: product.name,
                image: product.image || '',
                price: product.price,
                discount: product.discount || 0,
                qty: 1,
                total: total
            };

            console.log("Sending cart item:", cartItem);

            // Thử endpoint /api/cart trước (theo CartController)
            const response = await request1.post(
                "cart",
                cartItem,
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            ).catch(async (error) => {
                // Nếu endpoint /api/cart không hoạt động, thử /api/cart/add
                if (error.response?.status === 404 || error.response?.status === 405) {
                    console.log("Trying /api/cart/add endpoint...");
                    return await request1.post(
                        "cart/add",
                        cartItem,
                        {
                            headers: {
                                Authorization: `Bearer ${access_token}`,
                                "Content-Type": "application/json",
                            },
                            withCredentials: true,
                        }
                    );
                }
                throw error;
            });

            console.log("Add to cart response:", response);
            alert("Thêm sản phẩm vào giỏ hàng thành công!");
        } catch (error) {
            console.error("Lỗi khi thêm vào giỏ hàng:", error);
            console.error("Error response:", error.response?.data);
            if (error.response?.status === 401) {
                alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                navigate("/login");
            } else if (error.response?.status === 400) {
                const errorMsg = error.response?.data?.error || error.response?.data?.message || "Dữ liệu không hợp lệ";
                alert(`Lỗi: ${errorMsg}`);
            } else {
                alert("Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.");
            }
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="bg-white border rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300 h-full flex flex-col">
            <Link to={`/products/${product.id}`} className="flex-shrink-0">
                <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-48 object-cover" 
                />
            </Link>
            <div className="p-4 flex flex-col flex-1">
                <h3 className="text-sm font-semibold min-h-[2.5rem] line-clamp-2 mb-2">
                    <Link to={`/products/${product.id}`} className="hover:text-primary">{product.name}</Link>
                </h3>
                
                {/* Rating */}
                <div className="flex items-center text-xs mb-2 flex-shrink-0">
                    <span className="text-yellow-500 mr-1">
                        {'★'.repeat(rating)}
                        {'☆'.repeat(5 - rating)}
                    </span>
                    <span className="text-gray-500">({product.reviewCount || 0})</span>
                </div>

                {/* Price */}
                <div className="flex items-center mb-3 flex-shrink-0">
                    {product.discount > 0 && (
                        <span className="text-xs text-gray-400 line-through mr-2">{product.price?.toLocaleString()} VND</span>
                    )}
                    <span className="text-lg font-bold text-red-600">{computedFinalPrice?.toLocaleString()} VND</span>
                </div>

                {/* Add to Cart Button - Push to bottom */}
                <div className="mt-auto">
                    <button 
                        onClick={handleAddToCart}
                        disabled={isAdding}
                        className="w-full py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAdding ? "Đang thêm..." : "Thêm vào Giỏ hàng"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;