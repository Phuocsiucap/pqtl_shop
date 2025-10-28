import { useEffect, useState } from "react";
import { PricetoString } from "..//..//..//..//Component/Translate_Price/index.jsx";
import { request1 } from "../../../../utils/request.js";
import { getCSRFTokenFromCookie } from "../../../../Component/Token/getCSRFToken.js";
import { Link } from "react-router-dom";
function ProductBought() {
  const titles = ["Đơn hàng", "Ngày", "Trạng thái", "Tổng", "Thao tác"];
  const access_token = getCSRFTokenFromCookie("access_token");
  const [builds, setBuilds] = useState([]);
  useEffect(() => {
    const fetch = async () => {
      try {
        const respone = await request1.get("order/order_list/", {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        console.log(respone.data);
        setBuilds(respone.data);
      } catch (error) {
        console.log("Lỗi ", error);
      }
    };
    if (builds.length === 0) {
      fetch();
    }
  }, []);
  return builds && builds.length > 0 ? (
    <div className="font-Montserrat">
      {/* tiêu đề */}
      <div className="pb-6 pt-2 border-b-2 border-gray-200">
        <ul className="grid grid-cols-5 gap-x-8 md:gap-x-16 font-bold text-[10px] md:text-base text-center">
          {titles.map((title, index) => {
            return (
              <li key={index} className="whitespace-nowrap">
                {title}
              </li>
            );
          })}
        </ul>
      </div>
      {/* sản phẩm */}
      <div>
        <ul>
          {builds.map((build, index) => {
            return (
              <div
                key={index}
                className="grid grid-cols-5 gap-x-6 md:gap-x-12 text-center text-gray-700 py-4 border-b-2 border-gray-200 text-[8px] md:text-sm items-center"
              >
                {/* mã hàng */}
                <p className="text-primary font-bold text-sm">{index + 1}</p>
                <p className="font-medium">{build.purchase_date}</p>
                <p className="font-semibold text-primary cursor-pointer">
                  {build.shipping_status}
                </p>
                <p className="font-bold text-red-500 text-[10px] md:text-md">
                  {PricetoString(build.total_amount)}
                </p>
                {/* thao tác */}
                <div>
                  <Link to={`/buildDetail/${build.order_id}`}>
                    <button className="px-4 py-2 bg-primary text-white rounded-md font-bold">
                      Xem
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </ul>
      </div>
    </div>
  ) : (
    <div className="font-semibold text-xl flex justify-center my-10">
      <p>Bạn chưa đặt đơn hàng nào</p>
    </div>
  );
}
export default ProductBought;
