import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { request1, request, getFullImageUrl } from "../../utils/request";
import { getCSRFTokenFromCookie } from "../../Component/Token/getCSRFToken";
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import { PricetoString } from "../../Component/Translate_Price";
import { FaMapMarkerAlt } from "react-icons/fa";
import { IoTime } from "react-icons/io5";

function BuildDetail() {
  const { id } = useParams();
  const access_token = getCSRFTokenFromCookie("access_token");
  const [build, setBuild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!access_token) {
        setError("Vui lòng đăng nhập để xem chi tiết đơn hàng");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await request1.get(`orders/${id}`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        console.log("Order Detail API Response:", response.data);
        setBuild(response.data);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết đơn hàng:", error);
        setError("Không thể tải chi tiết đơn hàng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id, access_token]);

  const handleOnclickCancel = async () => {
    if (window.confirm("Bạn chắc chắn muốn hủy đơn hàng này?")) {
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

        if (response.status === 200) {
          const successMessage = response.data.success || "Đơn hàng đã được hủy thành công.";
          alert(successMessage);

          // Update order status locally
          setBuild((prevBuild) => ({
            ...prevBuild,
            orderStatus: "Đã hủy",
            shipping_status: "Đã hủy",
          }));
        } else {
          const errorMessage = response.data.error || "Có lỗi xảy ra. Vui lòng thử lại.";
          alert(errorMessage);
        }
      } catch (error) {
        console.error("Lỗi khi hủy đơn hàng:", error);
        alert("Không thể hủy đơn hàng. Vui lòng thử lại sau.");
      }
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="test font-Montserrat flex justify-center items-center my-10">
        <p className="text-lg font-semibold">Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="test font-Montserrat flex justify-center items-center my-10">
        <p className="text-lg font-semibold text-red-500">{error}</p>
      </div>
    );
  }

  // Show not found state
  if (!build) {
    return (
      <div className="test font-Montserrat flex justify-center items-center my-10">
        <p className="text-lg font-semibold">Không tìm thấy đơn hàng.</p>
      </div>
    );
  }

  const status = build.orderStatus || build.shipping_status || "Chưa xác định";
  const orderDate = build.orderDate
    ? (typeof build.orderDate === 'string' ? build.orderDate : new Date(build.orderDate).toLocaleDateString('vi-VN'))
    : "N/A";


  return (
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
            Mã đơn hàng: <span>{build.id}</span>
          </p>
          <p>|</p>
          <p className="text-red-500 font-semibold pr-2">
            Trạng thái: <span>{status}</span>
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
            {build.shippingAddress &&
              build.shippingAddress.split(",").map((item, idx) => {
                return <p key={idx}>{item.trim()}</p>;
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
              {orderDate}
            </span>
            : Đơn hàng đã được đặt
          </p>
          {status === "Đã hủy" && build.updatedAt && (
            <p className="text-[10px] md:text-base">
              <span className="text-red-500 font-semibold">
                {typeof build.updatedAt === 'string'
                  ? build.updatedAt
                  : new Date(build.updatedAt).toLocaleDateString('vi-VN')}
              </span>
              : Đơn hàng đã được hủy
            </p>
          )}
        </div>
      </div>
      <div>
        {build.items && build.items.length > 0 ? (
          <div>
            {build.items.map((item, index) => {
              return (
                <div
                  key={item.productId || index}
                  className="flex justify-between items-center border-b-[1.5px] border-gray-200 "
                >
                  <div className="flex justify-around items-center">
                    <div>
                      <img
                        src={item.image ? getFullImageUrl(item.image) : "/placeholder.png"}
                        alt={item.productName || "Product"}
                        className="w-[100px] h-[100px] md:w-[200px] md:h-[200px]"
                      />
                    </div>
                    <div>
                      <p className="top-menu-item text-[7px] md:text-base font-semibold cursor-pointer">
                        {item.productName || "Sản phẩm"}
                      </p>
                      <div className="text-[12px] md:text-base whitespace-nowrap font-semibold">
                        <p>
                          Số lượng : <span>{item.quantity || 0}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] md:text-base whitespace-nowrap text-red-500 font-semibold">
                    Đơn giá :{" "}
                    {item.total
                      ? PricetoString(item.total.toString())
                      : PricetoString(((item.price - (item.discount || 0)) * item.quantity).toString())
                    }đ
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">Không có sản phẩm trong đơn hàng này</p>
          </div>
        )}
      </div>
      <div className="flex justify-between text-sm md:text-xl text-red-500 font-semibold px-3 py-5">
        <p className="">Tổng tiền:</p>
        <p>{build.finalAmount ? PricetoString(build.finalAmount.toString()) : "0"}đ</p>
      </div>
      <div className="flex justify-end mx-3 md:mx-5 text-[10px] md:text-base">
        {status !== "Đã hủy" && status !== "Đã giao" &&
          <button
            className="button-primary bg-red-500 px-3 py-2 md:px-5 md:py-3 font-semibold"
            onClick={() => handleOnclickCancel()}
          >
            Hủy hàng
          </button>
        }
      </div>
    </div>
  );
}

export default BuildDetail;
