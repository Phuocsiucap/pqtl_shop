import React, { useState } from 'react';
import { 
  ChevronRight
} from 'lucide-react';
const RevenueChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Doanh thu tuần này</h3>
          <p className="text-sm text-gray-500 mt-1">Triệu đồng</p>
        </div>
        <button className="text-green-600 text-sm font-semibold hover:text-green-700 flex items-center">
          Xuất báo cáo <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      <div className="flex items-end justify-between h-64 gap-3">
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div className="w-full bg-gray-50 rounded-t-xl relative" style={{ height: '100%' }}>
                <div 
                  className="absolute bottom-0 w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-xl transition-all group-hover:from-green-700 group-hover:to-green-500 cursor-pointer"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {item.value}M
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3 font-medium">{item.day}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default RevenueChart;