import React from "react";
import { FaLock, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AccessDenied = ({ requiredRole = "ADMIN" }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <FaLock className="text-4xl text-red-500" />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Không có quyền truy cập
        </h2>

        <p className="text-gray-600 mb-6">
          Trang này chỉ dành cho <span className="font-semibold text-red-600">{requiredRole}</span>.
          <br />
          Vui lòng liên hệ quản trị viên nếu bạn cần quyền truy cập.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <FaArrowLeft />
            Quay lại
          </button>

          <button
            onClick={() => navigate("/admin/managegood")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đi đến Quản lý sản phẩm
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
