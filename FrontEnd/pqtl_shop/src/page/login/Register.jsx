import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../api/auth";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setMessage("❌ Mật khẩu nhập lại không khớp!");
      return;
    }

    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
      });

      // Sau khi đăng ký thành công
      setIsRegistered(true);
      setMessage(
        "✅ Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản trước khi đăng nhập."
      );
    } catch (err) {
      setMessage("❌ Email đã tồn tại hoặc lỗi máy chủ!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-blue-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-80"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Đăng ký tài khoản
        </h2>

        <input
          type="text"
          name="username"
          placeholder="Tên người dùng"
          value={form.username}
          onChange={handleChange}
          className="border w-full p-2 mb-3 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="border w-full p-2 mb-3 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          value={form.password}
          onChange={handleChange}
          className="border w-full p-2 mb-3 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Nhập lại mật khẩu"
          value={form.confirmPassword}
          onChange={handleChange}
          className="border w-full p-2 mb-3 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />

        {message && (
          <p
            className={`text-sm mb-3 text-center ${
              message.includes("thành công")
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        {!isRegistered ? (
          <button
            type="submit"
            className="bg-green-500 text-white w-full py-2 rounded hover:bg-green-600 transition"
          >
            Đăng ký
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600 transition"
          >
            Đến trang đăng nhập
          </button>
        )}

        <div className="mt-4 text-sm text-center text-gray-700">
          {!isRegistered && (
            <>
              <p>
                Đã có tài khoản?{" "}
                <span
                  className="text-blue-500 cursor-pointer hover:underline"
                  onClick={() => navigate("/login")}
                >
                  Đăng nhập
                </span>
              </p>
              <p className="mt-1">
                <span className="text-gray-500 cursor-not-allowed">
                  Quên mật khẩu?
                </span>
              </p>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
