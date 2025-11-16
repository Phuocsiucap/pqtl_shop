import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FaUser } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc"; // Google icon
import axios from "axios";
import Cookies from "js-cookie";
import { LoginUser } from "../../redux/Actions";
import { request1 } from "../../utils/request";

function Login() {
  axios.defaults.withCredentials = true;
  const dispatch = useDispatch();
  const [showpassword, setShowPassword] = useState(false);
  const [showmesage, setShowmessage] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const handleOnchange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
    setShowmessage(false);
  };

  const handleOnsumbit = async (e) => {
    e.preventDefault();
    if (user.password === "" || user.email === "") {
      setMessage("Điền đầy đủ thông tin đăng nhập!");
      setShowmessage(true);
      return;
    }
    try {
      const response = await request1.post("auth/login", {
        username: user.email,
        password: user.password,
      });

      if (response.status === 200) {
        alert("Đăng nhập thành công");

        Cookies.set("access_token", response.data.accessToken, { expires: 7 });
        Cookies.set("refresh_token", response.data.refreshToken, { expires: 7 });
        Cookies.set("user", JSON.stringify(response.data.user), { expires: 7 });

        localStorage.setItem("user", JSON.stringify(response.data.user));
        dispatch(LoginUser(response.data.user));
        navigate("/");
      }
    } catch (e) {
      const errMessage = e.response?.data?.message || "Tài khoản chưa được xác minh";
      setMessage(errMessage);
      setShowmessage(true);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <div className="flex items-center h-[95vh] font-Montserrat overflow-hidden box-border">
      <form className="w-full flex justify-center items-center overflow-hidden" onSubmit={handleOnsumbit}>
        <div className="font-Montserrat w-[100%] md:w-[50%] xl:w-[30%] border-2 md:border-gray-200 rounded-md flex flex-col gap-y-2 items-center mx-2">
          <Link to={"/"}>
            <p className="font-bold text-primary text-sm lg:text-3xl uppercase text-center mt-5">PQTLSHOP</p>
          </Link>

          <p className="font-bold text-2xl">Đăng nhập</p>

          <div className="flex flex-col py-3 w-full relative group items-center">
            <label htmlFor="email" className="text-left w-full px-6 font-semibold py-2">Email</label>
            <input
              type="text"
              placeholder="Địa chỉ gmail"
              id="email"
              className="input-form"
              value={user.email}
              name="email"
              onChange={handleOnchange}
            />
            <FaUser className="absolute right-8 top-[70px] lg:right-10 font-bold lg:text-xl" />

            {showmesage && (
              <p className="text-xs w-full px-6 text-left font-bold text-red-500 absolute bottom-[-10px]">Lỗi! {message}</p>
            )}
          </div>

          <div className="flex flex-col items-center py-3 w-full text-sm lg:text-base group relative">
            <label htmlFor="password" className="font-semibold w-full px-6 py-2 text-left">Mật khẩu</label>
            <input
              placeholder="Mật khẩu"
              id="password"
              type={showpassword ? "text" : "password"}
              className="input-form"
              value={user.password}
              name="password"
              onChange={handleOnchange}
            />
            <FaEye
              className="absolute right-8 top-[70px] lg:right-10 font-bold lg:text-xl cursor-pointer"
              onClick={() => setShowPassword(!showpassword)}
            />

            {showmesage && (
              <p className="text-xs w-full px-6 text-left font-bold text-red-500 absolute bottom-[-10px]">Lỗi! {message}</p>
            )}
          </div>

          {/* Nút đăng nhập */}
          <button className="my-3 px-3 py-2 mx-3 lg:py-3 w-[90%] bg-primary hover:bg-primary/70 transition-all duration-500 rounded-md text-white font-semibold">
            Đăng nhập
          </button>

          {/* Divider */}
          <div className="w-[90%] h-px bg-gray-400 my-3"></div>

          {/* Nút đăng nhập Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center w-[90%] py-2 border rounded-lg shadow-sm hover:bg-gray-100 transition"
          >
            <FcGoogle className="text-2xl mr-2" />
            <span className="text-gray-700 font-medium">Đăng nhập với Google</span>
          </button>

          <div className="font-bold text-xs lg:text-base mb-4 mt-3 text-black">
            <p>
              Bạn chưa có tài khoản?{" "}
              <Link to={"/regester"} className="text-primary hover:text-red-500">Đăng ký</Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Login;
