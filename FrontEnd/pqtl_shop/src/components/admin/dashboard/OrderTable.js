import React, { useState } from 'react';
import { 
  BarChart3, Package, TrendingUp, AlertTriangle, 
  Users, ShoppingCart, Search, Bell, Menu, X,
  ChevronRight, DollarSign, ArrowUpRight, ArrowDownRight,
  Clock, Box, Archive, Leaf, AlertCircle
} from 'lucide-react';
const OrderTable = ({ orders }) => {
  const statusColors = {
    "Đang giao": "bg-blue-100 text-blue-700",
    "Đã xác nhận": "bg-green-100 text-green-700",
    "Chờ xử lý": "bg-yellow-100 text-yellow-700",
    "Hoàn thành": "bg-gray-100 text-gray-700"
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Đơn hàng gần nhất</h3>
            <p className="text-sm text-gray-500 mt-1">Cập nhật realtime</p>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors">
            Tạo đơn mới
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Mã đơn</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Khách hàng</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Sản phẩm</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Tổng tiền</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Ngày đặt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-900">{order.code}</span>
                </td>
                <td className="px-6 py-4 text-gray-700">{order.customer}</td>
                <td className="px-6 py-4 text-gray-600 text-sm">{order.items}</td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-900">
                    {order.total.toLocaleString('vi-VN')}đ
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default OrderTable;