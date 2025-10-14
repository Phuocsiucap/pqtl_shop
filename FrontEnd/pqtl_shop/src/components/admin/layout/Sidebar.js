// src/components/Layout/Sidebar.js
import React from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Clock,
  Archive,
  Box,
  Users,
  X,
} from "lucide-react";

const menuItems = [
  { icon: BarChart3, label: "Trang chủ", path: "/admin", end: true }, // ✅ Thêm end: true
  { icon: TrendingUp, label: "Sản phẩm bán chạy", path: "/admin/best-sellers" },
  { icon: DollarSign, label: "Doanh thu", path: "/admin/revenue" },
  { icon: ShoppingCart, label: "Đơn hàng", path: "/admin/orders" },
  { icon: Clock, label: "Sản phẩm quá hạn", path: "/admin/expired" },
  { icon: Archive, label: "Thanh lý", path: "/admin/clearance" },
  { icon: Box, label: "Tồn kho", path: "/admin/inventory" },
  { icon: Users, label: "Người dùng", path: "/admin/users" },
];

export default function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <>
      {/* Overlay chỉ hiện trên mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full bg-white shadow-lg
          transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isOpen ? "w-64" : "lg:w-20"}
        `}
      >
        {/* Header sidebar */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          {isOpen && (
            <h1 className="text-lg font-semibold text-green-600">Admin</h1>
          )}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-1 text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu items */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-73px)]">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              end={item.end} // ✅ Thêm thuộc tính end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
              onClick={() => {
                if (window.innerWidth < 1024) toggleSidebar();
              }}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && (
                <span className="whitespace-nowrap">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}