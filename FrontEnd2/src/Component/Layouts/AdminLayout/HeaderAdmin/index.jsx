import React, { useState } from "react";
import { FaBell, FaEnvelope, FaSearch } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { getCSRFTokenFromCookie } from "../../../Token/getCSRFToken";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
const HeaderAdmin = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const access_token = getCSRFTokenFromCookie("access_token_admin");
  // Hàm xử lý sự kiện click để toggle menu
  const navigate=useNavigate();
  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const handleLogout = () => {
    if(window.confirm("Bạn chắc chắn muốn đăng xuât")){
      Cookies.remove("access_token_admin", {path: "/" });
      Cookies.remove("refresh_token_admin",  {path: "/" });
  
      // Điều hướng về trang đăng nhập
      navigate("/admin/login");
      alert("Đăng xuất thành công!");
    };

    }
    // Xóa token khỏi cookie
  return (
    <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center border rounded-lg px-4 py-2 bg-gray-100 w-[400px]">
          <FaSearch className="text-gray-500 text-lg" />
          <input
            type="text"
            placeholder="Search here..."
            className="ml-3 flex-1 outline-none bg-transparent text-base text-gray-700"
          />
        </div>

      {/* Logo */}

      {/* Admin Icons */}
      <div className="flex items-center space-x-4 mr-10">
        <FaBell className="text-gray-600 text-xl cursor-pointer" />
        <FaEnvelope className="text-gray-600 text-xl cursor-pointer" />
        <div className="relative">
          {/* User Icon */}
          <FaUserCircle
            className="text-gray-600 text-3xl cursor-pointer"
            onClick={handleMenuClick} // Gọi hàm handleMenuClick khi click vào icon
          />
          {/* Dropdown Menu */}
          <div
            className={`absolute right-0 mt-2 bg-white border rounded-lg shadow-md w-40 transition-all duration-200 ${
              isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
          >
            {
              access_token?
              (
                <ul className="text-gray-700">
                  <li className="px-4 py-2 cursor-pointer">Tài khoản</li>
                  <li className="px-4 py-2 cursor-pointer"
                  onClick={handleLogout}
                  >Đăng xuất</li>
                </ul>

              )
              :(
                <ul className="text-gray-700">
                  <Link className="px-4 py-2 cursor-pointer" to={"/admin/login"}>Đăng nhập</Link>
                  
                </ul>
              )
            }
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin;
