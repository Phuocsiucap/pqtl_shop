import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { request1 } from "../../utils/request";
import CartItem from "./cartItems";
import VoucherModal from "./VoucherModels";
import CartFooter from "./CartFooter";
import { getCSRFTokenFromCookie } from "../../Component/Token/getCSRFToken";


// import CartFooter from "./cartFooter";
function CartShopping() {
  const location = useLocation();
  const [cartgoods, setCartgoods] = useState([]);
  const [showVoucher, setShowVoucher] = useState(false);
  const [voucher,setVoucher]=useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const [selectedItems, setSelectedItems] = useState([]);
 

  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();
//   const access_token = document.cookie.split("=")[1]; // Lấy token
  const user = useSelector((state) => state.user.user);
  const access_token = getCSRFTokenFromCookie("access_token");



  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await request1.get("cart/", {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        });
        setCartgoods(response.data.cart_goods);
        console.log(response.data)
      } catch (error) {
        console.error("Lỗi khi lấy giỏ hàng:", error);
      }
    };-
    fetchData();
  }, []);

  useEffect(() => {
    let total = cartgoods
      .filter((item) => selectedItems.includes(item.id)) // Lọc các mục được chọn
      .reduce((sum, item) => sum + item.good.price * item.quantity, 0); // Tính tổng giá

    if (selectedVoucher) {
      total -= (total * selectedVoucher.voucher.discount_percentage) / 100; // Áp dụng giảm giá
    }
  
    setTotalPrice(total);
    console.log(selectedItems);
  }, [cartgoods, selectedItems, selectedVoucher]); // Chạy lại khi giỏ hàng hoặc lựa chọn thay đổi
  
  console.log("2",totalPrice)
  const handleOnclickOrder = () => {
    if(selectedItems.length>0) {
      if(window.confirm("Bạn chắc chắn đặt đơn hàng này")){
        const itemsToOrder = cartgoods.filter((item) => selectedItems.includes(item.id));
        // console.log("this is input dât:" ,itemsToOrder);
        // console.log(typeof itemsToOrder);
        // console.log("Kiểu dữ liệu của cartgoods:", Array.isArray(cartgoods)); // Kiểm tra nếu cartgoods là mảng
        // console.log("cartgoods:", cartgoods); // Kiểm tra nội dung cartgoods

        localStorage.setItem(
          "orderData",
          JSON.stringify({
            itemsToOrder,
            totalPrice,
            selectedVoucher,
          })
        );
        
        
        navigate("/order");
        
      }
    }
    else {
      alert("Vui lòng chọn mặt hàng muốn mua!!")
    }
    
  };
  const toggleSelectAll = () => {
    if (selectedItems.length === cartgoods.length) {
      // Nếu tất cả đã được chọn, bỏ chọn tất cả
      setSelectedItems([]);
    } else {
      // Nếu chưa chọn tất cả, chọn tất cả
      const allItemIds = cartgoods.map((item) => item.id);
      setSelectedItems(allItemIds);
    }
  };
  
  const handleOnclinkShowVoucher = async () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm trước khi sử dụng voucher!");
      return; // Dừng việc hiển thị voucher nếu không có sản phẩm được chọn
    }
    try {
      const response = await request1.get("vouchers/redeemed_vouchers/", {
        params: {
          status: "Redeemed",  // Truyền status như là query parameter
        },
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
  
      // Chỉ lấy danh sách các voucher từ dữ liệu trả về
      console.log("this is voucher: ", response);
      setVoucher(response.data); // Cập nhật trạng thái voucher
    } catch (e) {
      console.log("Lỗi ", e);
    }
    setShowVoucher(true); // Hiển thị danh sách voucher
  };
  


  const handleSelectVoucher = (voucher) => {
    setSelectedVoucher(voucher);
  };




  
  return user == null ? (
    <div className="text-center text-xl font-Montserrat font-semibold my-10">
      <p>
        Bạn chưa đăng nhập{" "}
        <span className="text-primary">
          <Link to="/login">Đăng nhập ngay</Link>
        </span>
      </p>
    </div>
  ) : (
    <div className="test bg-gray-50 font-Montserrat">
      {cartgoods.length > 0 ? (
        <>
          {cartgoods.map((item) => (
            <CartItem
            key={item.id}
            item={item}
            setCartgoods={setCartgoods}
            access_token={access_token}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            />
          ))}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={toggleSelectAll}
              className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition"
            >
              {selectedItems.length === cartgoods.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </button>
          </div>
          <CartFooter
            cartgoods={cartgoods}
            handleOnclickOrder={handleOnclickOrder}
            showVoucher={handleOnclinkShowVoucher}
            totalPrice={totalPrice}
            selectedVoucher={selectedVoucher}
          />
          {showVoucher && (
            <VoucherModal showVoucher={handleOnclinkShowVoucher} setShowVoucher={setShowVoucher} voucher={voucher} onSelectVoucher={handleSelectVoucher} totalPrice ={totalPrice}/>
          )}

        </>
      )
    :
    (
      <div className="flex justify-center items-center h-[500px] font-Montserrat font-semibold text-sm lg:text-xl">
        Bạn chưa có sản phẩm nào trong giỏ hàng
      </div>
    )}
    </div>
  );
}

export default CartShopping;
