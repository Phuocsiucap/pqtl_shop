import React, { useState } from 'react';
import { 
  BarChart3, Package, TrendingUp, AlertTriangle, 
  Users, ShoppingCart, Search, Bell, Menu, X,
  ChevronRight, DollarSign, ArrowUpRight, ArrowDownRight,
  Clock, Box, Archive, Leaf, AlertCircle
} from 'lucide-react';
const LowStockAlert = ({ products }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Cảnh báo tồn kho & hạn sử dụng</h3>
          <p className="text-sm text-gray-500 mt-1">Cần xử lý ngay</p>
        </div>
        <button className="text-green-600 text-sm font-semibold hover:text-green-700 flex items-center">
          Quản lý kho <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      <div className="space-y-3">
        {products.map((product, index) => (
          <div 
            key={index}
            className={`p-4 rounded-xl border-2 ${
              product.status === 'critical' 
                ? 'bg-red-50 border-red-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className={`w-5 h-5 ${
                    product.status === 'critical' ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                  <h4 className="font-semibold text-gray-900">{product.name}</h4>
                </div>
                <div className="flex items-center gap-4 text-sm mt-2">
                  <span className={`font-medium ${
                    product.status === 'critical' ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                    Tồn: {product.stock}/{product.min}
                  </span>
                  <span className="text-gray-600">
                    HSD: {product.expiry}
                  </span>
                </div>
              </div>
              <button className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                product.status === 'critical'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-yellow-600 text-white hover:bg-yellow-700'
              }`}>
                Xử lý
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default LowStockAlert;