import React, { useEffect, useState } from "react";
import { 
  FaExclamationTriangle, FaClock, FaTrash, FaTag, FaSync,
  FaCheck, FaTimes, FaBoxes, FaCalendarAlt, FaPercentage,
  FaFilter, FaFileExcel, FaEye, FaShoppingCart
} from "react-icons/fa";
import { request1, request } from "../../../utils/request";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken";

const ClearanceManager = () => {
  const [expiryStats, setExpiryStats] = useState(null);
  const [expiredProducts, setExpiredProducts] = useState([]);
  const [nearExpiryProducts, setNearExpiryProducts] = useState([]);
  const [clearanceProducts, setClearanceProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("stats");
  const [daysThreshold, setDaysThreshold] = useState(30);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [clearanceDiscount, setClearanceDiscount] = useState(30);
  const [showClearanceModal, setShowClearanceModal] = useState(false);
  const [productToMark, setProductToMark] = useState(null);
  
  const access_token = getCSRFTokenFromCookie("access_token_admin");

  // Fetch expiry statistics
  const fetchExpiryStats = async () => {
    try {
      const response = await request1.get("v1/admin/expiry/stats/", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      setExpiryStats(response.data);
    } catch (error) {
      console.error("Error fetching expiry stats:", error);
    }
  };

  // Fetch expired products
  const fetchExpiredProducts = async () => {
    try {
      const response = await request1.get("v1/admin/expiry/expired/", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      setExpiredProducts(response.data);
    } catch (error) {
      console.error("Error fetching expired products:", error);
    }
  };

  // Fetch near expiry products
  const fetchNearExpiryProducts = async () => {
    try {
      const response = await request1.get(`v1/admin/expiry/near-expiry/?days=${daysThreshold}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      setNearExpiryProducts(response.data);
    } catch (error) {
      console.error("Error fetching near expiry products:", error);
    }
  };

  // Fetch clearance products
  const fetchClearanceProducts = async () => {
    try {
      const response = await request1.get("v1/admin/clearance/", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      setClearanceProducts(response.data);
    } catch (error) {
      console.error("Error fetching clearance products:", error);
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchExpiryStats(),
      fetchExpiredProducts(),
      fetchNearExpiryProducts(),
      fetchClearanceProducts(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, [daysThreshold]);

  // Mark product as clearance
  const markAsClearance = async (productId, discount) => {
    try {
      await request1.post(`v1/admin/clearance/${productId}/?discount=${discount}`, {}, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      fetchAllData();
      setShowClearanceModal(false);
      setProductToMark(null);
    } catch (error) {
      console.error("Error marking product as clearance:", error);
      alert("Lỗi khi đánh dấu thanh lý");
    }
  };

  // Unmark product from clearance
  const unmarkFromClearance = async (productId) => {
    if (!window.confirm("Bạn có chắc muốn hủy thanh lý sản phẩm này?")) return;
    
    try {
      await request1.delete(`v1/admin/clearance/${productId}/`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      fetchAllData();
    } catch (error) {
      console.error("Error unmarking product from clearance:", error);
      alert("Lỗi khi hủy thanh lý");
    }
  };

  // Auto mark clearance for near expiry products
  const autoMarkClearance = async () => {
    if (!window.confirm(`Bạn có chắc muốn tự động đánh dấu thanh lý cho sản phẩm sắp hết hạn trong ${daysThreshold} ngày với giảm giá ${clearanceDiscount}%?`)) return;
    
    try {
      const response = await request1.post(`v1/admin/clearance/auto-mark/?daysThreshold=${daysThreshold}&discount=${clearanceDiscount}`, {}, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      alert(`Đã đánh dấu thanh lý ${response.data.markedAsClearance} sản phẩm`);
      fetchAllData();
    } catch (error) {
      console.error("Error auto marking clearance:", error);
      alert("Lỗi khi tự động đánh dấu thanh lý");
    }
  };

  // Remove expired products
  const removeExpiredProducts = async (hardDelete = false) => {
    const message = hardDelete 
      ? "Bạn có chắc muốn XÓA VĨNH VIỄN tất cả sản phẩm đã hết hạn? Hành động này không thể hoàn tác!"
      : "Bạn có chắc muốn vô hiệu hóa tất cả sản phẩm đã hết hạn (đặt số lượng = 0)?";
    
    if (!window.confirm(message)) return;
    
    try {
      const response = await request1.post(`v1/admin/expiry/remove-expired/?hardDelete=${hardDelete}`, {}, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      alert(`Đã xử lý ${response.data.removed} sản phẩm hết hạn`);
      fetchAllData();
    } catch (error) {
      console.error("Error removing expired products:", error);
      alert("Lỗi khi xử lý sản phẩm hết hạn");
    }
  };

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
    const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Get expiry status badge
  const getExpiryBadge = (expiryDate) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days === null) return <span className="px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-600">Không có HSD</span>;
    if (days < 0) return <span className="px-2 py-1 rounded-full text-xs bg-red-600 text-white font-bold">Đã hết hạn</span>;
    if (days <= 7) return <span className="px-2 py-1 rounded-full text-xs bg-red-500 text-white">Còn {days} ngày</span>;
    if (days <= 30) return <span className="px-2 py-1 rounded-full text-xs bg-orange-500 text-white">Còn {days} ngày</span>;
    return <span className="px-2 py-1 rounded-full text-xs bg-green-500 text-white">Còn {days} ngày</span>;
  };

  // Export to CSV
  const exportToCSV = (products, filename) => {
    const headers = ["ID", "Tên sản phẩm", "Danh mục", "Giá", "Số lượng", "Ngày SX", "Hạn SD", "Số lô", "Thanh lý"];
    const data = products.map(p => [
      p.id,
      p.name,
      p.category,
      p.price,
      p.stockQuantity,
      p.manufacturingDate || "",
      p.expiryDate || "",
      p.batchNumber || "",
      p.isClearance ? "Có" : "Không"
    ]);
    
    const csvContent = [
      headers.join(","),
      ...data.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Render product table
  const renderProductTable = (products, showClearanceAction = false) => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Sản phẩm</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Danh mục</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Giá</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Số lượng</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Ngày SX</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Hạn SD</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Trạng thái</th>
            {showClearanceAction && (
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Thao tác</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img
                    src={product.image ? `${request}${product.image}` : "/placeholder.png"}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-md"
                    onError={(e) => { e.target.src = "/placeholder.png"; }}
                  />
                  <div>
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-xs text-gray-500">Lô: {product.batchNumber || "N/A"}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-600">{product.category}</td>
              <td className="px-4 py-3 text-right">
                {product.isClearance && product.clearanceDiscount ? (
                  <div>
                    <span className="line-through text-gray-400 text-sm">{formatCurrency(product.price)}</span>
                    <br />
                    <span className="text-red-600 font-bold">
                      {formatCurrency(product.price * (1 - product.clearanceDiscount / 100))}
                    </span>
                    <span className="text-xs text-red-500 ml-1">(-{product.clearanceDiscount}%)</span>
                  </div>
                ) : (
                  <span className="text-gray-800">{formatCurrency(product.price)}</span>
                )}
              </td>
              <td className="px-4 py-3 text-center">{product.stockQuantity}</td>
              <td className="px-4 py-3 text-center text-sm">{product.manufacturingDate || "N/A"}</td>
              <td className="px-4 py-3 text-center text-sm">{product.expiryDate || "N/A"}</td>
              <td className="px-4 py-3 text-center">
                <div className="flex flex-col items-center gap-1">
                  {getExpiryBadge(product.expiryDate)}
                  {product.isClearance && (
                    <span className="px-2 py-1 rounded-full text-xs bg-purple-600 text-white">
                      Thanh lý
                    </span>
                  )}
                </div>
              </td>
              {showClearanceAction && (
                <td className="px-4 py-3 text-center">
                  {product.isClearance ? (
                    <button
                      onClick={() => unmarkFromClearance(product.id)}
                      className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                    >
                      Hủy TL
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setProductToMark(product);
                        setShowClearanceModal(true);
                      }}
                      className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                    >
                      Thanh lý
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {products.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FaBoxes className="mx-auto text-4xl mb-2" />
          <p>Không có sản phẩm nào</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaExclamationTriangle className="text-orange-500" />
            Quản lý Hạn sử dụng & Thanh lý
          </h1>
          <p className="text-gray-600">Theo dõi và quản lý sản phẩm sắp hết hạn, đã hết hạn và đang thanh lý</p>
        </div>
        <button
          onClick={fetchAllData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <FaSync className={loading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      {/* Statistics Cards */}
      {expiryStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <FaBoxes />
              <span className="text-sm">Tổng SP</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{expiryStats.total}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-600">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <FaTimes />
              <span className="text-sm">Đã hết hạn</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{expiryStats.expired}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <FaClock />
              <span className="text-sm">Còn &lt;7 ngày</span>
            </div>
            <p className="text-2xl font-bold text-red-500">{expiryStats.nearExpiry7Days}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-orange-500">
            <div className="flex items-center gap-2 text-orange-500 mb-2">
              <FaClock />
              <span className="text-sm">Còn &lt;30 ngày</span>
            </div>
            <p className="text-2xl font-bold text-orange-500">{expiryStats.nearExpiry30Days}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center gap-2 text-green-500 mb-2">
              <FaCheck />
              <span className="text-sm">Còn hạn</span>
            </div>
            <p className="text-2xl font-bold text-green-500">{expiryStats.valid}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-gray-400">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <FaCalendarAlt />
              <span className="text-sm">Không có HSD</span>
            </div>
            <p className="text-2xl font-bold text-gray-500">{expiryStats.noExpiryDate}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-600">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <FaTag />
              <span className="text-sm">Đang thanh lý</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{expiryStats.clearance}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b">
          <nav className="flex">
            {[
              { id: "stats", label: "Thống kê", icon: FaBoxes },
              { id: "expired", label: `Đã hết hạn (${expiredProducts.length})`, icon: FaTimes },
              { id: "nearExpiry", label: `Sắp hết hạn (${nearExpiryProducts.length})`, icon: FaClock },
              { id: "clearance", label: `Đang thanh lý (${clearanceProducts.length})`, icon: FaTag },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <tab.icon />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4">
          {/* Controls */}
          {activeTab === "nearExpiry" && (
            <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Số ngày:</label>
                <select
                  value={daysThreshold}
                  onChange={(e) => setDaysThreshold(parseInt(e.target.value))}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value={7}>7 ngày</option>
                  <option value={14}>14 ngày</option>
                  <option value={30}>30 ngày</option>
                  <option value={60}>60 ngày</option>
                  <option value={90}>90 ngày</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Giảm giá TL:</label>
                <input
                  type="number"
                  value={clearanceDiscount}
                  onChange={(e) => setClearanceDiscount(parseInt(e.target.value))}
                  min="1"
                  max="90"
                  className="w-20 px-3 py-2 border rounded-md"
                />
                <span>%</span>
              </div>
              
              <button
                onClick={autoMarkClearance}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <FaTag />
                Tự động thanh lý tất cả
              </button>
              
              <button
                onClick={() => exportToCSV(nearExpiryProducts, "san-pham-sap-het-han")}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <FaFileExcel />
                Xuất Excel
              </button>
            </div>
          )}

          {activeTab === "expired" && (
            <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-red-50 rounded-lg">
              <p className="text-red-600 font-medium">
                <FaExclamationTriangle className="inline mr-2" />
                Có {expiredProducts.length} sản phẩm đã hết hạn cần xử lý
              </p>
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => removeExpiredProducts(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  <FaTimes />
                  Vô hiệu hóa tất cả
                </button>
                <button
                  onClick={() => removeExpiredProducts(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  <FaTrash />
                  Xóa vĩnh viễn
                </button>
                <button
                  onClick={() => exportToCSV(expiredProducts, "san-pham-het-han")}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <FaFileExcel />
                  Xuất Excel
                </button>
              </div>
            </div>
          )}

          {activeTab === "clearance" && (
            <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-purple-50 rounded-lg">
              <p className="text-purple-600 font-medium">
                <FaTag className="inline mr-2" />
                Có {clearanceProducts.length} sản phẩm đang được thanh lý
              </p>
              <button
                onClick={() => exportToCSV(clearanceProducts, "san-pham-thanh-ly")}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 ml-auto"
              >
                <FaFileExcel />
                Xuất Excel
              </button>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FaSync className="animate-spin text-3xl text-blue-600" />
              <span className="ml-2 text-gray-600">Đang tải...</span>
            </div>
          ) : (
            <>
              {activeTab === "stats" && (
                <div className="text-center py-8">
                  <FaBoxes className="mx-auto text-6xl text-gray-300 mb-4" />
                  <p className="text-gray-500">Chọn tab để xem chi tiết sản phẩm</p>
                </div>
              )}
              {activeTab === "expired" && renderProductTable(expiredProducts, true)}
              {activeTab === "nearExpiry" && renderProductTable(nearExpiryProducts, true)}
              {activeTab === "clearance" && renderProductTable(clearanceProducts, true)}
            </>
          )}
        </div>
      </div>

      {/* Clearance Modal */}
      {showClearanceModal && productToMark && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Đánh dấu thanh lý</h3>
            <div className="mb-4">
              <p className="text-gray-600 mb-2">Sản phẩm: <strong>{productToMark.name}</strong></p>
              <p className="text-gray-600 mb-2">Giá gốc: <strong>{formatCurrency(productToMark.price)}</strong></p>
              <p className="text-gray-600 mb-4">Hạn SD: <strong>{productToMark.expiryDate || "Không có"}</strong></p>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phần trăm giảm giá thanh lý:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={clearanceDiscount}
                  onChange={(e) => setClearanceDiscount(parseInt(e.target.value))}
                  min="1"
                  max="90"
                  className="w-24 px-3 py-2 border rounded-md"
                />
                <span>%</span>
              </div>
              
              <p className="mt-4 text-lg">
                Giá thanh lý: 
                <strong className="text-red-600 ml-2">
                  {formatCurrency(productToMark.price * (1 - clearanceDiscount / 100))}
                </strong>
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowClearanceModal(false);
                  setProductToMark(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={() => markAsClearance(productToMark.id, clearanceDiscount)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Xác nhận thanh lý
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClearanceManager;
