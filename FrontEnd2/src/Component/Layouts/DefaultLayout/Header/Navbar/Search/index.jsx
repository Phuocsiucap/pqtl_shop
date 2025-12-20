import React, { useEffect, useState } from 'react';
import { useSearch } from '../../../../../../hooks/useSearch';
import { useNavigate } from 'react-router-dom';
import { getFullImageUrl, request1 } from '../../../../../../utils/request';
import { PricetoString } from '../../../../../Translate_Price';
import { FaHistory, FaSearch, FaTimes, FaFire } from 'react-icons/fa';

function Search({ keyword, onClose }) {
    const { search, products, loading } = useSearch();
    const navigate = useNavigate();
    const [localHistory, setLocalHistory] = useState([]);
    const [popularKeywords, setPopularKeywords] = useState([]);

    // Lấy userId từ localStorage (giả sử user đã login)
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.id || 'guest';
    const historyKey = `search_history_${userId}`;

    // Load lịch sử từ LocalStorage khi mount
    useEffect(() => {
        try {
            const storedHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
            setLocalHistory(Array.isArray(storedHistory) ? storedHistory : []);
        } catch (e) {
            setLocalHistory([]);
        }
    }, [historyKey]);

    // Fetch popular keywords (Best Sellers)
    useEffect(() => {
        const fetchPopular = async () => {
            try {
                // Gọi API lấy top sản phẩm bán chạy (dùng axios instance request1 nếu baseURL đã đúng)
                // Endpoint: /homepage/bestsellers (Prefix /api/v1 đã có trong baseURL request1 nếu config đúng)
                // Kiểm tra lại config request1: baseURL: 'http://127.0.0.1:8080/api/' -> Gọi /v1/homepage/bestsellers
                const response = await request1.get('/v1/homepage/bestsellers');
                if (response.data && Array.isArray(response.data)) {
                    // Lấy tên 6 sản phẩm đầu tiên làm từ khóa
                    const keywords = response.data.slice(0, 6).map(p => p.name);
                    setPopularKeywords(keywords);
                }
            } catch (error) {
                console.error("Failed to fetch popular keywords", error);
                // Fallback nếu lỗi
                setPopularKeywords(["Rau sạch", "Trái cây", "Thịt heo", "Gạo ngon"]);
            }
        };
        fetchPopular();
    }, []);

    const saveToHistory = (kw) => {
        if (!kw || !kw.trim()) return;
        const cleanKw = kw.trim();
        let newHistory = [cleanKw, ...localHistory.filter(h => h !== cleanKw)];
        // Giới hạn 10 items
        newHistory = newHistory.slice(0, 10);
        setLocalHistory(newHistory);
        localStorage.setItem(historyKey, JSON.stringify(newHistory));
    };

    const removeFromHistory = (e, kwToRemove) => {
        e.stopPropagation(); // Tránh kích hoạt click tìm kiếm
        const newHistory = localHistory.filter(h => h !== kwToRemove);
        setLocalHistory(newHistory);
        localStorage.setItem(historyKey, JSON.stringify(newHistory));
    };

    const clearHistory = () => {
        setLocalHistory([]);
        localStorage.removeItem(historyKey);
    };

    const handleNavigateToSearch = (overrideKeyword) => {
        const searchKw = overrideKeyword || keyword;
        if (searchKw && searchKw.trim()) {
            saveToHistory(searchKw);
            navigate(`/search?keyword=${encodeURIComponent(searchKw.trim())}`);
            if (onClose && typeof onClose === 'function') onClose();
        }
    };

    const handleNavigateToProductDetail = (productId) => {
        // Lưu từ khóa hiện tại vào lịch sử khi click sản phẩm
        if (keyword) saveToHistory(keyword);
        navigate(`/products/${productId}`);
        if (onClose && typeof onClose === 'function') onClose();
    };

    // Auto-search khi keyword thay đổi
    useEffect(() => {
        if (keyword && keyword.trim()) {
            search({ keyword: keyword.trim(), size: 6 });
        }
    }, [keyword, search]);

    const isSearching = keyword && keyword.trim().length > 0;

    // Fuzzy matching đơn giản cho từ khóa gợi ý (History & Popular)
    const getFuzzySuggestions = () => {
        if (!keyword || !keyword.trim()) return [];
        const searchLower = keyword.toLowerCase().trim();

        // Gộp history và popular
        const allKeywords = [...new Set([...localHistory, ...popularKeywords])];

        return allKeywords.filter(kw => {
            const kwLower = kw.toLowerCase();
            // Match nếu chứa từ khóa hoặc match từng ký tự (đơn giản)
            return kwLower.includes(searchLower);
        }).slice(0, 5); // Lấy 5 gợi ý tốt nhất
    };

    const suggestedKeywords = getFuzzySuggestions();

    // Highlight từ khóa trong tên sản phẩm
    const HighlightText = ({ text, highlight }) => {
        if (!highlight || !text) return <span>{text}</span>;
        try {
            const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
            return (
                <span>
                    {parts.map((part, i) =>
                        part.toLowerCase() === highlight.toLowerCase() ? (
                            <span key={i} className="text-primary font-bold">{part}</span>
                        ) : (
                            <span key={i}>{part}</span>
                        )
                    )}
                </span>
            );
        } catch (e) {
            return <span>{text}</span>;
        }
    };

    return (
        <div className="absolute top-full left-0 w-full md:w-[800px] bg-white font-Montserrat text-left shadow-2xl rounded-b-xl border-t border-gray-100 overflow-hidden z-[9999] -ml-[100px] md:ml-0">
            {isSearching ? (
                <div className="flex flex-col md:flex-row">
                    {/* Cột trái: Gợi ý từ khóa (nếu có) */}
                    {suggestedKeywords.length > 0 && (
                        <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-100 p-2">
                            <div className="px-3 py-2 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                                Từ khóa phù hợp
                            </div>
                            <ul>
                                {suggestedKeywords.map((kw, idx) => (
                                    <li
                                        key={idx}
                                        onClick={() => handleNavigateToSearch(kw)}
                                        className="px-3 py-2 text-sm text-gray-700 hover:bg-white hover:text-primary hover:shadow-sm rounded-md cursor-pointer transition-all flex items-center gap-2"
                                    >
                                        <FaSearch className="text-gray-400 text-xs" />
                                        <HighlightText text={kw} highlight={keyword} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Cột phải: Sản phẩm gợi ý */}
                    <div className={`w-full ${suggestedKeywords.length > 0 ? 'md:w-2/3' : 'md:w-full'}`}>
                        <div className="bg-white px-4 py-2 text-xs text-gray-500 font-medium border-b border-gray-100 flex justify-between items-center">
                            <span>{loading ? "Đang tìm kiếm..." : "Sản phẩm gợi ý"}</span>
                            {!loading && products?.content?.length > 0 && (
                                <button
                                    onClick={() => handleNavigateToSearch()}
                                    className="text-primary hover:underline flex items-center gap-1"
                                >
                                    Xem tất cả <span className="text-xs">({products.totalElements || products.content.length})</span>
                                </button>
                            )}
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                </div>
                            ) : products?.content?.length > 0 ? (
                                <ul className="grid grid-cols-1 gap-1">
                                    {products.content.map((product) => (
                                        <li
                                            key={product.id}
                                            onClick={() => handleNavigateToProductDetail(product.id)}
                                            className="flex items-center gap-4 p-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-all group"
                                        >
                                            <div className="relative w-14 h-14 flex-shrink-0 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm group-hover:border-blue-200 transition-colors">
                                                <img
                                                    src={getFullImageUrl(product.image)}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain p-0.5"
                                                    onError={(e) => { e.target.src = "https://via.placeholder.com/60" }}
                                                />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-primary transition-colors">
                                                    <HighlightText text={product.name} highlight={keyword} />
                                                </p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-sm font-bold text-red-600">
                                                        {PricetoString(product.finalPrice || product.price)}đ
                                                    </span>
                                                    {product.discount > 0 && (
                                                        <span className="text-xs text-gray-400 line-through bg-gray-100 px-1 rounded">
                                                            {PricetoString(product.price)}đ
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="px-4 py-8 text-center text-gray-500 text-sm flex flex-col items-center">
                                    <FaSearch className="text-gray-300 text-3xl mb-2" />
                                    <p>Không tìm thấy sản phẩm nào.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                // Lịch sử tìm kiếm & Từ khóa hot
                <div className="p-4">
                    {/* Lịch sử */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <FaHistory className="text-gray-400" />
                                Lịch sử tìm kiếm
                            </h3>
                            {localHistory.length > 0 && (
                                <button
                                    onClick={clearHistory}
                                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    Xóa lịch sử
                                </button>
                            )}
                        </div>

                        {localHistory.length > 0 ? (
                            <div className="flex flex-col">
                                {localHistory.map((item, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleNavigateToSearch(item)}
                                        className="flex justify-between items-center px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer group transition-colors"
                                    >
                                        <span className="text-sm text-gray-600">{item}</span>
                                        <button
                                            onClick={(e) => removeFromHistory(e, item)}
                                            className="text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic pl-6">Chưa có lịch sử tìm kiếm.</p>
                        )}
                    </div>

                    {/* Từ khóa Hot (Giả lập hoặc lấy từ API) */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <FaFire className="text-red-500" />
                            Tìm kiếm phổ biến
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {popularKeywords.length > 0 ? (
                                popularKeywords.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        onClick={() => handleNavigateToSearch(tag)}
                                        className="px-3 py-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 text-sm rounded-full cursor-pointer transition-colors border border-transparent hover:border-blue-100 truncate max-w-[200px]"
                                        title={tag}
                                    >
                                        {tag}
                                    </span>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400 italic">Đang tải...</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Search;
