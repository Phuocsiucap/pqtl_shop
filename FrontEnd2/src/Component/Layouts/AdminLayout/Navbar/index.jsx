import React, { useState } from "react";
import { FaUsers, FaMoneyBillWave, FaBoxOpen, FaShoppingCart } from "react-icons/fa"; // Import icons
import { Link } from "react-router-dom";
import { IoMdMenu } from "react-icons/io";
const Sidebar = () => {
  const [active, setActive] = useState("user-management");

  const menuItems = [
    { link:"/admin", label: "Quản lý doanh thu", icon: <FaMoneyBillWave /> },
    { link:"/admin/manageuser", label: "Quản lý người dùng", icon: <FaUsers /> },
    { link:"/admin/managegood", label: "Quản lý sản phẩm", icon: <FaBoxOpen /> },
    { link:"/admin/managebill", label: "Quản lý đơn hàng", icon: <FaShoppingCart /> },
  ];

  return (
    <div className="bg-white h-screen border-r-[1px] p-4 w-72 shadow-sm">
      {/* Logo */}
      <div className="text-3xl text-primary font-semibold h-[100px] flex justify-center items-center">
        <p className="mr-10">
          PHDTECH
        </p>
        <IoMdMenu/>
      </div>
      <div className="text-black text-2xl font-bold mb-6">
        Quản lý hệ thống
      </div>

      {/* Navigation Links */}
      <ul className="space-y-4">
        {menuItems.map((item) => (
          <li key={item.link} className="whitespace-nowrap">
            <Link
              to={`${item.link}`}
              className={`flex items-center gap-4 p-2 rounded-lg text-lg font-medium transition ${
                active === item.link
                  ? "bg-[rgb(0,173,162)] text-white"
                  : "text-gray-700 hover:bg-[rgba(0,173,162,0.2)]"
              }`}
              onClick={() => setActive(item.link)}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
