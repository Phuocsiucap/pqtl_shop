import React, { useState } from "react";
import { Search, Filter, X, BarChart3, Download, Image as ImageIcon, TrendingUp, Package, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";
import ProductDetailModal from "../../modals/ProductSalesStastisticModal";
// Mock data
const mockSalesData = {
  daily: [
    { id: 1, name: "iPhone 15 Pro Max", sales: 45, category: "Điện thoại", unit: "chiếc", price: 30000000 },
    { id: 2, name: "Samsung Galaxy S24", sales: 38, category: "Điện thoại", unit: "chiếc", price: 25000000 },
    { id: 3, name: "MacBook Air M3", sales: 25, category: "Laptop", unit: "chiếc", price: 35000000 },
    { id: 4, name: "iPad Pro 2024", sales: 32, category: "Máy tính bảng", unit: "chiếc", price: 25000000 },
    { id: 5, name: "AirPods Pro 2", sales: 67, category: "Phụ kiện", unit: "cái", price: 7000000 },
    { id: 6, name: "Apple Watch Series 9", sales: 28, category: "Phụ kiện", unit: "chiếc", price: 12000000 },
    { id: 7, name: "Dell XPS 15", sales: 18, category: "Laptop", unit: "chiếc", price: 38000000 },
    { id: 8, name: "Sony WH-1000XM5", sales: 42, category: "Phụ kiện", unit: "cái", price: 9000000 }
  ],
  weekly: [
    { id: 1, name: "iPhone 15 Pro Max", sales: 285, category: "Điện thoại", unit: "chiếc", price: 30000000 },
    { id: 2, name: "Samsung Galaxy S24", sales: 242, category: "Điện thoại", unit: "chiếc", price: 25000000 },
    { id: 3, name: "MacBook Air M3", sales: 168, category: "Laptop", unit: "chiếc", price: 35000000 },
    { id: 4, name: "iPad Pro 2024", sales: 198, category: "Máy tính bảng", unit: "chiếc", price: 25000000 },
    { id: 5, name: "AirPods Pro 2", sales: 445, category: "Phụ kiện", unit: "cái", price: 7000000 },
    { id: 6, name: "Apple Watch Series 9", sales: 178, category: "Phụ kiện", unit: "chiếc", price: 12000000 },
    { id: 7, name: "Dell XPS 15", sales: 112, category: "Laptop", unit: "chiếc", price: 38000000 },
    { id: 8, name: "Sony WH-1000XM5", sales: 268, category: "Phụ kiện", unit: "cái", price: 9000000 }
  ]
};

// Mock data cho biểu đồ chi tiết sản phẩm
const getProductChartData = (productId, timeType) => {
  if (timeType === 'week') {
    return [
      { day: 'T2', sales: 35 },
      { day: 'T3', sales: 42 },
      { day: 'T4', sales: 38 },
      { day: 'T5', sales: 45 },
      { day: 'T6', sales: 52 },
      { day: 'T7', sales: 40 },
      { day: 'CN', sales: 33 }
    ];
  } else {
    return [
      { month: 'T1', sales: 850 },
      { month: 'T2', sales: 920 },
      { month: 'T3', sales: 1100 },
      { month: 'T4', sales: 980 },
      { month: 'T5', sales: 1250 },
      { month: 'T6', sales: 1150 }
    ];
  }
};

const categories = ["Tất cả", "Điện thoại", "Laptop", "Máy tính bảng", "Phụ kiện"];



export default function ProductSalesStatistics() {
  const [timeFilter, setTimeFilter] = useState('daily');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  // Lọc và sắp xếp dữ liệu
  const getFilteredData = () => {
    let data = mockSalesData[timeFilter] || [];
    
    // Lọc theo danh mục
    if (selectedCategory !== 'Tất cả') {
      data = data.filter(item => item.category === selectedCategory);
    }
    
    // Lọc theo tìm kiếm
    if (searchTerm) {
      data = data.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sắp xếp giảm dần theo số lượng
    return data.sort((a, b) => b.sales - a.sales);
  };

  const handleExportExcel = () => {
    try {
      const data = getFilteredData();
      const excelData = data.map((product, index) => ({
        'Thứ hạng': index + 1,
        'Tên sản phẩm': product.name,
        'Danh mục': product.category,
        'Số lượng bán': `${product.sales} ${product.unit}`,
        'Giá bán (VND)': formatCurrency(product.price),
        'Doanh thu (VND)': formatCurrency(product.sales * product.price)
      }));

      const totalSales = data.reduce((sum, item) => sum + item.sales, 0);
      const totalRevenue = data.reduce((sum, item) => sum + (item.sales * item.price), 0);

      excelData.push({
        'Thứ hạng': '',
        'Tên sản phẩm': 'TỔNG CỘNG',
        'Danh mục': '',
        'Số lượng bán': totalSales,
        'Giá bán (VND)': '',
        'Doanh thu (VND)': formatCurrency(totalRevenue)
      });

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Thống kê');

      const timeType = timeFilter === 'daily' ? 'Ngay' : 'Tuan';
      const fileName = `ThongKeSoLuongBan_${timeType}_${Date.now()}.xlsx`;
      XLSX.writeFile(wb, fileName);

      alert(`✅ Đã xuất báo cáo thành công!\nFile: ${fileName}`);
    } catch (error) {
      alert('❌ Có lỗi xảy ra khi xuất file Excel!');
    }
  };

  const filteredData = getFilteredData();
  const totalSales = filteredData.reduce((sum, item) => sum + item.sales, 0);
  const totalRevenue = filteredData.reduce((sum, item) => sum + (item.sales * item.price), 0);

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2 sm:gap-3">
            <BarChart3 className="text-blue-600" size={28} />
            <span>Thống kê số lượng bán ra</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Xem chi tiết số lượng sản phẩm đã bán theo thời gian
          </p>
        </div>

        {/* Filter & Search Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col gap-4">
            {/* Row 1: Time Filter & Search */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Time Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian
                </label>
                <select 
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="daily">Theo ngày</option>
                  <option value="weekly">Theo tuần</option>
                </select>
              </div>

              {/* Search */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tìm kiếm sản phẩm
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nhập tên sản phẩm..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Category Filter & Export */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Category Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Filter size={18} />
                      {selectedCategory}
                    </span>
                    <span className="text-gray-400">▼</span>
                  </button>
                  
                  {showCategoryFilter && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setSelectedCategory(category);
                            setShowCategoryFilter(false);
                          }}
                          className={`w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                            selectedCategory === category ? 'bg-blue-50 text-blue-600 font-medium' : ''
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Export Button */}
              <div className="sm:self-end">
                <label className="block text-sm font-medium text-gray-700 mb-2 invisible">
                  Export
                </label>
                <button
                  onClick={handleExportExcel}
                  className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Download size={18} />
                  Xuất Excel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Tổng sản phẩm</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{filteredData.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="text-blue-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Tổng số lượng bán</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{formatCurrency(totalSales)}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="text-green-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Tổng doanh thu</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">
                  {(totalRevenue / 1000000000).toFixed(2)}B đ
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white shadow-md rounded-lg border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Danh sách sản phẩm ({filteredData.length})
            </h2>
          </div>
          
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hạng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên sản phẩm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danh mục</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng bán</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá bán</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doanh thu</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((product, index) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-bold text-lg ${
                        index === 0 ? 'text-yellow-500' : 
                        index === 1 ? 'text-gray-400' : 
                        index === 2 ? 'text-orange-600' : 
                        'text-gray-600'
                      }`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package size={18} className="text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(product.sales)} {product.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {(product.price / 1000000).toFixed(1)}M
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-green-600">
                        {((product.sales * product.price) / 1000000).toFixed(1)}M
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 mx-auto"
                      >
                        <BarChart3 size={14} />
                        Biểu đồ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-gray-200">
            {filteredData.map((product, index) => (
              <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`font-bold text-xl ${
                      index === 0 ? 'text-yellow-500' : 
                      index === 1 ? 'text-gray-400' : 
                      index === 2 ? 'text-orange-600' : 
                      'text-gray-600'
                    }`}>
                      #{index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Package size={16} className="text-blue-600" />
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {product.category}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Số lượng bán</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(product.sales)} {product.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Giá bán</p>
                    <p className="text-sm text-gray-900">
                      {(product.price / 1000000).toFixed(1)}M
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Doanh thu</p>
                    <p className="text-sm font-semibold text-green-600">
                      {((product.sales * product.price) / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedProduct(product)}
                  className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <BarChart3 size={16} />
                  Xem biểu đồ chi tiết
                </button>
              </div>
            ))}
          </div>

          {filteredData.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <Package size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Không tìm thấy sản phẩm phù hợp</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal chi tiết sản phẩm */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}