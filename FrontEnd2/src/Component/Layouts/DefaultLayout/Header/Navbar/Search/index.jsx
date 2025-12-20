import React, { useEffect } from 'react';
import { useSearch } from '../../../../../../hooks/useSearch';
import { useNavigate } from 'react-router-dom';
import { getFullImageUrl } from '../../../../../../utils/request';
import { PricetoString } from '../../../../../Translate_Price';

function Search({ keyword }) {
    const { search, products, history, loading, fetchHistory } = useSearch();
    const navigate = useNavigate();

    // Giả định userId được lấy từ Auth Context hoặc tương tự
    // Trong thực tế bạn nên lấy từ Redux store: useSelector(state => state.user.user?.id)
    const userId = 'current_user_id';

    const handleNavigateToSearch = () => {
        if (keyword && keyword.trim()) {
            navigate(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
        }
    };

    const handleNavigateToProductDetail = (productId) => {
        navigate(`/products/${productId}`);
    };

    const handleHistoryClick = (historyKeyword) => {
        navigate(`/search?keyword=${encodeURIComponent(historyKeyword)}`);
    };

    useEffect(() => {
        // Chỉ fetch lịch sử nếu người dùng đã đăng nhập (hoặc logic tùy bạn)
        // fetchHistory(userId); 
        // Tạm thời comment userId để tránh lỗi nếu hook yêu cầu auth thật
        fetchHistory();
    }, [fetchHistory]);

    // Gọi API tìm kiếm khi keyword thay đổi (debounce đã được xử lý trong hook hoặc nên xử lý ở input cha)
    // Ở component Navbar cha, onChange cập nhật state 'search'.
    // Ở đây ta nhận prop 'keyword'. 
    // Nếu muốn debounce, tốt nhất là làm ở Navbar. 
    // Nhưng useSearch hook có thể đã xử lý. Ta cứ gọi search khi keyword đổi.

    useEffect(() => {
        if (keyword && keyword.trim()) {
            search({ keyword: keyword.trim(), size: 5 }); // Limit 5 kết quả cho dropdown
        }
    }, [keyword, search]);

    const displayHistory = Array.isArray(history) ? history : [];
    const isSearching = keyword && keyword.trim().length > 0;

    return (
        <div className="w-screen max-w-[95vw] lg:w-[600px] xl:w-[800px] z-50 bg-white font-Montserrat text-left shadow-xl rounded-lg border border-gray-100 overflow-hidden">
            {isSearching ? (
                <>
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                            {loading ? "Đang tìm kiếm..." : `Kết quả cho "${keyword}"`}
                        </span>
                        {!loading && products?.content?.length > 0 && (
                            <span
                                onClick={handleNavigateToSearch}
                                className="text-xs font-semibold text-primary cursor-pointer hover:underline"
                            >
                                Xem tất cả
                            </span>
                        )}
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            </div>
                        ) : products?.content?.length > 0 ? (
                            <ul>
                                {products.content.map((product) => (
                                    <li
                                        key={product.id}
                                        onClick={() => handleNavigateToProductDetail(product.id)}
                                        className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b last:border-0 border-gray-100"
                                    >
                                        <div className="flex-shrink-0 border border-gray-200 rounded-md overflow-hidden w-12 h-12">
                                            <img
                                                src={getFullImageUrl(product.image)}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.src = "https://via.placeholder.com/50" }}
                                            />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-sm font-bold text-red-500">
                                                    {PricetoString(product.finalPrice || product.price)}đ
                                                </span>
                                                {product.discount > 0 && (
                                                    <span className="text-xs text-gray-400 line-through">
                                                        {PricetoString(product.price)}đ
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                Không tìm thấy sản phẩm nào phù hợp.
                            </div>
                        )}
                    </div>

                    {!loading && products?.content?.length > 0 && (
                        <div
                            onClick={handleNavigateToSearch}
                            className="block text-center py-3 bg-gray-50 text-sm text-primary font-semibold hover:bg-gray-100 cursor-pointer border-t border-gray-100"
                        >
                            Xem thêm kết quả
                        </div>
                    )}
                </>
            ) : (
                // Lịch sử tìm kiếm
                <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Lịch sử tìm kiếm
                    </h3>
                    {displayHistory.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {displayHistory.slice(0, 10).map((item, index) => (
                                <span
                                    key={index}
                                    onClick={() => handleHistoryClick(item.keyword)}
                                    className="inline-block px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full cursor-pointer transition-colors"
                                >
                                    {item.keyword}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 italic">Chưa có lịch sử tìm kiếm.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default Search;
