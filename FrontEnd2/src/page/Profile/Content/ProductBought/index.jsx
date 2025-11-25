import { useEffect, useState } from "react";
import { PricetoString } from "..//..//..//..//Component/Translate_Price/index.jsx";
import { request1 } from "../../../../utils/request.js";
import { getCSRFTokenFromCookie } from "../../../../Component/Token/getCSRFToken.js";
import { Link } from "react-router-dom";

function ProductBought() {
  const titles = ["Đơn hàng", "Ngày", "Trạng thái", "Tổng", "Thao tác"];
  const access_token = getCSRFTokenFromCookie("access_token");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!access_token) {
        setError("Vui lòng đăng nhập để xem đơn hàng");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await request1.get("orders", {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        console.log("Orders API Response:", response.data);
        setOrders(response.data || []);
      } catch (error) {
        console.error("Lỗi khi tải đơn hàng:", error);
        setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [access_token]);
  // Show loading state
  if (loading) {
    return (
      <div className="font-Montserrat flex justify-center items-center my-10">
        <p className="text-lg font-semibold">Đang tải đơn hàng...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="font-Montserrat flex justify-center items-center my-10">
        <p className="text-lg font-semibold text-red-500">{error}</p>
      </div>
    );
  }

  // Show orders or empty state
  return orders && orders.length > 0 ? (
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
          {orders.map((order, index) => {
            // Use shipping_status if orderStatus is not available
            const status = order.orderStatus || order.shipping_status || "Chưa xác định";
            // Format date safely
            const orderDate = order.orderDate
              ? (typeof order.orderDate === 'string' ? order.orderDate : new Date(order.orderDate).toLocaleDateString('vi-VN'))
              : "N/A";

            return (
              <div
                key={order.id || index}
                className="grid grid-cols-5 gap-x-6 md:gap-x-12 text-center text-gray-700 py-4 border-b-2 border-gray-200 text-[8px] md:text-sm items-center"
              >
                {/* mã hàng */}
                <p className="text-primary font-bold text-sm">{index + 1}</p>
                <p className="font-medium">{orderDate}</p>
                <p className="font-semibold text-primary cursor-pointer">
                  {status}
                </p>
                <p className="font-bold text-red-500 text-[10px] md:text-md">
                  {order.finalAmount ? PricetoString(order.finalAmount.toString()) : "0"}đ
                </p>
                {/* thao tác */}
                <div>
                  <Link to={`/buildDetail/${order.id}`}>
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
