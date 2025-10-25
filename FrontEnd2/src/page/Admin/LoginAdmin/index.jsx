import React, { useState } from "react";
import {request1} from "../../../utils/request.js"
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate=useNavigate();
  const handleSubmit = async(e) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
    // Xử lý đăng nhập tại đây (Gửi request đến backend)
    try{
      if(email==""|| password==""){
        alert("Điền đầy đủ thông tin đăng nhập")
        return;
      }
      const response=await request1.post("admin/login/",{
        username:email,
        password:password
      })
      console.log(response.data.access_token);
      if (response.status === 200) {
        alert("Đăng nhập thành công");
        Cookies.set("access_token_admin", response.data.access_token, { expires: 7, path: "/" });
        Cookies.set("refresh_token_admin", response.data.refresh_token, { expires: 7, path: "/" });
        navigate("/admin")
      }
    }
    catch(e){
      console.log("Lỗi ",e)
    }

  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800">Đăng Nhập</h2>
        <form className="mt-6" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
              Email
            </label>
            <input
              // type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Nhập email của bạn"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="password">
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Nhập mật khẩu của bạn"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
          >
            Đăng Nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
