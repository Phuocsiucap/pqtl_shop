import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react';


const TopProductsChart = ({ products }) => {
  const navigate = useNavigate();
  const maxSales = Math.max(...products.map(p => p.sales));
  
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Top sản phẩm bán chạy</h3>
          <p className="text-sm text-gray-500 mt-1">Tuần này</p>
        </div>
        <button className="text-green-600 text-sm font-semibold hover:text-green-700 flex items-center"
        onClick={() => navigate("best-sellers")}>
          Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      <div className="space-y-4">
        {products.map((product, index) => {
          const percentage = (product.sales / maxSales) * 100;
          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  <span className="font-medium text-gray-900">{product.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{product.sales} {product.unit}</p>
                  <p className="text-xs text-gray-500">{(product.revenue / 1000000).toFixed(1)}M</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default TopProductsChart;