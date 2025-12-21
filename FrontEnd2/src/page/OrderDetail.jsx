import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { request1 } from "./../utils/request";
import { getCSRFTokenFromCookie } from "./../Component/Token/getCSRFToken";
import { PricetoString } from "./../Component/Translate_Price";
import { FaArrowLeft, FaMapMarkerAlt, FaCreditCard, FaTruck, FaTimes, FaCheckCircle } from "react-icons/fa";

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voucher, setVoucher] = useState(null);
  const access_token = getCSRFTokenFromCookie("access_token");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await request1.get(`orders/${id}`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });
        setOrder(response.data);

        // Fetch voucher if userVoucherId exists
        if (response.data.userVoucherId) {
          const voucherResponse = await request1.get("v1/vouchers/redeemed_vouchers/", {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          });
          const userVouchers = voucherResponse.data;
          const appliedVoucher = userVouchers.find(v => v.id === response.data.userVoucherId);
          setVoucher(appliedVoucher);
        }
      } catch (error) {
        console.error("Lỗi khi lấy đơn hàng:", error);
        alert("Không thể tải chi tiết đơn hàng.");
        navigate("/profile");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id, access_token, navigate]);

  const handleCancelOrder = async () => {
    if (window.confirm("Bạn chắc chắn muốn hủy đơn hàng này?")) {
      try {
        const response = await request1.delete(`orders/${id}`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        if (response.status === 200 || response.status === 204) {
          const successMessage = (response.data && response.data.message) || "Đơn hàng đã được hủy thành công.";
          alert(successMessage);

          // Update order status locally
          setOrder((prevOrder) => ({
            ...prevOrder,
            orderStatus: "Hủy",
          }));
        } else {
          const errorMessage = (response.data && response.data.error) || "Có lỗi xảy ra. Vui lòng thử lại.";
          alert(errorMessage);
        }
      } catch (error) {
        console.error("Lỗi khi hủy đơn hàng:", error);
        const errorMessage = (error.response && error.response.data && error.response.data.error) || "Không thể hủy đơn hàng. Vui lòng thử lại sau.";
        alert(errorMessage);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Chờ xác nhận":
        return "bg-yellow-100 text-yellow-800";
      case "Đã xác nhận":
        return "bg-blue-100 text-blue-800";
      case "Đang giao":
        return "bg-purple-100 text-purple-800";
      case "Đã giao":
        return "bg-green-100 text-green-800";
      case "Hủy":
      case "Đã hủy":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canCancelOrder = (status) => {
    return status === "Chờ xác nhận" || status === "Đã xác nhận";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Đang tải chi tiết đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <FaTimes className="text-6xl text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold">Không tìm thấy đơn hàng.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaArrowLeft />
              <span>Quay lại</span>
            </button>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-gray-800">Chi Tiết Đơn Hàng</h1>
              <p className="text-gray-500">#{order.id}</p>
            </div>
          </div>

          {/* Status and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.orderStatus)}`}>
                {order.orderStatus}
              </span>
              <span className="text-gray-500">
                {new Date(order.orderDate).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            {canCancelOrder(order.orderStatus) && (
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <FaTimes />
                Hủy đơn hàng
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Products */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                Sản phẩm đã đặt
              </h2>
              <div className="space-y-4">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <img
                        src={item.image || "https://via.placeholder.com/100"}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{item.productName}</h3>
                        <p className="text-gray-600">Số lượng: {item.quantity}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-gray-500 line-through">{PricetoString(item.price)} VND</span>
                          {item.discount > 0 && (
                            <span className="text-red-500">-{PricetoString(item.discount)} VND</span>
                          )}
                          <span className="font-semibold text-gray-800">
                            {PricetoString((item.price - (item.discount || 0)) * item.quantity)} VND
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">Không có sản phẩm nào</p>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Tổng tiền sản phẩm:</span>
                  <span>{PricetoString(order.totalPrice)} VND</span>
                </div>
                {voucher && (
                  <div className="flex justify-between text-green-600">
                    <span>Voucher ({voucher.voucher.title}):</span>
                    <span>-{PricetoString(order.discount || 0)} VND</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span>{PricetoString(order.shippingFee || 0)} VND</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">{PricetoString(order.finalAmount)} VND</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="space-y-6">
            {/* Shipping Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaTruck className="text-blue-500" />
                Thông tin giao hàng
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-gray-400 mt-1" />
                  <div>
                    <p className="font-semibold">Địa chỉ giao hàng</p>
                    <p className="text-gray-600">{order.shippingAddress}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaTruck className="text-gray-400" />
                  <div>
                    <p className="font-semibold">Phương thức vận chuyển</p>
                    <p className="text-gray-600">{order.shippingMethod}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaCreditCard className="text-green-500" />
                Thông tin thanh toán
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold">Phương thức thanh toán</p>
                  <p className="text-gray-600">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="font-semibold">Trạng thái thanh toán</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    order.paymentStatus === "Đã thanh toán"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
                {order.note && (
                  <div>
                    <p className="font-semibold">Ghi chú</p>
                    <p className="text-gray-600">{order.note}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;