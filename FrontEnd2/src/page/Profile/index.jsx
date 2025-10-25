import { useSelector } from "react-redux";
import { FaRegUser } from "react-icons/fa6";
import { ContentAccounts } from "./Content";
import { useState } from "react";

function Profile() {
  const titles = ["Tài khoản của tôi", "Đơn hàng", "Khuyến mãi của tôi", "Đăng xuất"];
  const UserInfor = useSelector((state) => state.user.user);
  const [content, setContent] = useState(0);

  const handOnclick = (index) => {
    setContent(index);
  };

  let Content = ContentAccounts[content].component;

  return (
    <div className="font-Montserrat test">
      {/* Header */}
      <div className="py-5 bg-gray-50/50 text-center lg:text-left border-b-2 border-gray-100">
        <p className="uppercase font-bold text-3xl py-2">My account</p>
        <p className="font-semibold text-base text-gray-600">Trang tài khoản</p>
      </div>

      <div className="lg:flex mt-5">
        {/* Sidebar */}
        <div className="basis-[100%] lg:basis-[30%] border-x-gray-50 border-x-2">
          <div className="mt-3 ml-2 font-Montserrat">
            {/* Avatar */}
            <div className="flex items-center gap-x-5 px-4">
              <div className="flex items-center justify-center w-[70px] h-[70px] lg:w-[100px] lg:h-[100px] rounded-full bg-gray-50 border-2 border-gray-200">
                <FaRegUser className="text-4xl lg:text-5xl font-semibold text-gray-500" />
              </div>
              <div className="font-semibold text-lg lg:text-xl text-gray-700">
                {UserInfor && UserInfor.fullName}
              </div>
            </div>

            {/* Navigation Items */}
            <div className="mt-5">
              <ul className="space-y-2">
                {titles.map((title, index) => (
                  <li
                    key={index}
                    className={`py-4 px-4 lg:px-6 font-bold rounded-lg cursor-pointer transition-all duration-300 ease-in-out
                      ${content === index
                        ? "bg-primary/10 text-primary border-r-4 border-primary"
                        : "text-gray-500 hover:text-primary hover:bg-gray-100"
                      }`}
                    onClick={() => handOnclick(index)}
                  >
                    {title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="block lg:basis-[70%] border-r-2 border-r-gray-100">
          <Content />
        </div>
      </div>
    </div>
  );
}

export default Profile;
