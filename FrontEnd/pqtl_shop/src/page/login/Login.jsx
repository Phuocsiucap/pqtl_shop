import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, getUserInfo } from "../../api/auth";
import { FcGoogle } from "react-icons/fc"; // Google icon

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Email không hợp lệ!");
      return;
    }

    try {
      const res = await login({
        username: form.email,
        password: form.password,
      });

      localStorage.setItem("token", res.accessToken);
      const user = await getUserInfo();
      if (user) localStorage.setItem("user", JSON.stringify(user));

      navigate("/");
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Đăng nhập thất bại! Vui lòng thử lại.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-[380px]">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Chào mừng bạn trở lại PQTL Shop👋
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Nhập email"
            value={form.email}
            onChange={handleChange}
            className="border w-full p-3 mb-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={handleChange}
            className="border w-full p-3 mb-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          {error && (
            <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
          )}

          <button
            type="submit"
            className="bg-blue-500 text-white w-full py-3 rounded-xl hover:bg-blue-600 transition"
          >
            Đăng nhập
          </button>
        </form>

        <div className="flex items-center my-5">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-2 text-gray-400 text-sm">hoặc</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* 🔥 Nút đăng nhập bằng Google */}
        <button
          onClick={() => window.location.href = "http://localhost:8080/oauth2/authorization/google"}
          className="flex items-center justify-center w-full border py-2 rounded-xl hover:bg-gray-50 transition"
        >
          <FcGoogle className="text-2xl mr-2" />
          <span className="text-gray-700 font-medium">
            Đăng nhập bằng Google
          </span>
        </button>


        <div className="mt-6 text-sm text-center text-gray-600">
          <p>
            Bạn chưa có tài khoản?{" "}
            <span
              className="text-blue-500 cursor-pointer hover:underline"
              onClick={() => navigate("/register")}
            >
              Đăng ký
            </span>
          </p>
          <p className="mt-2 text-gray-400 cursor-not-allowed">
            Quên mật khẩu?
          </p>
        </div>
      </div>
    </div>
  );
}
