import React from "react";
import { Download, FileText, RefreshCw } from "lucide-react";
import { useBestSelling } from "../../../context/BestSellingContext";
import { formatCurrency } from "../../../utils/formatters";

const ProductTable = () => {
  const { sortedProducts, loading, exporting, handleExport } = useBestSelling();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Chi Tiết Sản Phẩm</h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport("xlsx")}
            disabled={exporting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:bg-gray-400"
          >
            <Download className="w-4 h-4" /> Excel
          </button>
          <button
            onClick={() => handleExport("pdf")}
            disabled={exporting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:bg-gray-400"
          >
            <FileText className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {["STT", "Sản phẩm", "Danh mục", "Số lượng", "Doanh thu", "Đơn giá TB"].map((head) => (
                <th key={head} className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-left">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /> Đang tải dữ liệu...
                </td>
              </tr>
            ) : sortedProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              sortedProducts.map((p, i) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">{i + 1}</td>
                  <td className="px-6 py-4 font-medium">{p.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">{p.category}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold">{p.quantity.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-semibold">{formatCurrency(p.revenue)}</td>
                  <td className="px-6 py-4 text-right text-gray-500">{formatCurrency(p.revenue / p.quantity)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
