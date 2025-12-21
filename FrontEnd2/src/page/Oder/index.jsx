import { useLocation, useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaCreditCard, FaMoneyBillWave, FaMobileAlt, FaQrcode, FaSpinner, FaTruck } from "react-icons/fa";
import { useEffect, useState } from "react";
import { PricetoString } from "../../Component/Translate_Price";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { request1, request, getFullImageUrl } from "../../utils/request";
import { getCSRFTokenFromCookie } from "../../Component/Token/getCSRFToken";
import AddressOD from "./AddresOD";
import PaymentFrom from "./PaymentFrom";
import PaymentReturn from "./PaymentReturn";

function Order({ }) {
  const user = useSelector((state) => state.user.user);
  const location = useLocation();
  const navigate = useNavigate();

  const orderData = JSON.parse(localStorage.getItem("orderData"));
  
  // Check if orderData exists and redirect if not
  useEffect(() => {
    if (!orderData) {
      alert("Không có dữ liệu đơn hàng. Vui lòng quay lại giỏ hàng.");
      navigate("/cartshopping");
    }
  }, [navigate, orderData]);

  const { itemsToOrder, totalPrice, selectedVoucher } = orderData || {};

  const [showPaymentReturn, setShowPaymentReturn] = useState(false)
  const [shippingMethod, setShippingMethod] = useState("Nhanh");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [error, setError] = useState(null);
  // Tính tổng cuối cùng
  const discount = selectedVoucher?.voucher?.discountValue || 0;
  const shippingFee = 25000; // hoặc 0 nếu miễn phí
  const finalAmount = totalPrice - discount + shippingFee;


  const [productOrder, setProductOrder] = useState(itemsToOrder);


  const [selectAddress, setSelectAddress] = useState(() => {
    // Lấy giá trị từ localStorage, mặc định là null nếu không có
    const storedAddress = localStorage.getItem("selectAddress");
    return storedAddress ? JSON.parse(storedAddress) : null;
  });
  // Lưu giá trị vào localStorage khi selectAddress thay đổi
  useEffect(() => {
    localStorage.setItem("selectAddress", JSON.stringify(selectAddress));
  }, [selectAddress]);

  const [address, setAddress] = useState([]);
  // console.log("1", typeof itemsToOrder);
  // console.log("2", location.state);
  const [showAddress, setShowAddress] = useState(false);
  const access_token = getCSRFTokenFromCookie("access_token");
  // const access_token =  token ;
  const title = ["Đơn giá", "Số lượng", "Thành tiền"];
  useEffect(() => {
    setProductOrder(itemsToOrder); // Gán giá trị mới cho goodOrder khi itemsToOrder thay đổi
  }, [itemsToOrder]);

  const handleOnclickShowAddress = () => {
    setShowAddress(true);
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const respone = await request1.get("user/addresses", {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        console.log(respone.data);
        setAddress(respone.data);
      } catch (e) {
        console.log("Lỗi", e);
      }
    };
    fetch();
  }, []);


  // Hàm fetch dữ liệu thanh toán
  const fetchPaymentData = async () => {
    const queryString = location.search;
    const isPaymentDataFetched = localStorage.getItem("isPaymentDataFetched");

    if (!isPaymentDataFetched) {
      try {
        const response = await request1.get(`vn/payment_return/${queryString}`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        if (response.data?.status === "success") {
          localStorage.setItem("message", JSON.stringify(response.data.message));
          localStorage.setItem("payment", JSON.stringify(response.data.data));
          HandleOnclickOrder();
          // Đánh dấu là đã fetch dữ liệu
          localStorage.setItem("isPaymentDataFetched", true);
        } else {
          setError(response.data?.message || "Lỗi không xác định");
        }
      } catch (err) {
        console.error("Lỗi khi gọi API:", err.response || err);
        setError("Không thể kết nối tới server");
      }
    }
  };


  const HandleOnclickOrder = async () => {
    const Address = JSON.parse(localStorage.getItem("selectAddress"));
    const orderData = JSON.parse(localStorage.getItem("orderData"));

    if (!Address || !orderData) {
      alert("Vui lòng chọn địa chỉ và sản phẩm.");
      return;
    }

    // Nếu chọn VNPAY, xử lý thanh toán VNPAY trước
    if (paymentMethod === "VNPAY") {
      await handleVNPayPayment();
      return;
    }

    // Xử lý đặt hàng bình thường (COD, Chuyển khoản, Ví điện tử)
    await createOrder();
  };

  // Xử lý thanh toán VNPAY
  const handleVNPayPayment = async () => {
    const Address = JSON.parse(localStorage.getItem("selectAddress"));

    if (!Address) {
      alert("Vui lòng chọn địa chỉ giao hàng.");
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Tạo đơn hàng trước để có ID thực
      console.log("Creating VNPay order with itemsToOrder:", itemsToOrder);
      const orderPayload = {
        items: itemsToOrder.map((item) => {
          let finalItemPrice;
          if (item.isClearance && item.clearanceDiscount > 0) {
            finalItemPrice = item.price * (1 - item.clearanceDiscount / 100);
          } else {
            finalItemPrice = item.price - (item.discount || 0);
          }
          return {
            productId: item.productId,
            productName: item.productName,
            quantity: item.qty,
            price: Math.round(finalItemPrice),
            isClearance: item.isClearance || false,
            clearanceDiscount: item.clearanceDiscount || 0,
          };
        }),
        totalPrice,
        discount: selectedVoucher?.voucher?.discountValue || 0,
        shippingFee: 25000,
        finalAmount,
        shippingAddress: `${Address.name}, ${Address.phone}, ${Address.city}, ${Address.addressct}`,
        shippingMethod,
        paymentMethod: "VNPAY",
        paymentStatus: "Chưa thanh toán",
        orderStatus: "Chờ thanh toán", // Temporary status
        note: "",
        userVoucherId: selectedVoucher ? selectedVoucher.id : null,
      };

      console.log("Order payload:", orderPayload);

      const orderResponse = await request1.post("orders", orderPayload, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (orderResponse.data && orderResponse.data.id) {
        const actualOrderId = orderResponse.data.id;

        // Lưu thông tin đơn hàng đã tạo
        localStorage.setItem("pendingVNPayOrder", JSON.stringify({
          orderId: actualOrderId, // Use actual order ID
          items: orderPayload.items,
          totalPrice,
          discount: selectedVoucher?.voucher?.discountValue || 0,
          shippingFee: 25000,
          finalAmount,
          shippingAddress: orderPayload.shippingAddress,
          shippingMethod,
        }));

        // Tạo thanh toán VNPay với order_id thực
        const paymentResponse = await request1.post(
          "/vn/payment",
          {
            order_id: actualOrderId, // Use actual order ID
            amount: Math.round(finalAmount),
            order_desc: `Đơn hàng ${actualOrderId} - ${itemsToOrder.length} sản phẩm`,
            bank_code: "",
            language: "vn",
            returnUrl: window.location.origin + "/payment-return"
          },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (paymentResponse.data.code === "00" && paymentResponse.data.payment_url) {
          // Redirect đến VNPAY
          window.location.href = paymentResponse.data.payment_url;
        } else {
          alert(paymentResponse.data.message || "Không thể tạo thanh toán VNPAY");
        }
      } else {
        alert("Không thể tạo đơn hàng");
      }
    } catch (error) {
      console.error("VNPAY Error:", error);
      alert("Có lỗi xảy ra khi kết nối VNPAY");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Tạo đơn hàng
  const createOrder = async () => {
    const Address = JSON.parse(localStorage.getItem("selectAddress"));
    const orderData = JSON.parse(localStorage.getItem("orderData"));

    const shippingAddress = `${Address.name}, ${Address.phone}, ${Address.city}, ${Address.addressct}`;

    const payload = {
      items: orderData.itemsToOrder.map((item) => {
        // Tính giá cuối cùng: ưu tiên thanh lý > giảm giá > giá gốc
        let finalItemPrice;
        if (item.isClearance && item.clearanceDiscount > 0) {
          finalItemPrice = item.price * (1 - item.clearanceDiscount / 100);
        } else {
          finalItemPrice = item.price - (item.discount || 0);
        }

        return {
          productId: item.productId,
          productName: item.productName,
          quantity: item.qty,
          price: Math.round(finalItemPrice), // Send the actual price paid (after discount/clearance)
          isClearance: item.isClearance || false,
          clearanceDiscount: item.clearanceDiscount || 0,
        };
      }),
      totalPrice: orderData.totalPrice,
      discount: 0, // Voucher discount will be calculated by backend
      shippingFee: 25000, // tuỳ logic
      finalAmount: orderData.totalPrice + 25000, // Without voucher discount, backend will adjust
      shippingAddress,
      shippingMethod,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "Chưa thanh toán" : "Đã thanh toán",
      orderStatus: "Chờ xác nhận", // Set initial status to Pending to allow cancellation
      note: "",
      userVoucherId: orderData.selectedVoucher ? orderData.selectedVoucher.id : null,
    };

    try {
      const response = await request1.post("orders", payload, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("Tạo đơn hàng thành công:", response.data);
      localStorage.removeItem("orderData");
      localStorage.removeItem("selectAddress");
      alert("Đặt hàng thành công!");
      if (paymentMethod === "COD") {
        navigate(`/order-detail/${response.data.id}`);
      } else {
        navigate("/cartshopping");
      }
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error.response || error);
      alert("Không thể tạo đơn hàng, vui lòng thử lại.");
    }
  };

  // Kiểm tra kết quả thanh toán VNPAY khi quay lại từ VNPAY
  useEffect(() => {
    const checkVNPayResult = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const vnp_ResponseCode = urlParams.get('vnp_ResponseCode');
      const vnp_TransactionNo = urlParams.get('vnp_TransactionNo');

      if (vnp_ResponseCode && vnp_TransactionNo) {
        const pendingOrder = JSON.parse(localStorage.getItem("pendingVNPayOrder") || "null");

        if (vnp_ResponseCode === "00" && pendingOrder) {
          // Thanh toán thành công, cập nhật đơn hàng
          try {
            // Update order status and payment status
            const updateResponse = await request1.put(`orders/${pendingOrder.orderId}`, {
              paymentStatus: "Đã thanh toán",
              orderStatus: "Đã xác nhận",
              note: `Thanh toán VNPAY - Mã GD: ${vnp_TransactionNo}`,
            }, {
              headers: {
                Authorization: `Bearer ${access_token}`,
                "Content-Type": "application/json",
              },
            });

            console.log("Cập nhật đơn hàng VNPAY thành công:", updateResponse.data);
            localStorage.removeItem("pendingVNPayOrder");
            localStorage.removeItem("orderData");
            localStorage.removeItem("selectAddress");

            // Lưu thông tin để hiển thị modal thành công
            localStorage.setItem("payment", JSON.stringify({
              order_id: pendingOrder.orderId,
              amount: pendingOrder.finalAmount,
              transaction_no: vnp_TransactionNo,
              response_code: "00"
            }));
            localStorage.setItem("message", "Thanh toán thành công!");

            // Hiển thị modal bill
            setShowPaymentReturn(true);

          } catch (error) {
            console.error("Error updating order after VNPAY:", error);
            alert("Thanh toán thành công nhưng có lỗi khi cập nhật đơn hàng. Vui lòng liên hệ hỗ trợ.");
          }
        } else if (vnp_ResponseCode !== "00") {
          // Thanh toán thất bại
          localStorage.removeItem("pendingVNPayOrder");
          alert("Thanh toán VNPAY không thành công. Vui lòng thử lại.");
        }

        // Clear URL params
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    checkVNPayResult();
  }, []);



  const handleSelectAddress = (item) => {
    setSelectAddress(item);
  };

  return user == null ? (
    <div>
      <div className="text-center text-xl font-Montserrat font-semibold my-10">
        <p>
          Bạn chưa đăng nhập{" "}
          <span className="text-primary">
            <Link to={"/login"}>Đăng nhập ngay</Link>
          </span>
        </p>
      </div>
    </div>
  ) : (
    productOrder && (
      <div className="font-Montserrat bg-gray-100">
        {/*  tiêu đề */}
        <div className="border-y-[1px] border-gray-100 bg-white">
          <p className=" test my-5 md:text-xl font-bold text-primary px-2 py-5">
            Thanh toán
          </p>
        </div>
        {/*  địa chỉ nhận hàng */}
        <div className="test py-5 my-5 border-[1px] border-gray-100 bg-white">
          <div className="mx-5 my-3 flex justify-between items-center">
            <div className="flex gap-x-5 items-center ">
              <FaMapMarkerAlt className="text-2xl text-primary" />
              <p className="text-xl font-semibold text-primary">
                Địa chỉ nhận hàng
              </p>
            </div>
            <div className="font-Montserrat font-semibold text-blue-500 mx-5">
              {address.length > 0 ? (
                <p
                  className="cursor-pointer"
                  onClick={() => handleOnclickShowAddress()}
                >
                  Chọn địa chỉ nhận hàng của bạn
                </p>
              ) : (
                <Link to={"/profile"}>
                  Bạn chưa thiết lập địa chỉ nhận hàng thiết lập ngay
                </Link>
              )}
              {selectAddress && (
                <p className="text-primary text-center">
                  (1 địa chỉ đã được chọn)
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white test">
          <div className="flex items-center my-5 py-5">
            <p className="mx-5 font-semibold text-xl md:basis-[60%]">
              Sản phẩm
            </p>
            <div className="flex justify-between md:basis-[40%] mx-2 font-semibold">
              {title.map((item) => {
                return (
                  <li key={item} className="list-none">
                    {item}
                  </li>
                );
              })}
            </div>
          </div>
          {productOrder &&
            productOrder.map((item, index) => {

              return (
                <div
                  key={index}
                  className="flex items-center py-5 border-[1px] border-gray-100"
                >
                  {/* ảnh sản phẩm */}
                  <div className="flex basis-[40%] md:basis-[60%] pl-5">
                    <div className="flex items-center">
                      <img
                        src={getFullImageUrl(item.image)}
                        alt=""
                        className=" w-[50px] h-[50px] lg:w-[150px] lg:h-[150px]"
                      />
                      <p className="font-semibold text-[8px] md:text-sm lg:text-base px-1">
                        {item.productName}
                      </p>
                    </div>
                  </div>
                  <div className="basis-[60%] md:basis-[40%] flex items-center text-[8px] md:text-xs lg:text-base justify-between mx-2">
                    {/* giá cả */}
                    <div className="flex flex-col">
                      {/* Badge thanh lý */}
                      {item.isClearance && (
                        <span className="text-purple-600 text-[8px] md:text-xs font-medium">
                          🏷️ -{item.clearanceDiscount}%
                        </span>
                      )}
                      {/* Giá gốc nếu có giảm */}
                      {(item.isClearance || item.discount > 0) && (
                        <p className="text-gray-400 line-through text-[8px] md:text-xs">
                          {PricetoString(item.price.toString().split(".")[0])}
                        </p>
                      )}
                      {/* Giá cuối cùng */}
                      <p className={`font-semibold ${item.isClearance ? 'text-purple-600' : 'text-red-500'}`}>
                        {PricetoString(
                          Math.round(
                            item.isClearance && item.clearanceDiscount > 0
                              ? item.price * (1 - item.clearanceDiscount / 100)
                              : item.price - (item.discount || 0)
                          ).toString().split(".")[0]
                        )}
                      </p>
                    </div>
                    {/* số lượng sản phẩm */}
                    <div className="font-bold">
                      <p className="">{item.qty}</p>
                    </div>
                    {/* thành tiền */}
                    <div className={`font-semibold ${item.isClearance ? 'text-purple-600' : 'text-red-500'}`}>
                      <p>
                        {PricetoString(
                          Math.round(
                            (item.isClearance && item.clearanceDiscount > 0
                              ? item.price * (1 - item.clearanceDiscount / 100)
                              : item.price - (item.discount || 0)) * item.qty
                          )
                        )}
                        đ
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
        <div className=" test py-10 px-3 my-10 font-bold flex justify-between bg-white">
          <p>Tổng tiền:</p>
          <div className="flex justify-center items-center">
            <div className="text-left">
              {selectedVoucher && (
                <p className="text-primary font-semibold text-sm">
                  {selectedVoucher.voucher.title}
                  &nbsp;đã được áp dụng
                </p>
              )}
              <p className="text-red-500 pr-5 pl-48">
                {PricetoString(totalPrice) || 0}đ
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 mt-5">
          {/* Phương thức giao hàng */}
          <div className="mb-6">
            <p className="font-semibold text-lg mb-3 flex items-center gap-2">
              <FaTruck className="text-primary" />
              Phương thức giao hàng
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "Nhanh", label: "Giao nhanh", desc: "1-2 ngày" },
                { value: "Tiết kiệm", label: "Tiết kiệm", desc: "3-5 ngày" },
                { value: "Tiêu chuẩn", label: "Tiêu chuẩn", desc: "5-7 ngày" },
              ].map((method) => (
                <div
                  key={method.value}
                  className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${shippingMethod === method.value
                    ? "border-primary bg-primary/10"
                    : "border-gray-200 hover:border-primary/50"
                    }`}
                  onClick={() => setShippingMethod(method.value)}
                >
                  <p className="font-semibold text-sm">{method.label}</p>
                  <p className="text-xs text-gray-500">{method.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <div>
            <p className="font-semibold text-lg mb-3 flex items-center gap-2">
              <FaCreditCard className="text-primary" />
              Phương thức thanh toán
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* COD */}
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer text-center transition-all ${paymentMethod === "COD"
                  ? "border-primary bg-primary/10"
                  : "border-gray-200 hover:border-primary/50"
                  }`}
                onClick={() => setPaymentMethod("COD")}
              >
                <FaMoneyBillWave className="text-2xl mx-auto mb-2 text-green-600" />
                <p className="font-semibold text-sm">Tiền mặt</p>
                <p className="text-xs text-gray-500">Thanh toán khi nhận</p>
              </div>



              {/* VNPAY */}
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer text-center transition-all ${paymentMethod === "VNPAY"
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 hover:border-red-300"
                  }`}
                onClick={() => setPaymentMethod("VNPAY")}
              >
                <FaQrcode className="text-2xl mx-auto mb-2 text-red-500" />
                <p className="font-semibold text-sm text-red-500">VNPAY</p>
                <p className="text-xs text-gray-500">QR / ATM / Visa</p>
              </div>


            </div>

            {/* Thông tin thêm về VNPAY */}
            {paymentMethod === "VNPAY" && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start gap-3">
                  <FaQrcode className="text-2xl text-red-500 mt-1" />
                  <div>
                    <p className="font-semibold text-red-600">Thanh toán qua VNPAY</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Sau khi nhấn "Đặt hàng", bạn sẽ được chuyển đến cổng thanh toán VNPAY
                      để hoàn tất thanh toán bằng QR Code, thẻ ATM nội địa hoặc thẻ quốc tế.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <img
                        src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png"
                        alt="VNPAY"
                        className="h-6"
                      />
                      <span className="text-xs text-gray-500">An toàn & Bảo mật</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white p-5 mt-5 font-semibold">
          <p>Tạm tính: {PricetoString(totalPrice)}đ</p>
          {selectedVoucher && (
            <p>Giảm giá: -{PricetoString(selectedVoucher.voucher.discountValue)}đ</p>
          )}
          <p>Phí vận chuyển: {PricetoString(25000)}đ</p>
          <p className="text-red-500 mt-2 text-lg">
            Tổng thanh toán: {PricetoString(finalAmount)}đ
          </p>
        </div>

        <div className="test flex justify-end mr-5 py-10">
          <button
            className={`px-8 py-4 text-base font-bold rounded-lg flex items-center gap-2 transition-all ${isProcessingPayment
              ? "bg-gray-400 cursor-not-allowed"
              : paymentMethod === "VNPAY"
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-primary hover:bg-primary/80 text-white"
              }`}
            onClick={() => HandleOnclickOrder()}
            disabled={isProcessingPayment}
          >
            {isProcessingPayment ? (
              <>
                <FaSpinner className="animate-spin" />
                Đang xử lý...
              </>
            ) : paymentMethod === "VNPAY" ? (
              <>
                <FaQrcode />
                Thanh toán VNPAY
              </>
            ) : (
              <>
                <FaTruck />
                Đặt hàng
              </>
            )}
          </button>
        </div>
        <div>
          {showAddress && (
            <AddressOD
              onChange={handleOnclickShowAddress}
              setShowAddress={setShowAddress}
              handleSelectAddress={handleSelectAddress}
              address={address}
              selectAddress={selectAddress}
            />
          )}
        </div>
        {/* Modal kết quả thanh toán VNPAY */}
        {showPaymentReturn && (
          <PaymentReturn
            setShowPaymentReturn={setShowPaymentReturn}
          />
        )}
      </div>
    )
  );
}

export default Order;
