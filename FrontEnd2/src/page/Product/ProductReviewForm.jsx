import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useProductDetail } from '../../hooks/useProductDetail';
import { request1 } from '../../utils/request';

// ProductReviewForm nhận productId và một hàm callback khi gửi thành công
function ProductReviewForm({ productId, onReviewSubmitted }) {
    const { addReview } = useProductDetail();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [checkingEligibility, setCheckingEligibility] = useState(true);
    const [eligibility, setEligibility] = useState({
        canReview: false,
        hasPurchased: false,
        hasReviewed: false
    });

    // Lấy thông tin người dùng từ Redux store
    const user = useSelector((state) => state.user.user);
    const isLoggedIn = useSelector((state) => state.user.status);

    // Kiểm tra điều kiện đánh giá khi component mount hoặc productId thay đổi
    useEffect(() => {
        const checkEligibility = async () => {
            if (!isLoggedIn || !user?.id || !productId) {
                setCheckingEligibility(false);
                setEligibility({ canReview: false, hasPurchased: false, hasReviewed: false });
                return;
            }

            setCheckingEligibility(true);
            try {
                const response = await request1.get(`/v1/products/${productId}/review-eligibility`, {
                    params: { userId: user.id }
                });
                setEligibility(response.data);
            } catch (err) {
                console.error('Error checking review eligibility:', err);
                setEligibility({ canReview: false, hasPurchased: false, hasReviewed: false });
            } finally {
                setCheckingEligibility(false);
            }
        };

        checkEligibility();
    }, [productId, user?.id, isLoggedIn]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment || rating === 0) {
            setError('Vui lòng nhập đánh giá và chọn số sao.');
            return;
        }

        if (!eligibility.canReview) {
            setError('Bạn không có quyền đánh giá sản phẩm này.');
            return;
        }

        setLoading(true);
        setError(null);

        const newReview = {
            userId: user.id,
            username: user.username || user.fullName || 'Người dùng',
            rating: rating,
            comment: comment,
        };

        const result = await addReview(productId, newReview);

        if (result) {
            setComment('');
            setRating(5);
            setEligibility(prev => ({ ...prev, canReview: false, hasReviewed: true }));
            if (onReviewSubmitted) {
                onReviewSubmitted(result);
            }
        } else {
            setError('Gửi đánh giá thất bại. Vui lòng thử lại.');
        }
        setLoading(false);
    };

    // Hiển thị loading khi đang kiểm tra điều kiện
    if (checkingEligibility) {
        return (
            <div className="mt-8 p-4 border rounded-lg shadow-md">
                <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2 text-gray-600">Đang kiểm tra...</span>
                </div>
            </div>
        );
    }

    // Nếu chưa đăng nhập
    if (!isLoggedIn) {
        return (
            <div className="mt-8 p-4 border rounded-lg shadow-md bg-gray-50">
                <h3 className="text-xl font-bold mb-4">Viết đánh giá của bạn</h3>
                <div className="text-center py-4">
                    <p className="text-gray-600 mb-2">Bạn cần đăng nhập để đánh giá sản phẩm</p>
                    <a href="/login" className="text-primary hover:underline">Đăng nhập ngay</a>
                </div>
            </div>
        );
    }

    // Nếu chưa mua sản phẩm
    if (!eligibility.hasPurchased) {
        return (
            <div className="mt-8 p-4 border rounded-lg shadow-md bg-yellow-50">
                <h3 className="text-xl font-bold mb-4">Viết đánh giá của bạn</h3>
                <div className="text-center py-4">
                    <div className="text-yellow-600 mb-2">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="font-medium">Bạn cần mua sản phẩm này trước khi đánh giá</p>
                    </div>
                    <p className="text-sm text-gray-500">Chỉ khách hàng đã mua và nhận hàng mới có thể đánh giá sản phẩm</p>
                </div>
            </div>
        );
    }

    // Nếu đã đánh giá rồi
    if (eligibility.hasReviewed) {
        return (
            <div className="mt-8 p-4 border rounded-lg shadow-md bg-green-50">
                <h3 className="text-xl font-bold mb-4">Viết đánh giá của bạn</h3>
                <div className="text-center py-4">
                    <div className="text-green-600 mb-2">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-medium">Bạn đã đánh giá sản phẩm này</p>
                    </div>
                    <p className="text-sm text-gray-500">Cảm ơn bạn đã chia sẻ trải nghiệm!</p>
                </div>
            </div>
        );
    }

    // Form đánh giá bình thường
    return (
        <div className="mt-8 p-4 border rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Viết đánh giá của bạn</h3>
            <div className="mb-4 p-2 bg-green-50 rounded text-sm text-green-700">
                ✓ Bạn đã mua sản phẩm này và có thể đánh giá
            </div>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Đánh giá sao:</label>
                    <div className="flex items-center space-x-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                className={`cursor-pointer text-2xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                                onClick={() => setRating(star)}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Bình luận:</label>
                    <textarea
                        id="comment"
                        rows="4"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                        disabled={loading}
                    ></textarea>
                </div>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <button
                    type="submit"
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'}`}
                    disabled={loading}
                >
                    {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
            </form>
        </div>
    );
}

export default ProductReviewForm;