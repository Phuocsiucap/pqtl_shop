import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaCheckCircle } from "react-icons/fa";

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Đang xác minh tài khoản...");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setMessage("Token không hợp lệ!");
      return;
    }

    const verifyAccount = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/auth/verify?token=${token}`);
        setMessage("Xác thực email thành công! PQTL_Shop cảm ơn quý khách 💙");
        setSuccess(true);
        setTimeout(() => navigate("/login"), 3000); // Chuyển hướng sau 3 giây
      } catch (err) {
        setMessage(err.response?.data || "Xác minh thất bại hoặc token hết hạn!");
      }
    };

    verifyAccount();
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col bg-gradient-to-r from-blue-50 to-blue-100 h-screen items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
        <div className="flex justify-center">
          {success ? (
            <FaCheckCircle className="text-green-500 text-6xl mb-4" />
          ) : (
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-primary border-solid mb-4"></div>
          )}
        </div>
        <h2 className="text-2xl font-bold text-primary mb-2">
          {success ? "🎉 Xác thực thành công!" : "🔐 Xác minh tài khoản"}
        </h2>
        <p className="text-gray-600 leading-relaxed">{message}</p>
        
        {success && (
          <p className="mt-4 text-sm text-gray-500">
            Bạn sẽ được chuyển đến trang đăng nhập trong giây lát...
          </p>
        )}
      </div>
    </div>
  );
}
