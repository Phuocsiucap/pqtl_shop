import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { UpdateUser } from "../../../../redux/Actions";
import { request1 } from "../../../../utils/request";
import { getCSRFTokenFromCookie } from "../../../../Component/Token/getCSRFToken";

function Myvoucher() {
  // const UserInfor = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const [loyaltyPoint, setLoyaltyPoint] = useState(0);
  const [vouchers, setVouchers] = useState([]);
  const [vouchersUser, setVouchersUser] = useState([])
  const [isLoading, setIsLoading] = useState(true);
  const access_token = getCSRFTokenFromCookie("access_token");
// load voucher
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await request1.get("vouchers/", {
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
  useEffect(()=>{
    const fetch=async()=>{
      try{
        const response= await request1.get("user/profile/",{
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        })
        console.log(response);
        
        setLoyaltyPoint(response.data.user.loyaltyPoints)
      }
      catch(e){
        console.log("Lỗi",e)
      }
    }
    fetch();
  },[])

 // load user's voucher to set display "doi" button
 useEffect(()=>{
  const fetch= async()=> {
    try {
      const response = await request1.get("vouchers/redeemed_vouchers/",{
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })
      setVouchersUser(response.data);

    }
    catch(e) {
      console.log("Error",e);
    }
  
  }
  fetch();
},[loyaltyPoint])


  const handleOnclickDoi = async (item) => {
    if (loyaltyPoint < item.points_required) {
      alert("Bạn chưa đủ điểm để đổi voucher này");
      return;
    }
    try {
      
      const response = await request1.post(
        `vouchers/redeem/${item.id}/`, // voucher_id nằm trong URL
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
        const updatedPoints = loyaltyPoint - item.points_required;
        setLoyaltyPoint(updatedPoints);
        dispatch(UpdateUser({ loyaltyPoints: updatedPoints }));
      } else if (response.data && response.data.detail) {
        // Hiển thị chi tiết lỗi từ backend
        alert(response.data.detail);
      } else {
        alert("Đã xảy ra lỗi không xác định.");
      }
    } catch (error) {
      console.error("Lỗi khi đổi voucher: ", error);
      
      // Kiểm tra nếu error.response tồn tại và có thông tin lỗi
      if (error.response && error.response.data && error.response.data.detail) {
        alert(error.response.data.detail); // Hiển thị chi tiết lỗi từ backend
      } else {
        alert("Đã xảy ra lỗi khi đổi voucher.");
      }
    }
  };

  const isVoucherRedeemed = (voucherId) => {
    return vouchersUser.some((v) => v.voucher.id === voucherId);
  };
  

  if (isLoading) {
    return <p>Đang tải voucher...</p>;
  }


  return (
    <div className="font-Montserrat px-4 py-6 lg:px-10 lg:py-10 bg-gray-50 min-h-screen">
  <div className="bg-primary/10 text-primary text-center py-4 rounded-lg shadow-md">
    <h1 className="text-xl lg:text-3xl font-bold mb-2">Điểm của bạn:</h1>
    <p className="text-2xl lg:text-4xl font-extrabold">{loyaltyPoint}</p>
    <p className="text-sm lg:text-base font-medium text-gray-600">
      Tích nhiều điểm để nhận voucher
    </p>
  </div>

  {/* Vouchers */}
  <div className="space-y-6 mt-6">
    {vouchers.length > 0 ? (
      vouchers.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between bg-white rounded-lg shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-shadow"
        >
          {/* Nội dung voucher */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center bg-primary/10 rounded-full">
              <FiShoppingCart className="text-4xl lg:text-5xl text-primary" />
            </div>
            <div>
              <h3 className="text-sm lg:text-lg font-semibold text-gray-700">
                {item.title}
              </h3>
              <p className="text-xs lg:text-sm font-medium text-red-500">
                Yêu cầu {item.points_required} điểm
              </p>
            </div>
          </div>

          {/* Nút đổi điểm */}
          <button
                className={`${
                  isVoucherRedeemed(item.id)
                    ? "bg-gray-400 "
                    : "bg-primary text-white"
                } text-xs lg:text-sm font-semibold px-4 py-2 lg:px-6 lg:py-3 rounded-lg shadow hover:bg-primary/90 transition-all`}
                onClick={() => handleOnclickDoi(item)}
                // disabled={isVoucherRedeemed(item.id)} // Disable nếu voucher đã đổi
              >
                {isVoucherRedeemed(item.id) ? "Đã đổi" : "Đổi điểm"}
              </button>
        </div>
      ))
    ) : (
      <p className="text-center text-gray-500 text-sm lg:text-base">
        Không có voucher nào để đổi.
      </p>
    )}
  </div>
</div>

  );
}

export default Myvoucher;