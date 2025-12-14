import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { request1, token } from "../../utils/request";
import CartItem from "./cartItems";
import VoucherModal from "./VoucherModels";
import CartFooter from "./cartFooter";
import { getCSRFTokenFromCookie } from "../../Component/Token/getCSRFToken";


// import CartFooter from "./cartFooter";
function CartShopping() {
  const location = useLocation();
  const [cartItems, setCartItems] = useState([]);
  const [showVoucher, setShowVoucher] = useState(false);
  const [voucher,setVoucher]=useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const [selectedItems, setSelectedItems] = useState([]);
 

  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();
//   const access_token = document.cookie.split("=")[1]; // Lấy token
  const user = useSelector((state) => state.user.user);
  const access_token = getCSRFTokenFromCookie("access_token") 
  // const access_token = token;



  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await request1.get("cart", {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        });
        setCartItems(response.data);
        console.log(response.data)
      } catch (error) {
        console.error("Lỗi khi lấy giỏ hàng:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let total = cartItems
      .filter((item) => selectedItems.includes(item.productId)) // Lọc các mục được chọn
      .reduce((sum, item) => {
        // Tính giá cuối cùng: ưu tiên thanh lý > giảm giá > giá gốc
        let finalPrice;
        if (item.isClearance && item.clearanceDiscount > 0) {
          finalPrice = item.price * (1 - item.clearanceDiscount / 100);
        } else {
          finalPrice = item.price - (item.discount || 0);
        }
        return sum + finalPrice * item.qty;
      }, 0); // Tính tổng giá

    if (selectedVoucher) {
      total -= (total * selectedVoucher.voucher.discount_percentage) / 100; // Áp dụng giảm giá
    }
  
    setTotalPrice(Math.round(total));
    console.log(selectedItems);
  }, [cartItems, selectedItems, selectedVoucher]); // Chạy lại khi giỏ hàng hoặc lựa chọn thay đổi
  
  console.log("2",totalPrice)
  const handleOnclickOrder = () => {
    if(selectedItems.length>0) {
      if(window.confirm("Bạn chắc chắn đặt đơn hàng này")){
        const itemsToOrder = cartItems.filter((item) => selectedItems.includes(item.productId));
        // console.log("this is input dât:" ,itemsToOrder);
        // console.log(typeof itemsToOrder);
        // console.log("Kiểu dữ liệu của cartItems:", Array.isArray(cartItems)); // Kiểm tra nếu cartItems là mảng
        // console.log("cartItems:", cartItems); // Kiểm tra nội dung cartItems

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
    if (selectedItems.length === cartItems.length) {
      // Nếu tất cả đã được chọn, bỏ chọn tất cả
      setSelectedItems([]);
    } else {
      // Nếu chưa chọn tất cả, chọn tất cả
      const allItemIds = cartItems.map((item) => item.productId);
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
      {cartItems.length > 0 ? (
        <>
          {cartItems.map((item) => (
            <CartItem
            key={item.productId}
            item={item}
            setCartItems={setCartItems}
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
              {selectedItems.length === cartItems.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </button>
          </div>
          <CartFooter
            cartItems={cartItems}
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
