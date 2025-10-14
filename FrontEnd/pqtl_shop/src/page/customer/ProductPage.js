// src/pages/ProductDetailPage.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Header với nút quay lại */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="bg-blue-100 p-3 rounded-xl">
              <Package className="text-blue-600" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Chi tiết sản phẩm</h1>
              <p className="text-gray-600">Mã sản phẩm: #{id}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-8xl mb-6">📦</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Trang chi tiết sản phẩm #{id}
          </h2>
          <p className="text-gray-500">
            Nội dung đang được phát triển...
          </p>
        </div>
      </div>
    </div>
  );
}