import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaChartLine, FaUsers, FaBoxOpen, FaFileInvoice, FaBook } from "react-icons/fa"; 
import { FaUser } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { BiCategory } from "react-icons/bi";
import { FaBookOpen } from "react-icons/fa6";
import Cookies from "js-cookie"; // Make sure to import Cookies

const Sidebar1 = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("/admin"); // State for active menu

  const menuItems = [
    { link: "/admin", label: "Quản lý doanh thu", icon: <FaChartLine /> },
    { link: "/admin/manageuser", label: "Quản lý người dùng", icon: <FaUsers /> },
    { link: "/admin/managegood", label: "Quản lý sản phẩm", icon: <FaBoxOpen /> },
    { link: "/admin/managebill", label: "Quản lý đơn hàng", icon: <FaFileInvoice /> },
  ];

  const menuItems1 = [
    { link: "/admin/profile", label: "Tài khoản cá nhân", icon: <FaUser /> },
    { link: "/admin/Instructions", label: "Hướng dẫn sử dụng", icon: <FaBookOpen /> },
  ];

  const handleOnclickLogOut = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất")) {
      Cookies.remove("access_token_admin", { path: "/" });
      Cookies.remove("refresh_token_admin", { path: "/" });
      alert("Đăng xuất thành công");
      navigate("/admin/login");
    }
  };

  return (
    <div className="bg-white shadow-lg font-Montserrat rounded-lg overflow-hidden h-screen">
      {/* Logo */}
      <div className="p-6 border-b">
        <Link to={"/admin"}>
            <h1 className="text-3xl font-extrabold text-primary tracking-wide">
            PHDTECH
            </h1>
        </Link>
      </div>

      {/* Navigation */}
      <div className="p-6 space-y-6">
        <h3 className="text-blue-600 text-lg font-semibold uppercase tracking-wide">
          Quản trị Admin
        </h3>
        <ul className="space-y-4 font-medium">
          <li className="flex items-center space-x-2">
            <BiCategory className="text-xl" />
            <span className="font-bold text-lg text-gray-800">Dashboards</span>
          </li>
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className={`ml-4 flex items-center space-x-2 py-2 px-4 rounded-lg cursor-pointer transition-all duration-300 ease-in-out 
                ${activeMenu === item.link 
                  ? "bg-blue-100 text-blue-600" 
                  : "text-gray-700 hover:bg-blue-50"}`}
              onClick={() => setActiveMenu(item.link)} // Set active menu item
            >
              <li
                className="flex items-center space-x-2"
              >
                <span>{item.icon}</span> {/* Display icon */}
                <span>{item.label}</span> {/* Display label */}
              </li>
            </Link>
          ))}
        </ul>

        <h3 className="text-blue-600 text-lg font-semibold uppercase tracking-wide mt-8">
          Quản lý tài khoản
        </h3>
        <ul className="space-y-4 font-medium">
          {menuItems1.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className={`ml-4 flex items-center space-x-2 py-2 px-4 rounded-lg cursor-pointer transition-all duration-300 ease-in-out 
                ${activeMenu === item.link 
                  ? "bg-blue-100 text-blue-600" 
                  : "text-gray-700 hover:bg-blue-50 "}`}
              onClick={() => setActiveMenu(item.link)} // Set active menu item
            >
              <li
                className="flex items-center space-x-2"
              >
                <span>{item.icon}</span> {/* Display icon */}
                <span>{item.label}</span> {/* Display label */}
              </li>
            </Link>
          ))}
          <li
            className="ml-4 flex items-center space-x-2 py-2 px-4 rounded-lg cursor-pointer transition-all duration-300 ease-in-out hover:bg-red-100 hover:text-red-600"
            onClick={handleOnclickLogOut}
          >
            <Link className="flex items-center space-x-2">
              <IoLogOut />
              <p>Đăng xuất</p>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar1;
