import React, { useState, useEffect } from 'react';
import { useDispatch } from "react-redux";
import { UpdateUser } from "../../redux/Actions";
import { request1 } from "../../utils/request";
import { getCSRFTokenFromCookie } from "../../Component/Token/getCSRFToken";
import { FiShoppingCart } from "react-icons/fi";
import "./index.css";
// import LaptopImage from "../../assets/images/Product_1.png";
// import MouseImage from "../../assets/images/Product_1.png";
// import KeyboardImage from "../../assets/images/Product_1.png";

function SaleProducts() {
  // Placeholder for agricultural products
  const products = [];

  const dispatch = useDispatch();
  const [timeLeft, setTimeLeft] = useState([]);
  const [loyaltyPoint, setLoyaltyPoint] = useState(0);
  const [vouchers, setVouchers] = useState([]);
  const [vouchersUser, setVouchersUser] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const access_token = getCSRFTokenFromCookie("access_token");

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft(prevTime =>
        prevTime.map(time => (time > 0 ? time - 1 : 0))
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // load voucher
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await request1.get("v1/vouchers/", {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        console.log(response.data);
        setVouchers(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách voucher:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVouchers();
  }, [access_token]);

  // load user for get point
  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await request1.get("user/profile/", {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        console.log(response);
        setLoyaltyPoint(response.data.user.loyaltyPoints);
      } catch (e) {
        console.log("Lỗi", e);
      }
    };
    fetch();
  }, []);

  // load user's voucher to set display "doi" button
  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await request1.get("v1/vouchers/redeemed_vouchers/", {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        setVouchersUser(response.data);
      } catch (e) {
        console.log("Error", e);
      }
    };
    fetch();
  }, [loyaltyPoint]);

  const handleOnclickDoi = async (item) => {
    if (loyaltyPoint < item.pointsRequired) {
      alert("Bạn chưa đủ điểm để đổi voucher này");
      return;
    }
    try {
      const response = await request1.post(
        `v1/vouchers/redeem/${item.id}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      // Kiểm tra trạng thái và phản hồi từ server
      if (response.status === 201) {
        alert("Đổi voucher thành công");
        const updatedPoints = loyaltyPoint - item.pointsRequired;
        setLoyaltyPoint(updatedPoints);
        dispatch(UpdateUser({ loyaltyPoints: updatedPoints }));
      } else if (response.data && response.data.detail) {
        alert(response.data.detail);
      } else {
        alert("Đã xảy ra lỗi không xác định.");
      }
    } catch (error) {
      console.error("Lỗi khi đổi voucher: ", error);
      if (error.response && error.response.data && error.response.data.detail) {
        alert(error.response.data.detail);
      } else {
        alert("Đã xảy ra lỗi khi đổi voucher.");
      }
    }
  };

  const isVoucherRedeemed = (voucherId) => {
    return vouchersUser.some((v) => v.voucher.id === voucherId);
  };

  const formatTime = (seconds) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = seconds % 60;
    return { days, hours, minutes, secs };
  };

  const renderProduct = (product, time, key) => {
    const { days, hours, minutes, secs } = formatTime(time);
    const savingsAmount = product.oldPrice - product.newPrice;
    return (
      <div key={key} className="product-card">
        <div className="discount-tag">Giảm {product.discount}</div>
        <img className="product-image" src={product.ImageUrl} alt={product.name} />
        <h2 style={{ fontWeight: "bold" }}>{product.name}</h2>
        <div className="specs-row">
          {/* {product.ram && <div className="spec">RAM: {product.ram}</div>} */}
          {/* {product.storage && <div className="spec">SSD: {product.storage}</div>} */}
        </div>
        <div className="colors">
          <p>Các màu: {product.colors.join(", ")}</p>
        </div>
        <div className="price-range">
          <span className="old-price">{product.oldPrice.toLocaleString('vi-VN')}đ</span> -{" "}
          <span className="current-price">{product.newPrice.toLocaleString('vi-VN')}đ</span>
        </div>
        <p className="saving">Tiết kiệm: {savingsAmount.toLocaleString('vi-VN')}đ</p>
        <div className="countdown">
          <span>{days} ngày</span> : <span>{hours} giờ</span> : <span>{minutes} phút</span> : <span>{secs} giây</span>
        </div>
      </div>
    );
  };

  return (
    <div className='test'>
      <h1 style={{ fontSize: '1.7em', margin: '20px 0px 30px 0px', fontWeight: 'bold' }}>KHUYẾN MÃI MỖI TUẦN</h1>
      
      {/* Voucher Section */}
      <div className="mt-10">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vouchers.length > 0 ? (
            vouchers.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 rounded-full shadow-md">
                    <FiShoppingCart className="text-2xl lg:text-3xl text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-red-600 font-semibold mb-1">
                      Yêu cầu {item.pointsRequired} điểm
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {item.discountType === 'PERCENTAGE' ? 'Giảm %' : 'Giảm cố định'}
                      </span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Giá trị: {item.discountValue}{item.discountType === 'PERCENTAGE' ? '%' : ' VND'}
                      </span>
                    </div>
                    {item.minOrderValue && (
                      <p className="text-xs text-gray-500 mb-3">
                        Đơn tối thiểu: {item.minOrderValue.toLocaleString('vi-VN')} VND
                      </p>
                    )}
                    <button
                      className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                        isVoucherRedeemed(item.id)
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg"
                      }`}
                      onClick={() => handleOnclickDoi(item)}
                      disabled={isVoucherRedeemed(item.id)}
                    >
                      {isVoucherRedeemed(item.id) ? "Đã đổi" : "Đổi ngay"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 bg-gray-100 rounded-lg">
              <p className="text-gray-500">Không có voucher nào để đổi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default SaleProducts;
