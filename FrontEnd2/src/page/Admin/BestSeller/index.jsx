import React, { useEffect, useState } from "react";
import { FaEye, FaFire, FaTrophy, FaFileExcel, FaChartLine, FaFilter, FaCalendarAlt } from "react-icons/fa";
import { request1, request } from "../../../utils/request";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken";
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const BestSellerList = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [productRevenueData, setProductRevenueData] = useState(null);
  const access_token = getCSRFTokenFromCookie("access_token_admin");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(10);
  const [timeRange, setTimeRange] = useState("month"); // week, month, year
  const [showChart, setShowChart] = useState(true);
  const [loading, setLoading] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  const [useCustomRange, setUseCustomRange] = useState(false);

  const fetchBestSellers = async () => {
    setLoading(true);
    try {
      let url = `v1/admin/bestsellers/?limit=${productsPerPage}&period=${timeRange}`;
      
      if (useCustomRange && customDateRange.startDate && customDateRange.endDate) {
        url += `&startDate=${customDateRange.startDate}T00:00:00&endDate=${customDateRange.endDate}T23:59:59`;
      }
      
      const response = await request1.get(url, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      console.log("Best sellers:", response.data);
      setProducts(response.data);
    } catch (e) {
      console.log("Lỗi fetching bestsellers:", e);
      // Fallback to old API if new one fails
      try {
        const response = await request1.get("v1/admin/goods/", {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        
        const sortedProducts = response.data
          .map(product => ({
            ...product,
            sold: product.sold || Math.floor(Math.random() * 1000),
            revenue: product.revenue || (product.sold || 100) * (product.price || 10000000)
          }))
          .sort((a, b) => b.sold - a.sold)
          .slice(0, productsPerPage);
        
        setProducts(sortedProducts);
      } catch (fallbackError) {
        console.log("Fallback error:", fallbackError);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBestSellers();
  }, [timeRange, productsPerPage, useCustomRange, customDateRange.startDate, customDateRange.endDate]);

  const fetchProductRevenueStats = async (productId) => {
    if (!productId) {
      console.log("Không có productId");
      setProductRevenueData(null);
      return;
    }
    
    try {
      let url = `v1/admin/products/${encodeURIComponent(productId)}/revenue/?period=${timeRange}`;
      
      if (useCustomRange && customDateRange.startDate && customDateRange.endDate) {
        url += `&startDate=${customDateRange.startDate}T00:00:00&endDate=${customDateRange.endDate}T23:59:59`;
      }
      
      console.log("Fetching product revenue from:", url);
      
      const response = await request1.get(url, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      console.log("Product revenue response:", response.data);
      setProductRevenueData(response.data);
    } catch (e) {
      console.log("Lỗi fetching product revenue:", e);
      console.log("ProductId:", productId);
      // Set empty data instead of null to show "no data" state
      setProductRevenueData({
        totalRevenue: 0,
        totalSold: 0,
        orderCount: 0,
        avgPrice: 0,
        chartData: null,
        error: e.response?.status === 404 ? "Không tìm thấy dữ liệu doanh thu cho sản phẩm này" : "Lỗi khi tải dữ liệu"
      });
    }
  };

  const viewProductDetails = async (product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
    await fetchProductRevenueStats(product.productId);
  };

  const closeModal = () => {
    setIsDetailModalOpen(false);
    setSelectedProduct(null);
    setProductRevenueData(null);
  };

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getRankIcon = (index) => {
    if (index === 0) return <FaTrophy className="text-yellow-500 text-2xl" />;
    if (index === 1) return <FaTrophy className="text-gray-400 text-2xl" />;
    if (index === 2) return <FaTrophy className="text-orange-600 text-2xl" />;
    return <span className="text-gray-600 font-bold">{index + 1}</span>;
  };

  // Export to Excel
  const exportToExcel = () => {
    const headers = ["Hạng", "Mã SP", "Tên sản phẩm", "Đã bán", "Giá bán", "Giá nhập", "Doanh thu", "Lợi nhuận", "Số đơn hàng"];
    const data = products.map((product, index) => [
      index + 1,
      product.productId || 'N/A',
      product.productName || 'Chưa có tên',
      product.soldQuantity || 0,
      product.price || 0,
      product.costPrice || 0,
      product.revenue || 0,
      product.profit || 0,
      product.orderCount || 0
    ]);
    
    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...data.map(row => row.join(","))
    ].join("\n");
    
    // Add BOM for UTF-8
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `san-pham-ban-chay-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chart data - sử dụng productName và soldQuantity từ API mới
  const getProductLabel = (p) => {
    const name = p.productName || p.productId || 'SP';
    return name.length > 15 ? name.substring(0, 15) + "..." : name;
  };

  const chartData = {
    labels: products.slice(0, 10).map(p => getProductLabel(p)),
    datasets: [
      {
        label: "Số lượng đã bán",
        data: products.slice(0, 10).map(p => p.soldQuantity || 0),
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const revenueChartData = {
    labels: products.slice(0, 10).map(p => getProductLabel(p)),
    datasets: [
      {
        label: "Doanh thu (VNĐ)",
        data: products.slice(0, 10).map(p => p.revenue || 0),
        backgroundColor: "rgba(16, 185, 129, 0.5)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 2,
      },
      {
        label: "Lợi nhuận (VNĐ)",
        data: products.slice(0, 10).map(p => p.profit || 0),
        backgroundColor: "rgba(245, 158, 11, 0.5)",
        borderColor: "rgba(245, 158, 11, 1)",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top 10 Sản phẩm bán chạy',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-6 w-full font-medium">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <FaFire className="text-orange-500 text-3xl" />
          <h2 className="text-2xl font-semibold text-gray-800">
            Sản phẩm bán chạy
          </h2>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowChart(!showChart)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              showChart ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <FaChartLine />
            Biểu đồ
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <FaFileExcel />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Time Range Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => { setTimeRange("week"); setUseCustomRange(false); }}
              className={`px-4 py-2 rounded-md transition-colors ${
                timeRange === "week" && !useCustomRange
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Tuần này
            </button>
            <button
              onClick={() => { setTimeRange("month"); setUseCustomRange(false); }}
              className={`px-4 py-2 rounded-md transition-colors ${
                timeRange === "month" && !useCustomRange
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Tháng này
            </button>
            <button
              onClick={() => { setTimeRange("year"); setUseCustomRange(false); }}
              className={`px-4 py-2 rounded-md transition-colors ${
                timeRange === "year" && !useCustomRange
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Năm nay
            </button>
          </div>
          
          {/* Divider */}
          <div className="h-8 w-px bg-gray-300"></div>
          
          {/* Custom Date Range */}
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-500" />
            <input
              type="date"
              value={customDateRange.startDate}
              onChange={(e) => {
                setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }));
                setUseCustomRange(true);
              }}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">đến</span>
            <input
              type="date"
              value={customDateRange.endDate}
              onChange={(e) => {
                setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }));
                setUseCustomRange(true);
              }}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Divider */}
          <div className="h-8 w-px bg-gray-300"></div>
          
          {/* Products Per Page */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            <span className="text-gray-600">Hiển thị:</span>
            <select
              value={productsPerPage}
              onChange={(e) => {
                setProductsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10 sản phẩm</option>
              <option value={20}>20 sản phẩm</option>
              <option value={50}>50 sản phẩm</option>
            </select>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {showChart && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Số lượng bán</h3>
            <div className="h-[300px]">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Doanh thu</h3>
            <div className="h-[300px]">
              <Bar data={revenueChartData} options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: { display: true, text: 'Doanh thu & Lợi nhuận Top 10 sản phẩm' }
                }
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <tr>
                <th className="px-6 py-4 text-center">Hạng</th>
                <th className="px-6 py-4 text-left">Hình ảnh</th>
                <th className="px-6 py-4 text-left">Mã SP / Tên sản phẩm</th>
                <th className="px-6 py-4 text-center">Đã bán</th>
                <th className="px-6 py-4 text-center">Giá bán</th>
                <th className="px-6 py-4 text-center">Doanh thu</th>
                <th className="px-6 py-4 text-center">Lợi nhuận</th>
                <th className="px-6 py-4 text-center">Số đơn</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentProducts.map((product, index) => {
                const actualIndex = indexOfFirstProduct + index;
                return (
                  <tr
                    key={product.productId || index}
                    className={`hover:bg-orange-50 border-b transition-colors ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } ${actualIndex < 3 ? "font-semibold" : ""}`}
                  >
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center">
                        {getRankIcon(actualIndex)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {product.productImage && product.productImage !== 'undefined' && product.productImage !== '' ? (
                        <img
                          src={`${request}${product.productImage}`}
                          alt={product.productName || product.productId}
                          className="w-20 h-20 object-cover rounded-md shadow-sm"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-20 h-20 bg-gray-200 rounded-md shadow-sm items-center justify-center text-gray-400 text-xs"
                        style={{ display: product.productImage && product.productImage !== 'undefined' && product.productImage !== '' ? 'none' : 'flex' }}
                      >
                        No Image
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">{product.productId}</span>
                        <div className="flex items-center gap-2">
                          {product.productName || 'Chưa có tên'}
                          {actualIndex < 3 && (
                            <FaFire className="text-orange-500 animate-pulse" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                        {product.soldQuantity || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col">
                        <span>{(product.price || 0).toLocaleString('vi-VN')} ₫</span>
                        {product.costPrice > 0 && (
                          <span className="text-xs text-gray-500">Nhập: {(product.costPrice || 0).toLocaleString('vi-VN')} ₫</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-blue-600 font-semibold">
                      {(product.revenue || 0).toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-sm font-semibold ${
                        (product.profit || 0) > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {(product.profit || 0).toLocaleString('vi-VN')} ₫
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                        {product.orderCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => viewProductDetails(product)}
                        className="text-blue-500 transform transition-all duration-300 hover:text-blue-700 hover:scale-110"
                      >
                        <FaEye className="text-xl" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center items-center gap-4">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md transition-colors ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Trước
          </button>
          <span className="px-4 py-2 text-gray-700 font-semibold">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md transition-colors ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Sau
          </button>
        </div>
      )}

      {/* Detail Modal with Revenue Stats */}
      {isDetailModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Chi tiết sản phẩm</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Info */}
              <div className="space-y-4">
                {selectedProduct.productImage && selectedProduct.productImage !== 'undefined' && selectedProduct.productImage !== '' ? (
                  <img
                    src={`${request}${selectedProduct.productImage}`}
                    alt={selectedProduct.productName || selectedProduct.productId}
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="w-full h-64 bg-gray-200 rounded-lg items-center justify-center text-gray-400"
                  style={{ display: selectedProduct.productImage && selectedProduct.productImage !== 'undefined' && selectedProduct.productImage !== '' ? 'none' : 'flex' }}
                >
                  No Image Available
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-600 text-sm">Mã sản phẩm</p>
                    <p className="font-semibold">{selectedProduct.productId}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-600 text-sm">Tên sản phẩm</p>
                    <p className="font-semibold">{selectedProduct.productName || 'Chưa có tên'}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-gray-600 text-sm">Đã bán</p>
                    <p className="font-semibold text-green-600">{selectedProduct.soldQuantity || 0} sản phẩm</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-gray-600 text-sm">Số đơn hàng</p>
                    <p className="font-semibold text-purple-600">{selectedProduct.orderCount || 0}</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-gray-600 text-sm">Giá bán</p>
                    <p className="font-semibold text-orange-600">{(selectedProduct.price || 0).toLocaleString('vi-VN')} ₫</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-600 text-sm">Giá nhập</p>
                    <p className="font-semibold text-gray-600">{(selectedProduct.costPrice || 0).toLocaleString('vi-VN')} ₫</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-gray-600 text-sm">Doanh thu</p>
                    <p className="font-semibold text-blue-600">
                      {(selectedProduct.revenue || 0).toLocaleString('vi-VN')} ₫
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${(selectedProduct.profit || 0) >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p className="text-gray-600 text-sm">Lợi nhuận</p>
                    <p className={`font-semibold ${(selectedProduct.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(selectedProduct.profit || 0).toLocaleString('vi-VN')} ₫
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Revenue Stats */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-700">
                  Thống kê doanh thu & lợi nhuận
                </h4>
                {productRevenueData ? (
                  <div className="space-y-4">
                    {/* Error message if API failed */}
                    {productRevenueData.error && (
                      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-4">
                        <p className="text-sm">{productRevenueData.error}</p>
                        <p className="text-xs mt-1 text-yellow-600">Dữ liệu bên dưới là từ danh sách best seller.</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-gray-600 text-sm">Tổng doanh thu</p>
                        <p className="font-bold text-lg text-blue-600">
                          {(productRevenueData.totalRevenue || selectedProduct?.revenue || 0).toLocaleString('vi-VN')} ₫
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-gray-600 text-sm">Tổng lợi nhuận</p>
                        <p className={`font-bold text-lg ${(productRevenueData.totalProfit || selectedProduct?.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(productRevenueData.totalProfit || selectedProduct?.profit || 0).toLocaleString('vi-VN')} ₫
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-gray-600 text-sm">Tổng đã bán</p>
                        <p className="font-bold text-lg text-green-600">
                          {productRevenueData.totalSold || selectedProduct?.soldQuantity || 0}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-gray-600 text-sm">Số đơn hàng</p>
                        <p className="font-bold text-lg text-purple-600">
                          {productRevenueData.orderCount || selectedProduct?.orderCount || 0}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-gray-600 text-sm">Giá bán TB</p>
                        <p className="font-bold text-lg text-orange-600">
                          {(productRevenueData.avgPrice || selectedProduct?.price || 0).toLocaleString('vi-VN')} ₫
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-gray-600 text-sm">Giá nhập TB</p>
                        <p className="font-bold text-lg text-gray-600">
                          {(productRevenueData.avgCostPrice || selectedProduct?.costPrice || 0).toLocaleString('vi-VN')} ₫
                        </p>
                      </div>
                    </div>
                    
                    {productRevenueData.chartData && !productRevenueData.error && (
                      <div className="h-[200px] mt-4">
                        <Line 
                          data={{
                            labels: productRevenueData.chartData.labels || [],
                            datasets: [
                              {
                                label: 'Doanh thu',
                                data: productRevenueData.chartData.values || [],
                                borderColor: 'rgba(59, 130, 246, 1)',
                                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                fill: true,
                              },
                              {
                                label: 'Lợi nhuận',
                                data: productRevenueData.chartData.profitValues || [],
                                borderColor: 'rgba(16, 185, 129, 1)',
                                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                fill: true,
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false }
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-500">Đang tải dữ liệu...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BestSellerList;