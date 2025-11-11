import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';
// Giả định ProductCard tồn tại và có thể hiển thị sản phẩm từ useSearch.products.content
import ProductCard from '../components/Product/ProductCard'; 

// Component hiển thị một sản phẩm đơn lẻ trong danh sách kết quả tìm kiếm
const SearchProductItem = ({ product }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        // Điều hướng đến trang chi tiết sản phẩm
        navigate(`/products/${product.id}`);
    };

    // Nếu ProductCard không tồn tại, sử dụng một div đơn giản làm placeholder
    if (ProductCard) {
        return (
            <div onClick={handleClick}>
                <ProductCard product={product} />
            </div>
        );
    }

    // Fallback/Placeholder nếu ProductCard không được tìm thấy
    return (
        <div 
            key={product.id} 
            className="border p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 cursor-pointer bg-white"
            onClick={handleClick}
        >
            <img src={product.image || product.imageUrl || 'placeholder.png'} alt={product.name} className="w-full h-40 object-cover mb-3 rounded-md"/>
            <h4 className="text-base font-semibold truncate mb-1">{product.name}</h4>
            <p className="text-lg font-bold text-red-600">{product.finalPrice ? product.finalPrice.toLocaleString() + ' VND' : (product.price ? product.price.toLocaleString() + ' VND' : 'Giá không xác định')}</p>
        </div>
    );
};

// Component chính cho trang kết quả tìm kiếm
function SearchResultPage() {
    const location = useLocation();
    const { search, products, loading, error } = useSearch();

    // Lấy keyword từ query parameter 'q'
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const keyword = queryParams.get('keyword');

    useEffect(() => {
        if (keyword) {
            // Gọi API tìm kiếm khi keyword thay đổi hoặc component được mount
            search({ keyword: keyword });
        }
    }, [keyword, search]);

    // Xử lý trạng thái tải
    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
                <p className="text-xl text-gray-600">Đang tải kết quả tìm kiếm cho "{keyword}"...</p>
            </div>
        );
    }

    // Xử lý thông báo lỗi
    if (error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-red-50 border border-red-300 rounded-lg m-4">
                <p className="text-2xl text-red-700 font-bold mb-2">Lỗi Tìm Kiếm</p>
                <p className="text-red-600">{error}</p>
                <p className="text-sm mt-2">Vui lòng thử lại sau.</p>
            </div>
        );
    }

    // Xử lý không có kết quả
    if (!products || products.content.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-white m-4 rounded-lg shadow-md">
                <p className="text-2xl text-gray-700 font-bold mb-2">Không tìm thấy sản phẩm</p>
                <p className="text-gray-500">Rất tiếc, không có sản phẩm nào phù hợp với từ khóa: "{keyword}"</p>
            </div>
        );
    }

    // Hiển thị kết quả
    return (
        <div className="container mx-auto p-4 bg-gray-50 min-h-[60vh]">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">
                Kết quả tìm kiếm cho: "{keyword}" 
                ({products.totalElements} sản phẩm)
            </h1>

            {/* Bộ lọc/Phân trang (Placeholder) */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 p-3 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-2 lg:mb-0">
                    Hiển thị {products.content.length} trên {products.totalElements} kết quả.
                </p>
                {/* Bộ lọc (Placeholder) */}
                <div className="mb-3 lg:mb-0 lg:mr-6">
                    <p className="text-sm font-bold text-gray-700">Bộ lọc: (Cần triển khai)</p>
                </div>
                {/* Phân trang */}
                <div className="space-x-2">
                    <button disabled={products.first} className="px-3 py-1 border rounded disabled:opacity-50 bg-gray-100 hover:bg-gray-200">Trước</button>
                    <span className="text-sm">Trang {products.number + 1} / {products.totalPages}</span>
                    <button disabled={products.last} className="px-3 py-1 border rounded disabled:opacity-50 bg-gray-100 hover:bg-gray-200">Sau</button>
                </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {products.content.map((product) => (
                    <SearchProductItem key={product.id} product={product} />
                ))}
            </div>
            
        </div>
    );
}

export default SearchResultPage;