import React, { useState } from "react";
import { Calendar, TrendingUp, Package, Download, ChevronDown, BarChart3 } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";

// Mock data
const mockProductData = {
  daily: [
    { id: 1, name: "iPhone 15 Pro Max", sales: 45, revenue: 1350000000, category: "Điện thoại", unit: "chiếc" },
    { id: 2, name: "Samsung Galaxy S24", sales: 38, revenue: 950000000, category: "Điện thoại", unit: "chiếc" },
    { id: 3, name: "MacBook Air M3", sales: 25, revenue: 875000000, category: "Laptop", unit: "chiếc" },
    { id: 4, name: "iPad Pro 2024", sales: 32, revenue: 800000000, category: "Máy tính bảng", unit: "chiếc" },
    { id: 5, name: "AirPods Pro 2", sales: 67, revenue: 469000000, category: "Phụ kiện", unit: "cái" }
  ],
  monthly: [
    { id: 1, name: "iPhone 15 Pro Max", sales: 1250, revenue: 37500000000, category: "Điện thoại", unit: "chiếc" },
    { id: 2, name: "Samsung Galaxy S24", sales: 980, revenue: 24500000000, category: "Điện thoại", unit: "chiếc" },
    { id: 3, name: "MacBook Air M3", sales: 680, revenue: 23800000000, category: "Laptop", unit: "chiếc" },
    { id: 4, name: "iPad Pro 2024", sales: 850, revenue: 21250000000, category: "Máy tính bảng", unit: "chiếc" },
    { id: 5, name: "AirPods Pro 2", sales: 1890, revenue: 13230000000, category: "Phụ kiện", unit: "cái" }
  ],
  yearly: [
    { id: 1, name: "iPhone 15 Pro Max", sales: 15600, revenue: 468000000000, category: "Điện thoại", unit: "chiếc" },
    { id: 2, name: "Samsung Galaxy S24", sales: 12300, revenue: 307500000000, category: "Điện thoại", unit: "chiếc" },
    { id: 3, name: "MacBook Air M3", sales: 8500, revenue: 297500000000, category: "Laptop", unit: "chiếc" },
    { id: 4, name: "iPad Pro 2024", sales: 10200, revenue: 255000000000, category: "Máy tính bảng", unit: "chiếc" },
    { id: 5, name: "AirPods Pro 2", sales: 23400, revenue: 163800000000, category: "Phụ kiện", unit: "cái" }
  ]
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const ProductTable = ({ data, timeFilter, selectedDate }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getTimeRangeText = () => {
    const date = new Date(selectedDate);
    switch(timeFilter) {
      case 'daily':
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      case 'monthly':
        return date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
      case 'yearly':
        return date.toLocaleDateString('vi-VN', { year: 'numeric' });
      default:
        return '';
    }
  };

  const handleExportExcel = () => {
    try {
      const excelData = data.map((product, index) => ({
        'Thứ hạng': index + 1,
        'Tên sản phẩm': product.name,
        'Danh mục': product.category,
        'Số lượng bán': `${product.sales} ${product.unit}`,
        'Doanh thu': formatCurrency(product.revenue)
      }));

      const totalSales = data.reduce((sum, item) => sum + item.sales, 0);
      const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

      excelData.push({
        'Thứ hạng': '',
        'Tên sản phẩm': 'TỔNG CỘNG',
        'Danh mục': '',
        'Số lượng bán': totalSales,
        'Doanh thu': formatCurrency(totalRevenue)
      });

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      
      const timeType = timeFilter === 'daily' ? 'Theo ngày' : timeFilter === 'monthly' ? 'Theo tháng' : 'Theo năm';
      
      XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo');

      const fileName = `SanPhamBanChay_${timeType}_${getTimeRangeText().replace(/\//g, '-')}.xlsx`;

      XLSX.writeFile(wb, fileName);

      alert(`✅ Đã xuất báo cáo thành công!\nFile: ${fileName}`);
    } catch (error) {
      console.error('Lỗi khi xuất Excel:', error);
      alert('❌ Có lỗi xảy ra khi xuất file Excel. Vui lòng thử lại!');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg border border-gray-200 mt-6">
      <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-lg font-semibold text-gray-900">Chi Tiết Sản Phẩm</h2>
        <button 
          onClick={handleExportExcel}
          className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <Download size={18} />
          <span>Xuất Excel</span>
        </button>
      </div>
      
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thứ hạng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên sản phẩm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Danh mục
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số lượng bán
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Doanh thu
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((product, index) => (
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
                    {product.sales.toLocaleString('vi-VN')} {product.unit}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-green-600">
                    {formatCurrency(product.revenue)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden divide-y divide-gray-200">
        {data.map((product, index) => (
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
            
            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500 mb-1">Số lượng bán</p>
                <p className="text-sm font-semibold text-gray-900">
                  {product.sales.toLocaleString('vi-VN')} {product.unit}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Doanh thu</p>
                <p className="text-sm font-semibold text-green-600">
                  {formatCurrency(product.revenue)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="p-12 text-center text-gray-500">
          <Package size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Không có dữ liệu sản phẩm bán chạy trong khoảng thời gian này</p>
        </div>
      )}
    </div>
  );
};

export default function BestSellersVisualization() {
  const [timeFilter, setTimeFilter] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [chartType, setChartType] = useState('bar');
  const [dataType, setDataType] = useState('sales');

  const getCurrentData = () => {
    return mockProductData[timeFilter] || [];
  };

  const getTimeRangeText = () => {
    const date = new Date(selectedDate);
    switch(timeFilter) {
      case 'daily':
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      case 'monthly':
        return date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
      case 'yearly':
        return date.toLocaleDateString('vi-VN', { year: 'numeric' });
      default:
        return '';
    }
  };

  const data = getCurrentData();
  const totalSales = data.reduce((sum, item) => sum + item.sales, 0);
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

  const chartData = data.map(product => ({
    name: product.name.length > 15 ? product.name.substring(0, 12) + '...' : product.name,
    fullName: product.name,
    sales: product.sales,
    revenue: product.revenue,
    category: product.category
  }));

  const getYAxisDataKey = () => {
    return dataType === 'sales' ? 'sales' : 'revenue';
  };

  const getYAxisLabel = () => {
    return dataType === 'sales' ? 'Số lượng bán' : 'Doanh thu (VND)';
  };

  const formatTooltip = (value) => {
    if (dataType === 'sales') {
      return value.toLocaleString('vi-VN');
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2 sm:gap-3">
            <TrendingUp className="text-blue-600" size={28} />
            <span>Sản phẩm bán chạy</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Theo dõi và trực quan hóa các sản phẩm bán chạy nhất theo thời gian
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thống kê theo
                </label>
                <div className="relative">
                  <select 
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  >
                    <option value="daily">Theo ngày</option>
                    <option value="monthly">Theo tháng</option>
                    <option value="yearly">Theo năm</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn thời gian
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  <input 
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại biểu đồ
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setChartType('bar')}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      chartType === 'bar' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <BarChart3 size={16} />
                    Cột
                  </button>
                  <button
                    onClick={() => setChartType('pie')}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                      chartType === 'pie' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Tròn
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hiển thị dữ liệu
                </label>
                <div className="relative">
                  <select 
                    value={dataType}
                    onChange={(e) => setDataType(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  >
                    <option value="sales">Số lượng bán</option>
                    <option value="revenue">Doanh thu</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs sm:text-sm text-blue-800">
              <span className="font-semibold">Đang xem:</span> {getTimeRangeText()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Tổng sản phẩm</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{data.length}</p>
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
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{totalSales.toLocaleString('vi-VN')}</p>
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
                  {new Intl.NumberFormat('vi-VN', { 
                    notation: 'compact',
                    compactDisplay: 'short'
                  }).format(totalRevenue)} đ
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Biểu đồ {getYAxisLabel().toLowerCase()}
          </h2>
          
          {chartData.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <div style={{ minHeight: '400px', minWidth: '100%' }}>
                <ResponsiveContainer width="100%" height={400}>
                  {chartType === 'bar' ? (
                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        label={{ value: getYAxisLabel(), angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={formatTooltip}
                        labelFormatter={(label) => {
                          const full = chartData.find(d => d.name === label);
                          return full ? full.fullName : label;
                        }}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                      <Bar dataKey={getYAxisDataKey()} fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey={getYAxisDataKey()}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={formatTooltip}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>Không có dữ liệu để hiển thị</p>
            </div>
          )}
        </div>

        <ProductTable data={data} timeFilter={timeFilter} selectedDate={selectedDate} />
      </div>
    </div>
  );
}