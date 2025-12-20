import React, { useState, useEffect } from 'react';
import { request1 } from '../../../utils/request';
import { getCSRFTokenFromCookie } from '../../../Component/Token/getCSRFToken';

function ReviewManagement() {
    const [reviews, setReviews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [filter, setFilter] = useState('all'); // 'all' or 'unreplied'
    const [stats, setStats] = useState({ unrepliedCount: 0 });
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Lấy token admin từ cookie
    const access_token = getCSRFTokenFromCookie("access_token_admin");
    
    // Lấy tên admin từ localStorage
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    const adminName = adminUser.username || adminUser.fullName || 'Admin';

    // Config headers với token
    const config = {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    };

    // Fetch reviews
    const fetchReviews = async () => {
        setLoading(true);
        try {
            const filterParam = filter === 'unreplied' ? '?filter=unreplied&' : '?';
            const response = await request1.get(`/v1/admin/reviews${filterParam}page=${page}&size=10`, config);
            setReviews(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError('Không thể tải danh sách đánh giá');
        } finally {
            setLoading(false);
        }
    };

    // Fetch stats
    const fetchStats = async () => {
        try {
            const response = await request1.get('/v1/admin/reviews/stats', config);
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    useEffect(() => {
        fetchReviews();
        fetchStats();
    }, [page, filter]);

    // Mở modal phản hồi
    const openReplyModal = (review) => {
        setSelectedReview(review);
        setReplyText(review.adminReply || '');
        setReplyModalOpen(true);
    };

    // Đóng modal
    const closeReplyModal = () => {
        setReplyModalOpen(false);
        setSelectedReview(null);
        setReplyText('');
    };

    // Gửi phản hồi
    const handleSubmitReply = async () => {
        if (!replyText.trim()) {
            alert('Vui lòng nhập nội dung phản hồi');
            return;
        }

        setSubmitting(true);
        try {
            await request1.post(`/v1/admin/reviews/${selectedReview.id}/reply`, {
                adminReply: replyText,
                adminName: adminName
            }, config);
            closeReplyModal();
            fetchReviews();
            fetchStats();
        } catch (err) {
            console.error('Error submitting reply:', err);
            alert('Không thể gửi phản hồi. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    // Toggle visibility
    const handleToggleVisibility = async (reviewId) => {
        try {
            await request1.put(`/v1/admin/reviews/${reviewId}/toggle-visibility`, {}, config);
            fetchReviews();
        } catch (err) {
            console.error('Error toggling visibility:', err);
            alert('Không thể thay đổi trạng thái. Vui lòng thử lại.');
        }
    };

    // Delete review
    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
            return;
        }

        try {
            await request1.delete(`/v1/admin/reviews/${reviewId}`, config);
            fetchReviews();
            fetchStats();
        } catch (err) {
            console.error('Error deleting review:', err);
            alert('Không thể xóa đánh giá. Vui lòng thử lại.');
        }
    };

    // Render stars
    const renderStars = (rating) => {
        return (
            <span className="text-yellow-500">
                {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
            </span>
        );
    };

    if (loading && !reviews) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
                <button 
                    onClick={fetchReviews}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý đánh giá sản phẩm</h1>
                <p className="text-gray-600 mt-1">Xem và phản hồi đánh giá từ khách hàng</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-500">Tổng đánh giá</p>
                            <p className="text-2xl font-bold text-gray-800">{reviews?.totalElements || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-500">Chưa phản hồi</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.unrepliedCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 text-green-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-500">Đã phản hồi</p>
                            <p className="text-2xl font-bold text-green-600">
                                {(reviews?.totalElements || 0) - stats.unrepliedCount}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="border-b">
                    <div className="flex">
                        <button
                            onClick={() => { setFilter('all'); setPage(0); }}
                            className={`px-6 py-3 font-medium ${filter === 'all' 
                                ? 'text-blue-600 border-b-2 border-blue-600' 
                                : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => { setFilter('unreplied'); setPage(0); }}
                            className={`px-6 py-3 font-medium flex items-center ${filter === 'unreplied' 
                                ? 'text-blue-600 border-b-2 border-blue-600' 
                                : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Chưa phản hồi
                            {stats.unrepliedCount > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                    {stats.unrepliedCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Reviews List */}
                <div className="p-4">
                    {reviews?.content?.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            <p>Không có đánh giá nào</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews?.content?.map((review) => (
                                <div key={review.id} className={`border rounded-lg p-4 ${!review.isVisible ? 'bg-gray-50 opacity-60' : ''}`}>
                                    {/* Review Header */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-800">{review.username}</span>
                                                {renderStars(review.rating)}
                                                {!review.isVisible && (
                                                    <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                                                        Đã ẩn
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Sản phẩm: <span className="font-medium">{review.productName || review.productId}</span>
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(review.reviewDate).toLocaleString('vi-VN')}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openReplyModal(review)}
                                                className={`px-3 py-1 text-sm rounded ${review.adminReply 
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                                            >
                                                {review.adminReply ? 'Sửa phản hồi' : 'Phản hồi'}
                                            </button>
                                            <button
                                                onClick={() => handleToggleVisibility(review.id)}
                                                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                            >
                                                {review.isVisible ? 'Ẩn' : 'Hiện'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteReview(review.id)}
                                                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </div>

                                    {/* Review Content */}
                                    <div className="bg-gray-50 p-3 rounded mb-3">
                                        <p className="text-gray-700">{review.comment}</p>
                                    </div>

                                    {/* Admin Reply */}
                                    {review.adminReply && (
                                        <div className="ml-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                                            <div className="flex items-center mb-1">
                                                <span className="font-semibold text-blue-700 text-sm">
                                                    Phản hồi từ {review.adminReplyBy || 'Admin'}
                                                </span>
                                                <span className="ml-2 text-xs text-gray-500">
                                                    {review.adminReplyDate && new Date(review.adminReplyDate).toLocaleString('vi-VN')}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 text-sm">{review.adminReply}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {reviews?.totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-6">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={reviews.first}
                                className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Trước
                            </button>
                            <span className="text-gray-600">
                                Trang {reviews.number + 1} / {reviews.totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={reviews.last}
                                className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Reply Modal */}
            {replyModalOpen && selectedReview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
                        <div className="p-4 border-b">
                            <h3 className="text-lg font-semibold">Phản hồi đánh giá</h3>
                        </div>
                        <div className="p-4">
                            {/* Original Review */}
                            <div className="bg-gray-50 p-3 rounded mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-semibold">{selectedReview.username}</span>
                                    {renderStars(selectedReview.rating)}
                                </div>
                                <p className="text-gray-700 text-sm">{selectedReview.comment}</p>
                            </div>

                            {/* Reply Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nội dung phản hồi
                                </label>
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    rows="4"
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nhập nội dung phản hồi..."
                                ></textarea>
                            </div>
                        </div>
                        <div className="p-4 border-t flex justify-end gap-3">
                            <button
                                onClick={closeReplyModal}
                                className="px-4 py-2 border rounded hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmitReply}
                                disabled={submitting}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReviewManagement;
