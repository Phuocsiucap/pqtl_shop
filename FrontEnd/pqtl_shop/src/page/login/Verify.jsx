import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Đang xác minh...");
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
        setMessage(res.data || "Xác minh thành công!");
        // Chuyển hướng sau 2 giây
        setTimeout(() => navigate("/login"), 2000);
      } catch (err) {
        setMessage(err.response?.data || "Xác minh thất bại hoặc token hết hạn!");
      }
    };

    verifyAccount();
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-80 text-center">
        <h2 className="text-2xl font-semibold mb-4">Xác minh tài khoản</h2>
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );
}
