import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, Gift, Clock, TrendingUp } from 'lucide-react';

const Header = ({ user, cartCount }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Theo dõi URL để đóng suggestion khi chuyển page
  const wrapperRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Gợi ý tìm kiếm
  const recentSearches = ["Rau cải xanh hữu cơ", "Cà chua Đà Lạt"];
  const trendingSearches = ["Cá hồi phi lê Na Uy", "Bò Mỹ nhập khẩu", "Táo Envy New Zealand"];

  // Hàm xử lý search
  const handleSearch = (query) => {
    if (!query.trim()) return;
    navigate(`/api/products/search?keyword=${encodeURIComponent(query)}`);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  // Ẩn dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ẩn dropdown khi path thay đổi (ví dụ nhấn nút Back)
  useEffect(() => {
    setShowSuggestions(false);
  }, [location.pathname]);

  // Lọc suggestions dựa trên input
  const filteredSuggestions = recentSearches
    .concat(trendingSearches)
    .filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 text-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span>🎉 Miễn phí vận chuyển cho đơn hàng từ 500K</span>
          <span>Hotline: 1900-xxxx</span>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo + menu mobile */}
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-blue-600 cursor-pointer" onClick={() => navigate('/')}>
              🛍️ SHOPNAME
            </h1>
            <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Search desktop */}
          <div ref={wrapperRef} className="hidden lg:flex flex-1 max-w-2xl relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full px-4 py-2 pl-10 border-2 border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => setShowSuggestions(searchQuery.length > 0)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(searchQuery) }}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />

            {/* Suggestion dropdown */}
            {showSuggestions && (
              <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-50">
                {/* Recent searches */}
                {searchQuery === "" && recentSearches.length > 0 && (
                  <div className="p-2 border-b">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Clock size={14} /> Tìm kiếm gần đây
                    </p>
                    {recentSearches.map((item, idx) => (
                      <div
                        key={idx}
                        className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSearch(item)}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}

                {/* Trending searches */}
                <div className="p-2">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <TrendingUp size={14} /> Xu hướng tìm kiếm
                  </p>
                  {(searchQuery ? filteredSuggestions : trendingSearches).map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSearch(item)}
                      className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 cursor-pointer"
                    >
                      <TrendingUp size={16} /> {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-6">
            {user.isLoggedIn ? (
              <div className="hidden lg:flex items-center gap-2 text-sm">
                <User size={20} className="text-blue-600" />
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-orange-600 flex items-center gap-1">
                    <Gift size={12} /> {user.points} điểm • {user.tier}
                  </p>
                </div>
              </div>
            ) : (
              <button
                className="hidden lg:block text-blue-600 hover:text-blue-700 font-medium"
                onClick={() => navigate('/login')}
              >
                Đăng nhập / Đăng ký
              </button>
            )}

            <button className="relative hover:text-blue-600 transition">
              <Heart size={24} />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
            </button>

            <button className="relative hover:text-blue-600 transition">
              <ShoppingCart size={24} />
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>
            </button>
          </div>
        </div>

        {/* Search mobile */}
        <div className="lg:hidden mt-4" ref={wrapperRef}>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full px-4 py-2 pl-10 border-2 border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSuggestions(searchQuery.length > 0)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(searchQuery) }}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          {showSuggestions && (
            <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-50 p-2">
              {(searchQuery ? filteredSuggestions : trendingSearches).map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSearch(item)}
                  className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 cursor-pointer"
                >
                  <TrendingUp size={16} /> {item}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
