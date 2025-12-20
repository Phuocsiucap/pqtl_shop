import React, { useEffect, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useProductDetail } from '../../hooks/useProductDetail';
import ProductReviewForm from './ProductReviewForm';
import { request1 } from '../../utils/request';
import { getCSRFTokenFromCookie } from '../../Component/Token/getCSRFToken';

// Component hiển thị thông tin đánh giá
const ReviewList = ({ reviews, fetchReviews, productId }) => {
    if (!reviews) return <p>Đang tải đánh giá...</p>;
    if (reviews.content.length === 0) return <p>Chưa có đánh giá nào cho sản phẩm này.</p>;

    const handlePageChange = (newPage) => {
        fetchReviews(productId, newPage, reviews.size);
    };

    return (
        <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Đánh giá ({reviews.totalElements})</h3>
            {reviews.content.map((review) => (
                <div key={review.id} className="border-b py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <span className="font-semibold">{review.username}</span>
                            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                ✓ Đã mua hàng
                            </span>
                        </div>
                        <span className="text-sm text-gray-500">{new Date(review.reviewDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="text-yellow-500 mt-1">
                        {'★'.repeat(review.rating)}
                        {'☆'.repeat(5 - review.rating)}
                    </div>
                    <p className="mt-2 text-gray-700">{review.comment}</p>
                    
                    {/* Hiển thị phản hồi từ admin nếu có */}
                    {review.adminReply && (
                        <div className="mt-3 ml-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                            <div className="flex items-center mb-1">
                                <span className="font-semibold text-blue-700 text-sm">
                                    🛒 Phản hồi từ Shop
                                </span>
                                {review.adminReplyDate && (
                                    <span className="ml-2 text-xs text-gray-500">
                                        {new Date(review.adminReplyDate).toLocaleDateString('vi-VN')}
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-700 text-sm">{review.adminReply}</p>
                        </div>
                    )}
                </div>
            ))}
            {/* Pagination controls */}
            {reviews.totalPages > 1 && (
                <div className="flex justify-center space-x-2 mt-4">
                    <button
                        onClick={() => handlePageChange(reviews.number - 1)}
                        disabled={reviews.first}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >Trước</button>
                    <span>Trang {reviews.number + 1} / {reviews.totalPages}</span>
                    <button
                        onClick={() => handlePageChange(reviews.number + 1)}
                        disabled={reviews.last}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >Sau</button>
                </div>
            )}
        </div>
    );
};
// Component hiển thị gallery ảnh sản phẩm
const ImageGallery = ({ mainImage, additionalImages }) => {
    const [selectedImage, setSelectedImage] = React.useState(mainImage);

    // Combine main image and additional images
    const allImages = [mainImage, ...(additionalImages || [])].filter(Boolean);

    React.useEffect(() => {
        setSelectedImage(mainImage);
    }, [mainImage]);

    if (allImages.length === 1) {
        // Only main image, display it directly
        return (
            <img src={mainImage} alt="Product" className="w-full h-auto object-cover rounded-lg shadow-lg" />
        );
    }

    return (
        <div className="space-y-4">
            {/* Main Image Display */}
            <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                <img
                    src={selectedImage}
                    alt="Selected product"
                    className="w-full h-full object-contain"
                />
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
                {allImages.map((image, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedImage(image)}
                        className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === image
                                ? 'border-primary ring-2 ring-primary ring-offset-2'
                                : 'border-gray-200 hover:border-gray-400'
                            }`}
                    >
                        <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
};

// Component hiển thị sản phẩm tương tự
const SimilarProducts = ({ products }) => {
    const navigate = useNavigate();
    
    if (!products || products.length === 0) return null;

    const handleProductClick = (productId) => {
        navigate(`/products/${productId}`);
    };

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Sản phẩm tương tự</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {products.map((product) => (
                    <div 
                        key={product.id} 
                        onClick={() => handleProductClick(product.id)}
                        className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1"
                    >
                        {/* Image Container */}
                        <div className="relative w-full h-40 bg-gray-100 overflow-hidden">
                            <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                            />
                            {/* Stock Badge */}
                            {product.stockQuantity <= 0 && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">Hết hàng</span>
                                </div>
                            )}
                            {/* Clearance Badge */}
                            {product.isClearance && (
                                <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold">
                                    Thanh lý -{product.clearanceDiscount}%
                                </div>
                            )}
                        </div>

                        {/* Info Container */}
                        <div className="p-3">
                            {/* Product Name */}
                            <h4 className="text-sm font-semibold text-gray-800 truncate mb-1">
                                {product.name}
                            </h4>
                            
                            {/* Category */}
                            <p className="text-xs text-gray-500 mb-2">
                                {product.category}
                            </p>

                            {/* Rating */}
                            {product.rating && (
                                <div className="flex items-center mb-2">
                                    <span className="text-yellow-500 text-xs">
                                        {'★'.repeat(Math.round(product.rating))}
                                        {'☆'.repeat(5 - Math.round(product.rating))}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-1">({product.reviewCount || 0})</span>
                                </div>
                            )}

                            {/* Price */}
                            <div className="mb-2">
                                {product.isClearance && product.clearanceDiscount > 0 ? (
                                    <>
                                        <p className="text-xs text-gray-400 line-through">
                                            {product.price.toLocaleString()} VND
                                        </p>
                                        <p className="text-lg font-bold text-purple-600">
                                            {Math.round(product.price * (1 - product.clearanceDiscount / 100)).toLocaleString()} VND
                                        </p>
                                    </>
                                ) : product.discount > 0 ? (
                                    <>
                                        <p className="text-xs text-gray-400 line-through">
                                            {product.price.toLocaleString()} VND
                                        </p>
                                        <p className="text-lg font-bold text-red-600">
                                            {(product.finalPrice || product.price - product.discount).toLocaleString()} VND
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-lg font-bold text-red-600">
                                        {product.price.toLocaleString()} VND
                                    </p>
                                )}
                            </div>

                            {/* Stock Status */}
                            <p className="text-xs font-medium">
                                {product.stockQuantity > 0 ? (
                                    <span className="text-green-600">Còn {product.stockQuantity} sản phẩm</span>
                                ) : (
                                    <span className="text-red-600">Hết hàng</span>
                                )}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


function ProductDetail() {
    // Giả định sử dụng react-router-dom để lấy ID
    const { id } = useParams();
    const navigate = useNavigate();
    const statusUser = useSelector((state) => state.user.status);
    const [isAdding, setIsAdding] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const { product, similarProducts, reviews, loading, error, fetchProductDetail, fetchReviews } = useProductDetail();

    useEffect(() => {
        if (id) {
            fetchProductDetail(id);
            fetchReviews(id, 0, 5);
        }
    }, [id, fetchProductDetail, fetchReviews]);

    const handleReviewSubmitted = useCallback(() => {
        // Khi đánh giá được gửi thành công, fetch lại reviews để cập nhật danh sách
        if (id) {
            fetchReviews(id, 0, 5);
        }
    }, [id, fetchReviews]);

    const handleAddToCart = async () => {
        if (!statusUser) {
            if (window.confirm("Bạn chưa đăng nhập. Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.")) {
                navigate("/login");
            }
            return;
        }

        if (!product) return;

        // Kiểm tra số lượng tồn kho
        if (product.stockQuantity !== undefined && product.stockQuantity <= 0) {
            alert("Sản phẩm này đã hết hàng. Vui lòng chọn sản phẩm khác.");
            return;
        }

        if (quantity <= 0) {
            alert("Vui lòng chọn số lượng sản phẩm");
            return;
        }

        // Kiểm tra số lượng không vượt quá tồn kho
        if (product.stockQuantity !== undefined && quantity > product.stockQuantity) {
            alert(`Số lượng tối đa có thể mua là ${product.stockQuantity}`);
            return;
        }

        if (!window.confirm(`Bạn xác nhận thêm ${quantity} sản phẩm này vào giỏ hàng?`)) {
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
            // Tính toán giá cuối cùng (ưu tiên: thanh lý > giảm giá > giá gốc)
            let finalPrice;
            if (product.isClearance && product.clearanceDiscount > 0) {
                finalPrice = product.price * (1 - product.clearanceDiscount / 100);
            } else {
                finalPrice = product.price - (product.discount || 0);
            }
            const total = finalPrice * quantity;

            // Format dữ liệu theo yêu cầu của backend CartItem
            const cartItem = {
                productId: id,
                productName: product.name,
                image: product.image || '',
                price: product.price,
                discount: product.discount || 0,
                isClearance: product.isClearance || false,
                clearanceDiscount: product.clearanceDiscount || 0,
                qty: quantity,
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
            // Có thể navigate đến giỏ hàng hoặc giữ nguyên trang
            // navigate("/cartshopping");
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

    if (loading && !product) return <div className="p-8 text-center">Đang tải chi tiết sản phẩm...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Lỗi: {error}</div>;
    if (!product) return <div className="p-8 text-center">Không tìm thấy sản phẩm.</div>;

    return (
        <div className="container mx-auto p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cột 1: Hình ảnh */}
                <div className="lg:col-span-1">
                    <ImageGallery mainImage={product.image} additionalImages={product.additionalImages} />                </div>
                {/* Cột 2: Thông tin chi tiết */}
                <div className="lg:col-span-2">
                    <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                    <p className="text-gray-500 mb-4">Danh mục: {product.category}</p>

                    {/* Rating */}
                    <div className="flex items-center mb-4">
                        <span className="text-yellow-500 text-xl mr-2">
                            {'★'.repeat(Math.round(product.rating || 0))}
                            {'☆'.repeat(5 - Math.round(product.rating || 0))}
                        </span>
                        <span className="text-gray-600">({product.reviewCount} đánh giá)</span>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                        {/* Clearance badge */}
                        {product.isClearance && (
                            <span className="inline-block bg-purple-600 text-white px-3 py-1 rounded-full text-sm mb-2">
                                🏷️ Thanh lý -{product.clearanceDiscount}%
                            </span>
                        )}
                        {/* Near expiry warning */}
                        {product.isNearExpiry && !product.isClearance && (
                            <span className="inline-block bg-orange-500 text-white px-3 py-1 rounded-full text-sm mb-2">
                                ⏰ Sắp hết hạn
                            </span>
                        )}
                        
                        {/* Original price (if discounted or clearance) */}
                        {(product.isClearance || product.discount > 0) && (
                            <p className="text-xl text-gray-400 line-through">{product.price.toLocaleString()} VND</p>
                        )}
                        
                        {/* Final price */}
                        {product.isClearance && product.clearanceDiscount > 0 ? (
                            <p className="text-4xl font-extrabold text-purple-600">
                                {Math.round(product.price * (1 - product.clearanceDiscount / 100)).toLocaleString()} VND
                            </p>
                        ) : (
                            <p className="text-4xl font-extrabold text-red-600">{product.finalPrice.toLocaleString()} VND</p>
                        )}
                    </div>

                    {/* Description */}
                    <h3 className="text-xl font-semibold mb-2">Mô tả sản phẩm</h3>
                    <p className="text-gray-700 whitespace-pre-line">{product.description}</p>

                    {/* Stock */}
                    <div className="mt-4 text-sm">
                        <p className={product.stockQuantity > 0 ? "text-green-600" : "text-red-600"}>
                            {product.stockQuantity > 0 ? `Còn hàng (${product.stockQuantity})` : 'Hết hàng'}
                        </p>
                        <p className="text-gray-500">Đã bán: {product.soldQuantity}</p>
                    </div>
                    
                    {/* Thông tin hạn sử dụng */}
                    {product.expiryDate && (
                        <div className="mt-4 p-3 rounded-lg border">
                            <h4 className="font-semibold text-gray-700 mb-2">📅 Thông tin sản phẩm</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                {product.manufacturingDate && (
                                    <div>
                                        <span className="text-gray-500">Ngày SX:</span>
                                        <span className="ml-2 font-medium">{product.manufacturingDate}</span>
                                    </div>
                                )}
                                <div>
                                    <span className="text-gray-500">Hạn SD:</span>
                                    <span className={`ml-2 font-medium ${
                                        new Date(product.expiryDate) < new Date() ? 'text-red-600' :
                                        Math.ceil((new Date(product.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) <= 30 
                                            ? 'text-orange-600' : 'text-green-600'
                                    }`}>
                                        {product.expiryDate}
                                        {new Date(product.expiryDate) >= new Date() && (
                                            <span className="ml-1">
                                                ({Math.ceil((new Date(product.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))} ngày)
                                            </span>
                                        )}
                                    </span>
                                </div>
                                {product.batchNumber && (
                                    <div>
                                        <span className="text-gray-500">Số lô:</span>
                                        <span className="ml-2 font-medium">{product.batchNumber}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Badge thanh lý */}
                    {product.isClearance && (
                        <div className="mt-4 p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">🏷️</span>
                                <div>
                                    <p className="font-bold">ĐANG THANH LÝ</p>
                                    <p className="text-sm">Giảm {product.clearanceDiscount}% - Sản phẩm còn hạn sử dụng ngắn</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quantity Selector */}
                    {product.stockQuantity > 0 && (
                        <div className="mt-4 flex items-center gap-4">
                            <label className="font-semibold">Số lượng:</label>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-3 py-1 border rounded hover:bg-gray-100"
                                    disabled={quantity <= 1}
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    max={product.stockQuantity || 999}
                                    value={quantity}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 1;
                                        const max = product.stockQuantity || 999;
                                        setQuantity(Math.max(1, Math.min(val, max)));
                                    }}
                                    className="w-16 text-center border rounded py-1"
                                />
                                <button
                                    onClick={() => {
                                        const max = product.stockQuantity || 999;
                                        setQuantity(Math.min(max, quantity + 1));
                                    }}
                                    className="px-3 py-1 border rounded hover:bg-gray-100"
                                    disabled={product.stockQuantity ? quantity >= product.stockQuantity : false}
                                >
                                    +
                                </button>
                            </div>
                            {product.stockQuantity && (
                                <span className="text-sm text-gray-500">
                                    (Tối đa: {product.stockQuantity})
                                </span>
                            )}
                        </div>
                    )}

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        disabled={isAdding || product.stockQuantity <= 0}
                        className="mt-6 w-full lg:w-1/2 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAdding ? "Đang thêm..." : product.stockQuantity > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
                    </button>
                </div>
            </div>

            {/* Phần Đánh giá và Sản phẩm tương tự */}
            <div className="mt-12 border-t pt-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Cột 1: Form đánh giá */}
                    <div>
                        <ProductReviewForm productId={id} onReviewSubmitted={handleReviewSubmitted} />
                    </div>
                    {/* Cột 2: Danh sách đánh giá */}
                    <div>
                        <ReviewList reviews={reviews} fetchReviews={fetchReviews} productId={id} />
                    </div>
                </div>
            </div>

            {/* Sản phẩm tương tự */}
            <SimilarProducts products={similarProducts} />
        </div>
    );
}

export default ProductDetail;