import React from "react";
import { request1, request, getFullImageUrl } from "../../../utils/request";
import defaultImage from "../../../assets/images/placeholder.png";

const ProductDetailModal = ({ product, closeModal }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-2xl font-bold text-gray-800">Chi tiết sản phẩm</h3>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Column 1: Image */}
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm aspect-w-4 aspect-h-3 bg-gray-50 flex items-center justify-center">
              <img
                src={product.image || defaultImage}
                alt={product.name}
                className="w-full h-full object-contain max-h-[400px]"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultImage;
                }}
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-2">Trạng thái kho hàng</h4>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-600">Tổng số lượng:</span>
                <span className="font-bold text-xl text-blue-800">{product.stockQuantity || product.amount || 0}</span>
              </div>
              <div className="w-full bg-blue-200 h-2 rounded-full mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min((product.stockQuantity || 0) / 100 * 100, 100)}%` }} // Ví dụ logic thanh %
                ></div>
              </div>
            </div>
          </div>

          {/* Column 2: Information */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{product.name || product.goodName}</h2>
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                Mã SP: #{product.id}
              </span>
              <span className="ml-2 inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {product.category || "Chưa phân loại"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-semibold">Giá bán</p>
                <p className="text-xl font-bold text-green-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price || 0)}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-semibold">Giá nhập</p>
                <p className="text-xl font-bold text-gray-700">
                  {product.costPrice ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.costPrice) : "---"}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-semibold">Giảm giá</p>
                <p className="text-lg font-semibold text-red-500">
                  {product.discount ? `-${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.discount)}` : "0 ₫"}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-semibold">Hạn sử dụng</p>
                <p className={`text-lg font-semibold ${!product.expiryDate ? "text-gray-400" : "text-gray-700"}`}>
                  {product.expiryDate || "Không có HSD"}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h4 className="font-semibold text-gray-800 mb-2">Mô tả sản phẩm</h4>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line text-justify h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                {product.description || "Chưa có mô tả cho sản phẩm này."}
              </p>
            </div>

            <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Ngày tạo</p>
                <p className="font-medium">{product.createdAt ? new Date(product.createdAt).toLocaleDateString('vi-VN') : "---"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cập nhật lần cuối</p>
                <p className="font-medium">{product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('vi-VN') : "---"}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end bg-gray-50 rounded-b-xl mt-auto">
          <button
            onClick={closeModal}
            className="px-8 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-all focus:ring-4 focus:ring-gray-100"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
