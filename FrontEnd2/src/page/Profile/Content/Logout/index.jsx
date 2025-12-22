import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LogoutUser } from "../../../../redux/Actions";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

function Logout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showConfirm, setShowConfirm] = useState(true);

  const handleConfirmLogout = () => {
    dispatch(LogoutUser());
    localStorage.removeItem("user");
    Cookies.remove("access_token", { path: "" });
    Cookies.remove("refresh_token", { path: "" });
    Cookies.remove("user", { path: "" });
    navigate("/");
  };

  const handleCancel = () => {
    navigate("/profile/account");
  };

  if (!showConfirm) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Xác nhận đăng xuất</h2>
        <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?</p>
        <div className="flex gap-4">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirmLogout}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}

export default Logout;
