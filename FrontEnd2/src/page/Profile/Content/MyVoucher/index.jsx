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
  const [isLoading, setIsLoading] = useState(true);
  const access_token = getCSRFTokenFromCookie("access_token");
// load unused vouchers
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await request1.get("v1/vouchers/unused/", {
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
                {item.voucher.title}
              </h3>
              <p className="text-xs lg:text-sm font-medium text-red-500">
                Mã: {item.voucher.code}
              </p>
              <p className="text-xs lg:text-sm text-gray-600">
                {item.voucher.description}
              </p>
              <p className="text-xs lg:text-sm text-gray-600">
                Loại: {item.voucher.discountType === 'PERCENTAGE' ? 'Giảm %' : 'Giảm cố định'} - Giá trị: {item.voucher.discountValue}{item.voucher.discountType === 'PERCENTAGE' ? '%' : ' VND'}
              </p>
              {item.voucher.minOrderValue && (
                <p className="text-xs lg:text-sm text-gray-600">
                  Đơn tối thiểu: {item.voucher.minOrderValue} VND
                </p>
              )}
              <p className="text-xs lg:text-sm text-gray-600">
                Hết hạn: {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString('vi-VN') : 'Không giới hạn'}
              </p>
            </div>
          </div>

          {/* Không có nút đổi */}
        </div>
      ))
    ) : (
      <p className="text-center text-gray-500 text-sm lg:text-base">
        Bạn chưa có voucher nào chưa sử dụng.
      </p>
    )}
  </div>
</div>

  );
}

export default Myvoucher;