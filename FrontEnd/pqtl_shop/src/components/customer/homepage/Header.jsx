import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Heart, User, Menu, X, Gift } from 'lucide-react';

const Header = ({ user, cartCount, onSearch }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = ["áo thun", "giày thể thao", "quần jean", "túi xách", "đồng hồ"];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 text-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span>🎉 Miễn phí vận chuyển cho đơn hàng từ 500K</span>
          <span>Hotline: 1900-xxxx</span>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">🛍️ SHOPNAME</h1>
            
            <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <div className="hidden lg:flex flex-1 max-w-2xl relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full px-4 py-2 pl-10 pr-4 border-2 border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onFocus={() => setShowSuggestions(searchQuery.length > 0)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              
              {showSuggestions && (
                <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg">
                  {suggestions.filter(s => s.includes(searchQuery.toLowerCase())).map((suggestion, idx) => (
                    <div key={idx} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      <Search size={16} className="inline mr-2 text-gray-400" />
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

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
              <button className="hidden lg:block text-blue-600 hover:text-blue-700 font-medium">
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

        <div className="lg:hidden mt-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full px-4 py-2 pl-10 border-2 border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;