import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaTag, FaClock, FaShoppingCart, FaPercent, FaLeaf } from "react-icons/fa";
import { request1, request } from "../../utils/request";

const ClearanceProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("discount"); // discount, price, expiry

  useEffect(() => {
    fetchClearanceProducts();
  }, []);

  const fetchClearanceProducts = async () => {
    setLoading(true);
    try {
      // Lấy sản phẩm thanh lý trực tiếp từ API
      const response = await request1.get("v1/products/clearance");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching clearance products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "discount":
        return (b.clearanceDiscount || 0) - (a.clearanceDiscount || 0);
      case "price":
        return (a.price * (1 - (a.clearanceDiscount || 0) / 100)) - (b.price * (1 - (b.clearanceDiscount || 0) / 100));
      case "expiry":
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return new Date(a.expiryDate) - new Date(b.expiryDate);
      default:
        return 0;
    }
  });

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
  };

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    return Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full mb-4">
          <FaTag className="text-3xl" />
          <h1 className="text-3xl font-bold">SẢN PHẨM THANH LÝ</h1>
          <FaTag className="text-3xl" />
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Sản phẩm sạch, chất lượng đảm bảo với giá ưu đãi đặc biệt! 
          Tất cả sản phẩm thanh lý đều còn hạn sử dụng và được kiểm tra chất lượng trước khi bán.
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <FaLeaf className="text-green-600 text-2xl" />
          <div>
            <p className="font-semibold text-green-800">Cam kết sản phẩm sạch</p>
            <p className="text-sm text-green-600">
              Tất cả sản phẩm thanh lý đều là nông sản tươi, sạch, còn hạn sử dụng. 
              Chúng tôi thanh lý để đảm bảo sản phẩm được tiêu thụ trong thời gian tươi ngon nhất.
            </p>
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          Tìm thấy <strong>{products.length}</strong> sản phẩm thanh lý
        </p>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Sắp xếp:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="discount">Giảm giá nhiều nhất</option>
            <option value="price">Giá thấp nhất</option>
            <option value="expiry">Sắp hết hạn</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải sản phẩm...</p>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FaTag className="mx-auto text-6xl text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Hiện tại không có sản phẩm thanh lý</p>
          <p className="text-gray-400">Quay lại sau để xem các ưu đãi mới nhé!</p>
          <Link to="/" className="inline-block mt-4 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
            Xem sản phẩm khác
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedProducts.map((product) => {
            const daysLeft = getDaysUntilExpiry(product.expiryDate);
            const clearancePrice = product.price * (1 - (product.clearanceDiscount || 0) / 100);
            
            return (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group relative"
              >
                {/* Discount Badge */}
                <div className="absolute top-2 left-2 z-10">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <FaPercent />
                    -{product.clearanceDiscount}%
                  </div>
                </div>

                {/* Expiry Badge */}
                {daysLeft !== null && (
                  <div className={`absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    daysLeft <= 7 ? 'bg-red-500 text-white' :
                    daysLeft <= 14 ? 'bg-orange-500 text-white' :
                    'bg-green-500 text-white'
                  }`}>
                    <FaClock />
                    {daysLeft} ngày
                  </div>
                )}

                {/* Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={product.image ? `${request}${product.image}` : "https://via.placeholder.com/300x192?text=No+Image"}
                    alt={product.name || "Product"}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300 bg-gray-100"
                    onError={(e) => { 
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/300x192?text=No+Image"; 
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity"></div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 truncate">{product.name}</h3>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-400 line-through text-sm">{formatCurrency(product.price)}</span>
                    <span className="text-red-600 font-bold text-lg">{formatCurrency(clearancePrice)}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{product.category}</span>
                    <span className={product.stockQuantity > 0 ? "text-green-600" : "text-red-600"}>
                      {product.stockQuantity > 0 ? `Còn ${product.stockQuantity}` : "Hết hàng"}
                    </span>
                  </div>

                  {/* Expiry Info */}
                  {product.expiryDate && (
                    <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                      <FaClock />
                      HSD: {product.expiryDate}
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      // Handle add to cart
                      alert("Vui lòng xem chi tiết sản phẩm để thêm vào giỏ hàng");
                    }}
                    className="w-full mt-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <FaShoppingCart />
                    Xem chi tiết
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Why Buy Clearance */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Tại sao nên mua sản phẩm thanh lý?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FaTag className="text-purple-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Giá ưu đãi đặc biệt</h3>
              <p className="text-sm text-gray-600">Tiết kiệm đến 50% so với giá thông thường</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FaLeaf className="text-green-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Chất lượng đảm bảo</h3>
              <p className="text-sm text-gray-600">100% sản phẩm còn hạn sử dụng và được kiểm tra</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FaClock className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Giảm lãng phí thực phẩm</h3>
              <p className="text-sm text-gray-600">Góp phần bảo vệ môi trường, giảm food waste</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClearanceProducts;
