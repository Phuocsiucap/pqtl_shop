import { IoMdSearch } from "react-icons/io";
import { FaShoppingCart } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { IoMenu } from "react-icons/io5";
import { FaPhone } from "react-icons/fa";
import { IoTimeSharp } from "react-icons/io5";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Tippy from "@tippyjs/react/headless";
import "tippy.js/dist/tippy.css";
import Search from "./Search";
function Navbar() {
  const titles_1 = [
    { title: "Máy tính", link: "/laptop" },
    { title: "Chuột", link: "/mouse" },
    { title: "Bàn Phím", link: "/keyboard" },
    { title: "Sale hot", link: "/" },
    { title: "Chơi game nhận thưởng hot", link: "https://trihung.itch.io/game-discount" }, 
    { title: "Về chúng tôi", link: "/about" },
  ];
  
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
            PhdTech
          </Link>
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
            />
            <IoMdSearch className="absolute top-2 left-3 text-xl text-gray-600 group-hover:text-primary font-bold" />
          </div>
        </Tippy>
        {/*contact and user */}
        <div className="flex justify-between items-center gap-x-4">
          {/* button sale */}
          {/* button sale */}
          <div className="">
            <button
              className="text-md font-Montserrat text-white 
                        font-bold cursor-pointer py-1 px-3 bg-gradient-to-r from-primary to-yellow-200
                        rounded-md hover:text-red-500
                        "
            >
              <Link to={"/saleproduct"}>Sale</Link>
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
                8:30-18:30
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
      {/*lower navbar */}
      <div className="bg-second py-2 text-center justify-center">
        <ul className="hidden text-center items-center gap-x-20  text-white font-Montserrat justify-center lg:flex">
          {titles_1.map((title_1, index) => {
            return (
              <li key={index} className="top-menu-item">
                <Link to={title_1.link}>{title_1.title}</Link>
              </li>
            );
          })}
        </ul>
        {/* sreach bar from sm to md */}
        <Tippy
          placement="bottom"
          trigger="click"
          interactive={true}
          render={(attrs) => (
            <div className="box bg-white" tabIndex="-1" {...attrs}>
              <Search search={search.toLowerCase().split(" ")} />
            </div>
          )}
        >
          <div className="flex justify-center items-center lg:hidden relative group">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm... "
              className="input-search w-[80%]"
              value={search}
              onChange={(e) => handleOnchange(e)}
            />
          </div>
        </Tippy>
      </div>
      {
        <div
          className={`absolute block justify-around items-start w-full 
                    transition-all transform duration-500 ease-in-out
                    h-auto bg-gray-50 top-[45px] ${
                      ismenu
                        ? " opacity-100  translate-x-0"
                        : " opacity-0 translate-x-full"
                    } lg:hidden z-10`}
        >
          <ul className="font-Montserrat font-semibold py-2 text-xs text-red-500 hover:bg-gray-50 w-full text-center uppercase border-b-slate-200 md:text-xl">
            <p className="decoration-red-500">Sản phẩm</p>
            {titles_1.map((title_1, index) => {
              return (
                <li
                  key={index}
                  className=" font-Montserrat font-semibold text-center uppercase text-gray-500 hover:text-white hover:bg-primary/50 py-2 transition-all duration-500 ease-in-out md:text-lg md:py-5"
                  onClick={() => setIsmenu(!ismenu)}
                >
                  <Link to={title_1.link}>{title_1.title}</Link>
                </li>
              );
            })}
          </ul>
          <ul className="font-Montserrat font-semibold py-2 text-xs text-red-500 hover:bg-gray-50 w-full text-center uppercase md:text-xl">
            Tài Khoản
            {titles_2.map((title_2, index) => {
              return (
                <li
                  key={index}
                  className=" font-Montserrat font-semibold text-center uppercase text-gray-500 hover:text-white hover:bg-primary/50 py-2 transition-all duration-500 ease-in-out md:text-lg md:py-5"
                  onClick={() => setIsmenu(!ismenu)}
                >
                  <Link to={title_2.link}>{title_2.title}</Link>
                </li>
              );
            })}
          </ul>
        </div>
      }
    </div>
  );
}

export default Navbar;
