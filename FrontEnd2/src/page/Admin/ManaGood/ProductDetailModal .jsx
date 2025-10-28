import React from "react";
import { request1,request } from "../../../utils/request";

const ProductDetailModal = ({ product, closeModal }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-[600px]"> {/* Đã mở rộng chiều rộng */}
        <h3 className="text-2xl font-semibold mb-6">Chi tiết sản phẩm</h3>
        
        <div className="space-y-4">
          <div>
            <img src={`${request}${product.image}`} alt={product.name} className="w-full h-[350px] object-cover mb-4 rounded-md" />
          </div>
          <div>
            <p><strong>Tên sản phẩm:</strong> {product.goodName}</p>
          </div>
          <div>
            <p><strong>Số lượng:</strong> {product.amount}</p>
          </div>
          <div>
            <p className="text-red-500 font-semibold">Giá: {product.price} VND</p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={closeModal}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
