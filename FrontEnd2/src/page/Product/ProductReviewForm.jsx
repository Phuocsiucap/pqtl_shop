import React, { useState } from 'react';
import { useProductDetail } from '../../hooks/useProductDetail';

// Giả định ProductReviewForm nhận productId và một hàm callback khi gửi thành công
function ProductReviewForm({ productId, onReviewSubmitted }) {
    const { addReview } = useProductDetail();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Giả định lấy thông tin người dùng từ context/auth
    const mockUserId = 'user123';
    const mockUsername = 'AnonymousUser';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment || rating === 0) {
            setError('Vui lòng nhập đánh giá và chọn số sao.');
            return;
        }

        setLoading(true);
        setError(null);

        const newReview = {
            userId: mockUserId,
            username: mockUsername,
            rating: rating,
            comment: comment,
        };

        const result = await addReview(productId, newReview);

        if (result) {
            setComment('');
            setRating(5);
            if (onReviewSubmitted) {
                onReviewSubmitted(result);
            }
        } else {
            setError('Gửi đánh giá thất bại. Vui lòng thử lại.');
        }
        setLoading(false);
    };

    return (
        <div className="mt-8 p-4 border rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Viết đánh giá của bạn</h3>
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