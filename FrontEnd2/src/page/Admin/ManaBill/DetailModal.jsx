// DetailModal Component
import { request1,request } from "../../../utils/request";
import { PricetoString } from "../../../Component/Translate_Price";
import { useNavigate, useLocation } from "react-router-dom";

const DetailModal = () => {
  
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order;
  console.log("Order data:", order);
  
  if (!order) {
    return (
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-semibold text-red-500">
          Không có dữ liệu đơn hàng!
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 mt-4"
        >
          Quay lại
        </button>
      </div>
    );
  }

  // Tính tổng tiền
  const totalBeforeDiscount = order.totalPrice || 0;
  const discountAmount = order.discount || 0;
  const shippingFee = order.shippingFee || 0;
  const finalAmount = order.finalAmount || 0;

  return (
    <div className="container mx-auto p-6 font-medium">
      <h2 className="text-3xl font-bold text-blue-600 mb-6">
        Chi tiết đơn hàng #{order.id}
      </h2>

      {/* Thông tin đơn hàng */}
      <div className="bg-blue-50 p-4 rounded-md shadow-md mb-8">
        <p className="text-lg text-primary">
          <strong>Thời gian đặt hàng:</strong> {order.orderDate ? new Date(order.orderDate).toLocaleString('vi-VN') : 'N/A'}
        </p>
        <p className="text-lg">
          <strong>Địa chỉ giao hàng:</strong> {order.shippingAddress || 'N/A'}
        </p>
        <p className="text-lg">
          <strong>Phương thức giao hàng:</strong> {order.shippingMethod || 'N/A'}
        </p>
        <p className="text-lg">
          <strong>Phương thức thanh toán:</strong> {order.paymentMethod || 'N/A'}
        </p>
        <p className="text-lg">
          <strong>Trạng thái thanh toán:</strong> {order.paymentStatus || 'N/A'}
        </p>
        <p className="text-lg text-red-500">
          <strong>Tổng tiền: </strong>
          {PricetoString(finalAmount)} đ
        </p>
        <p className="text-lg">
          <strong>Trạng thái vận chuyển:</strong>{" "}
          <span
            className={`${
              order.shipping_status === "Chờ xác nhận"
                ? "text-yellow-500"
                : order.shipping_status === "Đã xác nhận"
                ? "text-green-500"
                : order.shipping_status === "Hủy"
                ? "text-red-500"
                : order.shipping_status === "Đang giao"
                ? "text-blue-500"
                : order.shipping_status === "Đã giao"
                ? "text-purple-500"
                : "text-gray-600"
            }`}
          >
            {order.shipping_status || "Chờ xác nhận"}
          </span>
        </p>
      </div>

      {/* Bảng sản phẩm */}
      <h3 className="text-2xl font-semibold text-gray-700 mb-4">
        Sản phẩm đã mua:
      </h3>
      <table className="table-auto w-full border-collapse border border-gray-300 shadow-lg rounded-xl">
        <thead>
          <tr className="bg-blue-200 text-blue-800">
            <th className="border border-gray-300 px-4 py-3">Sản phẩm</th>
            <th className="border border-gray-300 px-4 py-3">Số lượng</th>
            <th className="border border-gray-300 px-4 py-3">Giá</th>
            <th className="border border-gray-300 px-4 py-3">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(order.items) && order.items.length > 0 && (
            <>
              {order.items.map((item, index) => {
                const itemTotal = (item.price || 0) * (item.quantity || 0);
                return (
                  <tr
                    key={index}
                    className={`text-center ${
                      index % 2 === 0 ? "bg-white" : "bg-blue-50"
                    }`}
                  >
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="text-center">{item.productName || item.name || 'N/A'}</div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.quantity || 0}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {PricetoString(item.price || 0)} đ
                    </td>
                    <td className="border border-gray-300 px-4 py-2 font-bold text-red-500">
                      {PricetoString(itemTotal)} đ
                    </td>
                  </tr>
                );
              })}
            </>
          )}
          
          {(!Array.isArray(order.items) || order.items.length === 0) && (
            <tr>
              <td colSpan={4} className="border border-gray-300 px-4 py-2 text-center">
                Không có sản phẩm nào
              </td>
            </tr>
          )}

          {/* Dòng tổng tiền, giảm giá và tổng tiền cuối cùng */}
          <tr className="bg-white font-medium text-lg">
            <td colSpan={3} className="text-left px-4 py-3">
              Tổng tiền sản phẩm
            </td>
            <td className="px-4 py-3 text-center text-red-500">
              {PricetoString(totalBeforeDiscount)} đ
            </td>
          </tr>
          
          {discountAmount > 0 && (
            <tr className="bg-white font-medium text-lg">
              <td colSpan={3} className="text-left px-4 py-3 text-primary">
                Giảm giá:
              </td>
              <td className="px-4 py-3 text-center">
                - {PricetoString(discountAmount)} đ
              </td>
            </tr>
          )}

          {shippingFee > 0 && (
            <tr className="bg-white font-medium text-lg">
              <td colSpan={3} className="text-left px-4 py-3">
                Phí vận chuyển:
              </td>
              <td className="px-4 py-3 text-center">
                + {PricetoString(shippingFee)} đ
              </td>
            </tr>
          )}
          
          <tr className="bg-white font-medium text-lg">
            <td colSpan={3} className="text-left px-4 py-3">
              Tổng tiền cần thanh toán:
            </td>
            <td className="px-4 py-3 text-red-600 text-center font-bold">
              {PricetoString(finalAmount)} đ
            </td>
          </tr>
        </tbody>
      </table>

      <button
        onClick={() => navigate(-1)}
        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 mt-6"
      >
        Quay lại
      </button>
    </div>
  );
};

export default DetailModal;
