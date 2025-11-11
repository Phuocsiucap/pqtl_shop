import React, { useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useProductDetail } from '../../hooks/useProductDetail';
import ProductReviewForm from './ProductReviewForm';

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
                        <span className="font-semibold">{review.username}</span>
                        <span className="text-sm text-gray-500">{new Date(review.reviewDate).toLocaleDateString()}</span>
                    </div>
                    <div className="text-yellow-500">
                        {'★'.repeat(review.rating)}
                        {'☆'.repeat(5 - review.rating)}
                    </div>
                    <p className="mt-2 text-gray-700">{review.comment}</p>
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

// Component hiển thị sản phẩm tương tự
const SimilarProducts = ({ products }) => {
    if (!products || products.length === 0) return null;

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Sản phẩm tương tự</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((product) => (
                    <div key={product.id} className="border p-3 rounded-lg">
                        <img src={product.image} alt={product.name} className="w-full h-32 object-cover mb-2"/>
                        <h4 className="text-sm font-semibold truncate">{product.name}</h4>
                        <p className="text-primary font-bold">{product.finalPrice.toLocaleString()} VND</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


function ProductDetail() {
    // Giả định sử dụng react-router-dom để lấy ID
    const { id } = useParams(); 
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

    if (loading && !product) return <div className="p-8 text-center">Đang tải chi tiết sản phẩm...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Lỗi: {error}</div>;
    if (!product) return <div className="p-8 text-center">Không tìm thấy sản phẩm.</div>;

    return (
        <div className="container mx-auto p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cột 1: Hình ảnh */}
                <div className="lg:col-span-1">
                    <img src={product.image} alt={product.name} className="w-full h-auto object-cover rounded-lg shadow-lg"/>
                </div>

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
                        {product.discount > 0 && (
                            <p className="text-xl text-gray-400 line-through">{product.price.toLocaleString()} VND</p>
                        )}
                        <p className="text-4xl font-extrabold text-red-600">{product.finalPrice.toLocaleString()} VND</p>
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

                    {/* Add to Cart Button (Placeholder) */}
                    <button className="mt-6 w-full lg:w-1/2 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition duration-300">
                        Thêm vào giỏ hàng
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