import { IoMdSearch } from "react-icons/io";
import { FaShoppingCart } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { IoMenu } from "react-icons/io5";
import { FaPhone } from "react-icons/fa";
import { IoTimeSharp } from "react-icons/io5";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Tippy from "@tippyjs/react/headless";
import "tippy.js/dist/tippy.css";
import Search from "./Search";
function Navbar() {
  const navigate = useNavigate();


  const titles_2 = [
    { title: "Giỏ hàng", link: "/cartshopping" },
    { title: "Tài khoản của tôi", link: "/" },
    { title: "Đăng xuất", link: "/" },
  ];
  const [ismenu, setIsmenu] = useState(false);
  const UserStatus = useSelector((state) => state.user.status);
  const Userinfor = useSelector((state) => state.user.user);
  const [search, setSearch] = useState("");
  const handleOnchange = (e) => {
    e.preventDefault();
    setSearch(e.target.value);
  };
  const handleSearchSubmit = () => {
    if (search.trim() !== "") {
      const keyword = search.trim();
      const encodedKeyword = encodeURIComponent(keyword);
      navigate(`/search?keyword=${encodedKeyword}`);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && search.trim() !== "") {
      handleSearchSubmit();
    }
  };
  return (
    <div>
      {/*upper navbar */}
      <div className="flex justify-between items-center px-6 py-3 lg:px-16 xl:px-32 relative">
        {/*Menu  */}
        <div className="block lg:hidden text-2xl font-bold text-primary ">
          <IoMenu onClick={() => setIsmenu(!ismenu)} />
        </div>
        {/*logo */}
        <div className="">
          <Link
            to="/"
            className="text-primary uppercase text-xl font-bold font-Montserrat"
          >
            PQTLSHOP
          </Link>
        </div>
        {/* Mobile Search - Below Logo */}
        <div className="lg:hidden absolute top-full left-0 right-0 px-6 py-3 bg-gray-50">
          <Tippy
            placement="bottom"
            trigger="click"
            interactive={true}
            render={(attrs) => (
              <div className="box bg-white shadow-lg rounded-lg" tabIndex="-1" {...attrs}>
                <Search search={search.toLowerCase().split(" ")} />
              </div>
            )}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={search}
                onChange={(e) => handleOnchange(e)}
                onKeyDown={handleKeyDown}
              />
              <IoMdSearch className="absolute top-3 left-3 text-xl text-gray-400" />
            </div>
          </Tippy>
        </div>

        {/*search input */}
        <Tippy
          placement="bottom"
          trigger="click"
          interactive={true}
          render={(attrs) => (
            <div
              className="box bg-white lg:ml-[100px] xl:ml-[200px]"
              tabIndex="-1"
              {...attrs}
            >
              <Search search={search.toLowerCase().split(" ")} />
            </div>
          )}
        >
          <div className="hidden lg:flex relative group">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm... "
              className="input-search"
              value={search}
              onChange={(e) => handleOnchange(e)}
              onKeyDown={handleKeyDown}
            />
            <IoMdSearch className="absolute top-2 left-3 text-xl text-gray-600 group-hover:text-primary font-bold" />
          </div>
        </Tippy>
        {/*contact and user */}
        <div className="flex justify-between items-center gap-x-4">
          {/* button sale */}
          <div className="">
            <button className="text-md font-Montserrat text-white 
                        font-bold cursor-pointer py-1 px-3 bg-gradient-to-r from-primary to-yellow-200
                        rounded-md hover:text-red-500
                        " title="Ưu đãi hôm nay">
              <Link to={"/saleproduct"}>Ưu đãi</Link>
            </button>
          </div>
          {/* button clearance */}
          <div className="">
            <button className="text-md font-Montserrat text-white 
                        font-bold cursor-pointer py-1 px-3 bg-gradient-to-r from-purple-600 to-pink-500
                        rounded-md hover:text-yellow-300
                        " title="Sản phẩm thanh lý">
              <Link to={"/clearance"}>Thanh lý</Link>
            </button>
          </div>
          {/*other button */}
          <div className="hidden lg:flex justify-between items-center gap-x-5 xl:gap-x-10">
            <li className="flex justify-between items-center gap-x-2">
              <FaPhone className="text-yellow-600" />{" "}
              <p className="text-primary font-bold cursor-pointer hover:text-yellow-600">
                0123456789
              </p>
            </li>
            <li className="flex justify-between items-center gap-x-2">
              <IoTimeSharp className="text-yellow-600" />{" "}
              <p className="text-primary font-bold cursor-pointer hover:text-yellow-600">
                7:30-21:30
              </p>
            </li>
            <li className="list-none text-xl font-bold hover:text-primary relative group text-center">
              <Link to={UserStatus ? "/profile" : "/login"}>
                <FaUser className=" text-center" />
                <div className="absolute text-xs whitespace-nowrap hidden group-hover:block cursor-pointer text-center w-full py-1">
                  {UserStatus ? (
                    <p className=" absolute left-[-40px]">
                      {Userinfor.fullName}
                    </p>
                  ) : (
                    <p className="absolute left-[-17px]">Đăng Nhập</p>
                  )}
                </div>
              </Link>
            </li>
            {UserStatus ? (
              <div></div>
            ) : (
              <li className="list-none text-[10px] font-bold ">
                <Link
                  to={"/regester"}
                  className="px-2 py-2 bg-primary hover:bg-primary/70 rounded-md text-white whitespace-nowrap"
                >
                  Đăng Ký
                </Link>
              </li>
            )}
            <li className="list-none text-xl font-bold hover:text-primary relative group text-center">
              <Link to="/cartshopping">
                <FaShoppingCart className="w-full text-center" />
                <p className="absolute text-xs whitespace-nowrap hidden group-hover:block cursor-pointer text-center w-full py-1">
                  Giỏ hàng
                </p>
              </Link>
            </li>
          </div>
        </div>
      </div>
      {/* Mobile Menu Dropdown */}
      {ismenu && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-6 py-4">
            <p className="text-xs font-bold text-gray-500 mb-3 uppercase">Tài Khoản</p>
            {titles_2.map((title_2, index) => (
              <Link
                key={index}
                to={title_2.link}
                className="block py-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded transition-colors font-medium"
                onClick={() => setIsmenu(false)}
              >
                {title_2.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;
