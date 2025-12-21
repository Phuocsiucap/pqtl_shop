import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { request1 } from "./../utils/request";
import { getCSRFTokenFromCookie } from "./../Component/Token/getCSRFToken";
import { PricetoString } from "./../Component/Translate_Price";

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

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  }

  if (!order) {
    return <div className="flex justify-center items-center h-screen">Không tìm thấy đơn hàng.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Chi Tiết Đơn Hàng</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Thông Tin Đơn Hàng</h2>
        <p><strong>ID Đơn Hàng:</strong> {order.id}</p>
        <p><strong>Ngày Đặt:</strong> {new Date(order.orderDate).toLocaleDateString('vi-VN')}</p>
        <p><strong>Trạng Thái:</strong> {order.orderStatus}</p>
        <p><strong>Phương Thức Thanh Toán:</strong> {order.paymentMethod}</p>
        <p><strong>Trạng Thái Thanh Toán:</strong> {order.paymentStatus}</p>
        <p><strong>Địa Chỉ Giao Hàng:</strong> {order.shippingAddress}</p>
        <p><strong>Phương Thức Vận Chuyển:</strong> {order.shippingMethod}</p>
        <p><strong>Ghi Chú:</strong> {order.note || "Không có"}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Sản Phẩm</h2>
        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center border-b pb-4">
              <img
                src={item.image || "https://via.placeholder.com/100"}
                alt={item.productName}
                className="w-20 h-20 object-cover mr-4"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{item.productName}</h3>
                <p>Số Lượng: {item.quantity}</p>
                <p>Giá: {PricetoString(item.price)} VND</p>
                {item.discount > 0 && <p>Giảm Giá: {PricetoString(item.discount)} VND</p>}
                <p>Tổng: {PricetoString((item.price - (item.discount || 0)) * item.quantity)} VND</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Tóm Tắt</h2>
        <p><strong>Tổng Tiền Sản Phẩm:</strong> {PricetoString(order.totalPrice)} VND</p>
        {voucher && (
          <p><strong>Voucher Áp Dụng:</strong> {voucher.voucher.title} ({voucher.voucher.code})</p>
        )}
        <p><strong>Giảm Giá:</strong> {PricetoString(order.discount || 0)} VND</p>
        <p><strong>Phí Vận Chuyển:</strong> {PricetoString(order.shippingFee || 0)} VND</p>
        <p className="text-lg font-bold"><strong>Tổng Cộng:</strong> {PricetoString(order.finalAmount)} VND</p>
      </div>

      <div className="text-center">
        <button
          onClick={() => navigate("/profile")}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Quay Lại Hồ Sơ
        </button>
      </div>
    </div>
  );
}

export default OrderDetail;