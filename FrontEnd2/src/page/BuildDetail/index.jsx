import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { request1,request } from "../../utils/request";
import { getCSRFTokenFromCookie } from "../../Component/Token/getCSRFToken";
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import { PricetoString } from "../../Component/Translate_Price";
import { FaMapMarkerAlt } from "react-icons/fa";
import { IoTime } from "react-icons/io5";
function BuildDetail() {
  const { id } = useParams();
  // console.log(id);
  const access_token = getCSRFTokenFromCookie("access_token");
  const [build, setBuild] = useState({});
  const [goods, setGoods] = useState([]);
  const [orderGood, setOrderGood] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetch = async () => {
      try {
        const respone = await request1.get(`order/order_detail/${id}/`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        console.log(respone.data);
        setBuild(respone.data.order);
        setGoods(respone.data.good);
        setOrderGood(respone.data.order_good);
      } catch (error) {
        console.log("Lỗi ", error);
      }
    };
    fetch();
  }, []);
  const handleOnclickCancel = async () => {
    if (window.confirm("Bạn chăc chắn muốn hủy đơn hang này")) {
      try {
        const response = await request1.post(
          `order/cancel_order/${id}/`,
          {},
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        
        // Check if the response is successful (status 200)
      if (response.status === 200) {
        // Display success message from the backend
        const successMessage = response.data.success || "Đơn hàng đã được hủy thành công.";
        alert(successMessage);

        // Update order status locally in the state
        setBuild((prevBuild) => ({
          ...prevBuild,
          shipping_status: "Đã hủy", // Update the status to "Cancelled"
        }));

        // Navigate to profile page
        // navigate("/profile");
      } else {
        // Handle other responses (if any)
        const errorMessage = response.data.error || "Có lỗi xảy ra. Vui lòng thử lại.";
        alert(errorMessage);
      }
      } catch (error) {
        console.error("Lỗi khi hủy đơn hàng:", error);
        alert("Không thể hủy đơn hàng. Vui lòng thử lại sau.");
      }
    }
  };
  return (
    build != null && (
      <div className="test font-Montserrat">
        <div className="flex justify-between mb-5 md:mb-10 items-center py-5 bg-lime-50">
          <div className="flex justify-around gap-x-5 items-center text-[10px] md:text-xl px-3">
            <FaArrowLeft />
            <Link
              className="font-semibold hover:text-primary transition-all duration-300 ease-in-out"
              to={"/profile"}
            >
              Trở lại
            </Link>
          </div>
          <div className="flex gap-x-5 md:mr-5 text-[10px] md:text-base">
            <p className="font-semibold">
              Mã đơn hàng: <span>{build.order_id}</span>
            </p>
            <p>|</p>
            <p className="text-red-500 font-semibold pr-2">
              Trạng thái: <span>{build.shipping_status}</span>
            </p>
          </div>
        </div>
        <div className="flex justify-between">
          <div className=" px-2 md:px-5 py-3 md:py-5">
            <p className="text-[10px] md:text-xl font-semibold my-2 md:my-5 flex gap-x-1 md:gap-x-3 items-center">
              <FaMapMarkerAlt className="text-base md:text-2xl" />
              Địa chỉ nhận hàng
            </p>
            <div className="px-5 text-[10px] md:text-base">
              {build.shipping_address &&
                build.shipping_address.split(".").map((item) => {
                  return <p key={item}>{item}</p>;
                })}
            </div>
          </div>
          <div className="px-2 md:px-5 py-3 md:py-5">
            <div className="flex gap-x-1 md:gap-x-3 items-center">
              <IoTime className="text-base md:text-2xl" />
              <p className="font-semibold text-center text-[10px] md:text-xl my-2 md:my-5">
                Thời gian
              </p>
            </div>
            <p className="text-[10px] md:text-base">
              <span className="text-primary font-semibold ">
                {build.purchase_date}
              </span>
              : Đơn hàng đã được đặt
            </p>
            {build.shipping_status === "Đã hủy"&& (
              <p className="text-[10px] md:text-base">
                <span className="text-red-500 font-semibold">
                  {build.updated_order_time}
                </span>
                : Đơn hàng đã được hủy
              </p>
            )}
          </div>
        </div>
        <div>
          {goods && orderGood && (
            <div>
              {goods.map((item, index) => {
                const goodOrder = orderGood.find((i) => i.good === item.id);
                return (
                  <div
                    key={index}
                    className="flex justify-between items-center border-b-[1.5px] border-gray-200 "
                  >
                    <div className="flex justify-around items-center">
                      <div>
                        <img
                          src={`${request}${item.image}`}
                          alt=""
                          className="w-[100px] h-[100px] md:w-[200px] md:h-[200px]"
                        />
                      </div>
                      <div>
                        <p className="top-menu-item text-[7px] md:text-base font-semibold cursor-pointer">
                          {item.goodName}
                        </p>
                        <div className="text-[12px] md:text-base whitespace-nowrap font-semibold">
                          <p>
                            Số lượng : <span>{goodOrder.quantity}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] md:text-base whitespace-nowrap text-red-500 font-semibold">
                      Đơn giá :{" "}
                      {PricetoString(
                        parseInt(item.price.split(".")[0]) * goodOrder.quantity
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex justify-between text-sm md:text-xl text-red-500 font-semibold px-3 py-5">
          <p className="">Tổng tiền:</p>
          <p>{build.total_amount && PricetoString(build.total_amount)}đ</p>
        </div>
        <div className="flex justify-end mx-3 md:mx-5 text-[10px] md:text-base">
        {
            build.shipping_status!=="Đã hủy"&&
          <button
            className="button-primary bg-red-500 px-3 py-2 md:px-5 md:py-3 font-semibold"
            onClick={() => handleOnclickCancel()}
          >
            Hủy hàng
          </button>
        }
        </div>
      </div>
    )
  );
}

export default BuildDetail;
