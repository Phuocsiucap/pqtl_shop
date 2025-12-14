import React, { useState } from 'react';
import { request1 } from '../../../utils/request';
import { getCSRFTokenFromCookie } from '../../../Component/Token/getCSRFToken';

const FixImagesButton = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const access_token = getCSRFTokenFromCookie("access_token_admin");

  const handleFixImages = async () => {
    if (!window.confirm('Thêm ảnh placeholder cho tất cả sản phẩm không có ảnh?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await request1.post("v1/admin/fix-missing-images/", {}, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      console.log('Fix images response:', response.data);
      setResult(response.data);
      
      // Reload products after fix
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error fixing images:', error);
      alert('Lỗi khi thêm ảnh: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-semibold text-yellow-800 mb-2">Cải thiện hình ảnh sản phẩm</h3>
      <p className="text-sm text-yellow-700 mb-3">
        Nếu sản phẩm không có ảnh, click nút bên dưới để thêm ảnh placeholder từ Cloudinary.
      </p>
      <button
        onClick={handleFixImages}
        disabled={loading}
        className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 transition-colors"
      >
        {loading ? 'Đang xử lý...' : 'Thêm ảnh cho các sản phẩm'}
      </button>

      {result && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg">
          <p className="font-semibold">✓ Hoàn tất!</p>
          <p>Tổng sản phẩm: {result.totalProducts}</p>
          <p>Sản phẩm không có ảnh: {result.productsWithoutImage}</p>
          <p>Đã cập nhật: {result.updated}</p>
        </div>
      )}
    </div>
  );
};

export default FixImagesButton;
