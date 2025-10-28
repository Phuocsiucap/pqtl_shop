import React from "react";

const UserDetailModal = ({ user, closeModal }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-[600px]">
        {" "}
        {/* Đã mở rộng chiều rộng */}
        <h3 className="text-2xl font-semibold mb-6">
          Thông tin chi tiết người dùng
        </h3>
        <div className="space-y-4 font-medium">
          <div>
            <p>
              <strong>Mã người dùng:</strong> {user.id}
            </p>
          </div>
          <div>
            <p>
              <strong>Họ và tên:</strong> {user.fullName}
            </p>
          </div>
          <div>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
          </div>
          <div>
            <p>
              <strong>Mật khẩu:</strong> {user.password}
            </p>
          </div>
          <div>
            <p>
              <strong>Loại người dùng:</strong> {user.userType}
            </p>
          </div>
          <div>
            <p>
              <strong>Điểm tích lũy:</strong> {user.loyaltyPoints}
            </p>
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

export default UserDetailModal;
