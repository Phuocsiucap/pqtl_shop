import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FaUser } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { LoginUser } from "../../redux/Actions";
import {request1} from "../../utils/request";
import axios from "axios";
import Cookies from "js-cookie";
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
      const response = await request1.post("user/login/", {
        email: user.email,
        password: user.password,
      });
  
      if (response.status === 200) {
        alert("Đăng nhập thành công");
  
        // Lưu thông tin vào cookie
        Cookies.set("access_token", response.data.access_token, { expires: 7, path: "" });
        Cookies.set("refresh_token", response.data.refresh_token, { expires: 7, path: "" });
        Cookies.set("user", JSON.stringify(response.data.user), { expires: 7, path: "" });
        localStorage.setItem('user',JSON.stringify(response.data.user));
        dispatch(LoginUser(response.data.user));
        navigate("/");
      }
    } catch (e) {
      if (e.response?.status === 400) {
        setMessage("Thông tin đăng nhập không đúng");
        setShowmessage(true);
      } else {
        alert("Có lỗi sảy ra Không kết nối được với server");
      }
    }
  };
  
  return (
    // login page
    <div className="flex items-center h-[95vh] font-Montserrat overflow-hidden box-border">
      <form
        action=""
        className="w-full flex justify-center items-center overflow-hidden"
        onSubmit={handleOnsumbit}
      >
        <div className="font-Montserrat w-[100%] md:w-[50%] xl:w-[30%] border-2 md:border-gray-200 rounded-md flex flex-col gap-y-2 items-center mx-2">
          <Link to={"/"}>
            <p className="font-bold text-primary  text-sm lg:text-3xl uppercase text-center mt-5">
              phdtech
            </p>
          </Link>
          <p className="font-bold text-2xl">Đăng nhập</p>
          <div className="flex flex-col py-3 w-full relative group items-center">
            <label
              htmlFor="email"
              className="text-left w-full px-6 font-semibold py-2"
            >
              Email
            </label>
            <input
              type="text"
              placeholder="Địa chỉ gmail"
              id="email"
              className="input-form"
              value={user.email}
              name="email"
              onChange={(e) => handleOnchange(e)}
            />
            <FaUser className="absolute right-8 top-[70px] lg:right-10 font-bold lg:text-xl group-focus:text-primary " />
            {showmesage && (
              <p className="text-xs w-full px-6 text-left font-bold text-red-500 absolute bottom-[-10px]">
                Lỗi! {message}
              </p>
            )}
          </div>
          <div className="flex flex-col items-center py-3 w-full text-sm lg:text-base group relative">
            <label
              htmlFor="password"
              className="font-semibold w-full px-6 py-2 text-left"
            >
              Mật khẩu
            </label>
            <input
              placeholder="Mật khẩu"
              id="password"
              type={showpassword ? "text" : "password"}
              className="input-form"
              value={user.password}
              name="password"
              onChange={(e) => handleOnchange(e)}
            />
            <FaEye
              className="absolute right-8 top-[70px] lg:right-10 font-bold lg:text-xl group-focus:text-primary cursor-pointer"
              onClick={() => setShowPassword(!showpassword)}
            />
            {showmesage && (
              <p className="text-xs w-full px-6 text-left font-bold text-red-500 absolute bottom-[-10px]">
                Lỗi! {message}
              </p>
            )}
          </div>
          {/* button */}
          <button className="my-3 px-3 py-2 mx-3 lg:py-3 w-[90%]  bg-primary hover:bg-primary/70 transition-all duration-500 ease-in-out rounded-md text-white font-semibold">
            Đăng nhập
          </button>
          <div className="font-bold text-xs lg:text-base mb-2 text-black">
            <p>
              Bạn chưa có tài khoản?&ensp;
              <Link
                to={"/regester"}
                className="text-primary hover:text-red-500"
              >
                Đăng ký
              </Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
export default Login;
