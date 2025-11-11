import React, { useEffect, useState } from 'react';
import { useSearch } from '../../../../../../hooks/useSearch';
import { useNavigate } from 'react-router-dom';

// Giả định component này nhận `keyword` từ thanh input chính (là mảng các từ)
function Search({ search: keywordArray }) {
    const { search, products, history, loading, fetchHistory } = useSearch();
    const navigate = useNavigate();
    
    // Giả định userId được lấy từ Auth Context hoặc tương tự
    const userId = 'current_user_id'; // Thay thế bằng logic lấy ID người dùng thực tế

    const handleNavigateToSearch = () => {
        if (searchKeywordString) {
            navigate(`/search?keyword=${encodeURIComponent(searchKeywordString)}`);
        }
    };

    const handleNavigateToProductDetail = (productId) => {
        navigate(`/products/${productId}`);
    };

    const handleHistoryClick = (keyword) => {
        navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
    };

    // Chuyển mảng keyword thành chuỗi để gọi API tìm kiếm
    const searchKeywordString = keywordArray && keywordArray.length > 0 ? keywordArray.join(' ') : undefined;

    useEffect(() => {
        // Chỉ fetch lịch sử nếu người dùng đã đăng nhập
        if (userId) {
            fetchHistory(userId);
        }
    }, [fetchHistory, userId]);

    // Gọi API tìm kiếm khi chuỗi từ khóa thay đổi
    useEffect(() => {
        if (searchKeywordString) {
            // Gọi API tìm kiếm
            search({ keyword: searchKeywordString });
        }
    }, [searchKeywordString, search]);

    // Logic hiển thị gợi ý/kết quả
    const displayHistory = history || [];
    const isSearching = searchKeywordString && searchKeywordString.length > 0;

    return (
        <div className=" max-h-[50%] w-svw lg:w-[700px] xl:w-[900px] z-10 bg-white font-Montserrat text-left ">
           <div className="text-base lg:text-xl font-bold text-primary py-5 px-5">
            {
                loading ? (
                    <span>Đang tìm kiếm...</span>
                ) : isSearching ? (
                    products?.content?.length > 0 ?
                        <span>Kết quả tìm kiếm cho "{searchKeywordString}" ({products.totalElements} sản phẩm)</span>
                        :
                        <span>Không tìm thấy kết quả nào cho "{searchKeywordString}"</span>
                ) : (
                    <span>Lịch sử tìm kiếm gần đây</span>)
            }
           </div>
           {isSearching && (
               <div className="px-5 py-3 border-b border-gray-200 hover:bg-gray-100 cursor-pointer" onClick={handleNavigateToSearch}>
                   <span className="text-primary font-bold text-sm lg:text-base">Xem tất cả kết quả cho "{searchKeywordString}"</span>
               </div>
           )}
           <ul className="font-semibold text-xs lg:text-sm">
            {
                isSearching && products?.content ? (
                    products.content.map((product) => (
                        <li key={product.id} className=" cursor-pointer px-5 py-3 text-gray-600 hover:bg-gray-200 hover:text-primary hover:font-bold transition-all duration-500 ease-in-out" onClick={() => handleNavigateToProductDetail(product.id)}>
                            {product.name} - {product.finalPrice}đ
                        </li>
                    ))
                ) : !isSearching && displayHistory.length > 0 ? (
                    displayHistory.map((item, index) => (
                        <li key={index} className=" cursor-pointer px-5 py-3 text-gray-600 hover:bg-gray-200 hover:text-primary hover:font-bold transition-all duration-500 ease-in-out" onClick={() => handleHistoryClick(item.keyword)}>
                            {item.keyword}
                        </li>
                    ))
                ) : (
                    <li className="px-5 py-3 text-gray-400">
                        {isSearching ? "Không tìm thấy gợi ý nào." : "Chưa có lịch sử tìm kiếm."}
                    </li>
                )
            }
           </ul>
        </div>
     );
}

export default Search;
