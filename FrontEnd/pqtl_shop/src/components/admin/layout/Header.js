import React from "react";
import { Leaf, Search, Bell, Menu } from "lucide-react";

export default function Header({ toggleSidebar }) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded-lg lg:hidden">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Thực phẩm sạch</h1>
              <p className="text-xs text-gray-500">Trang quản trị</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-gray-100 rounded-xl px-4 py-2 w-96">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input className="bg-transparent outline-none w-full text-sm" placeholder="Tìm kiếm..." />
          </div>
          <button className="relative p-2 hover:bg-gray-100 rounded-lg">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
