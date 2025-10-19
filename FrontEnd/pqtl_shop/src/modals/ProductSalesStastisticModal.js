import React, { useState } from "react";
import { Search, Filter, X, BarChart3, Download, Image as ImageIcon, TrendingUp, Package, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";

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
const ProductDetailModal = ({ product, onClose }) => {
  const [chartTimeType, setChartTimeType] = useState('week');
  const chartData = getProductChartData(product.id, chartTimeType);

  const handleExportImage = () => {
    alert('Đang xuất biểu đồ thành hình ảnh...');
  };

  const handleExportExcel = () => {
    try {
      const excelData = chartData.map((item) => ({
        [chartTimeType === 'week' ? 'Ngày' : 'Tháng']: item.day || item.month,
        'Số lượng bán': item.sales
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Biểu đồ');

      const fileName = `BieuDo_${product.name.replace(/\s/g, '_')}_${chartTimeType === 'week' ? 'Tuan' : 'Thang'}.xlsx`;
      XLSX.writeFile(wb, fileName);

      alert(`✅ Đã xuất báo cáo thành công!\nFile: ${fileName}`);
    } catch (error) {
      alert('❌ Có lỗi xảy ra khi xuất file Excel!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex justify-between items-start">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{product.name}</h2>
            <p className="text-sm text-gray-500 mt-1">Biểu đồ thống kê bán hàng</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {/* Thông tin sản phẩm */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs text-blue-600 mb-1">Danh mục</p>
              <p className="font-semibold text-gray-900">{product.category}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-xs text-green-600 mb-1">Đơn vị</p>
              <p className="font-semibold text-gray-900">{product.unit}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-xs text-purple-600 mb-1">Giá bán</p>
              <p className="font-semibold text-gray-900">
                {(product.price / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-xs text-orange-600 mb-1">Đã bán</p>
              <p className="font-semibold text-gray-900">{product.sales} {product.unit}</p>
            </div>
          </div>

          {/* Bộ lọc thời gian */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setChartTimeType('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                chartTimeType === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Theo tuần
            </button>
            <button
              onClick={() => setChartTimeType('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                chartTimeType === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Theo tháng
            </button>
          </div>

          {/* Biểu đồ */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={chartTimeType === 'week' ? 'day' : 'month'} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#3B82F6" name="Số lượng bán" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Nút xuất */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExportImage}
              className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <ImageIcon size={20} />
              Xuất hình ảnh
            </button>
            <button
              onClick={handleExportExcel}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Download size={20} />
              Xuất Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProductDetailModal;