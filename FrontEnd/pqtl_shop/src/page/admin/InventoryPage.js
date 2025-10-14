import React from "react";

export default function InventoryPage() {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Tồn kho sản phẩm</h1>
      <p className="text-gray-500">
        Trang này hiển thị số lượng tồn kho, cảnh báo sản phẩm sắp hết và tồn dưới mức tối thiểu.
      </p>
    </div>
  );
}
