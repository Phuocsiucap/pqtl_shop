import { useEffect, useState } from "react";
import { HiPlusSm } from "react-icons/hi";
import { RiSubtractFill } from "react-icons/ri";
import { PricetoString } from "../../../Component/Translate_Price";
import { request1, request } from "../../../utils/request";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken";
function ImageProduct({ id }) {
  const [Product, setProduct] = useState({});
  const statusUser = useSelector((state) => state.user.status);
  const navigate = useNavigate();
  const access_token = getCSRFTokenFromCookie("access_token"); // Sử dụng hàm getCSRFTokenFromCookie
  // console.log(access_token);
  const sales = [
    "Giảm đến 10% phụ kiện & đồ công nghệ khác khi mua kèm máy.",
    "Giảm đến 3 triệu với Thu cũ đổi mới lên đời laptop",
    "Nhận đến 2 triệu voucher mua hàng xã kho",
    "Giảm 500K, tích điểm, quà sinh nhật,… với Ưu đãi thành viên",
    "Giảm 50% gói bảo hành mở rộng (đến hết 31/7/2024)",
    "Trả góp: 0% trả trước, 0% lãi suất",
    "Liên hệ B2B để được tư vấn giá tốt nhất cho khách hàng doanh nghiệp",
  ];

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await request1.get(`goods/list/${id}/`);
        // console.log(response)
        setProduct(response.data);
        console.log("1",response)
      } catch (e) {
        console.log("lỗi", e);
      }
    };
    fetch();
  }, []);
  const [number, setNumber] = useState(1);
  const handleClickplus = () => {
    if (number >= 5) {
      alert("Bạn đã đạt tối đa sản phẩm mua");
      setNumber(5);
      return;
    } else {
      setNumber(number + 1);
    }
  };
  const handleClicksubtraction = () => {
    if (number <= 0) {
      setNumber(0);
    } else {
      setNumber(number - 1);
    }
  };
  const handleOnclickAddspc = async () => {
    if (!statusUser) {
      alert("Bạn chưa đăng nhập vui lòng đăng nhập để thực hiện");
      return navigate("/login");
    }
    if(Product.amount<=0){
      alert("Số lượng sản phẩm này đã hết vui lòng chọn sản phẩm khác")
      return;
    }
    if (number === 0) {
      alert("Vui lòng chọn số lượng sản phẩm");
      return;
    }

    if (!window.confirm("Bạn xác nhận thêm sản phẩm này vào giỏ")) return;
    else {
      try {
        const response = await request1.post(
          "cart/add/",
          {
            good_id: id,
            quantity: number,
          },
          {
            headers: {
              Authorization: `Bearer ${access_token}`, // Đảm bảo token đúng
              "Content-Type": "application/json",
            },
            withCredentials: true, // Cho phép gửi cookie
          }
        );

        console.log(response);
        alert("Thêm sản phẩm vào giỏ hàng thành công");
        navigate("/cartshopping");
      } catch (e) {
        console.log("lỗi", e);
      }
    }
  };

  console.log("product ",Product);
  return (
    <div className="test my-5 font-Montserrat">
      <div className="my-5">
        <p className="text-base lg:text-xl w-[100%] font-bold top-menu-item lg:w-[40%] cursor-pointer">
          {Product.goodName}
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 px-2 py-3 border-t-2 border-solid border-gray-100 rounded-md">
        <div className="group relative overflow-hidden cursor-pointer border-2 border-solid border-gray-50 rounded-md">
          <img
            src={`${request}${Product.image}`}

            alt=""
            className="w-[100%] group-hover:scale-110 transition-all duration-500 ease-in-out"
          />
          <p className="absolute text-xs lg:text-sm font-bold text-white top-5 py-1.5 px-3 bg-primary rounded-xl left-3">
            Giảm giá sốc
          </p>
        </div>
        <div className="border-2 border-solid border-gray-50 rounded-md h-auto px-2 flex flex-col gap-y-3">
          <div className="flex gap-7 px-6 font-bold items-center">
            <p className="text-red-500 text-base lg:text-xl">
              {Product.price && PricetoString(Product.price.split(".")[0])}đ
            </p>
          </div>
          <div className="">
            <p className="font-bold text-base">Màu sắc: {Product.color}</p>
            <div className="font-bold text-sm lg:text-base flex-col justify-around">
              <div className="my-5">
                <p className="flex gap-x-10 items-center">
                  Số lượng:
                  <RiSubtractFill
                    className=" text-xl cursor-pointer mx-2"
                    onClick={handleClicksubtraction}
                  />
                  {number}
                  <HiPlusSm
                    className="text-xl cursor-pointer mx-2"
                    onClick={handleClickplus}
                  />
                </p>
              </div>
            <p className="text-gray-400 font-semibold my-5">Sản phẩm sẵn có :&ensp;{Product.amount}</p>
            </div>
          </div>

          <div className="my-5">
            <p className="font-semibold mb-3">
              <span className="uppercase font-bold">Nguồn hàng: </span>Nhập
              khẩu, Bảo hành 12 tháng, chưa gồm VAT
            </p>
            <p className="font-bold text-base text-primary">
              {Product.price && PricetoString(Product.price * number)}đ
            </p>
          </div>

          <div className="grid grid-cols-2 gap-5 font-bold text-xs lg:text-base">
            <button
              className="py-4 px-3 lg:px-6 lg:py-6 bg-red-500 text-white rounded-md hover:bg-primary transition-all duration-500"
              onClick={() => handleOnclickAddspc()}
            >
              Thêm vào giỏ hàng
            </button>
            <button className="py-4 px-3 lg:px-6 lg:py-6 bg-yellow-400 text-blue-900 rounded-md hover:bg-primary transition-all duration-500"
            onClick={()=>handleOnclickAddspc()}>
              Mua ngay
            </button>
          </div>
          <div className="my-4 bg-green-50 rounded-md px-3 py-3 overflow-hidden">
            <p className="font-bold">Ưu đãi thêm</p>
            {sales.map((sale, index) => {
              return (
                <li
                  key={index}
                  className="text-xs py-1 hover:font-bold hover:text-primary cursor-pointer transition-all duration-500 ease-in-out"
                >
                  {sale}
                </li>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
export default ImageProduct;

// function getCSRFTokenFromCookie(name) {
//   const value = `; ${document.cookie}`;
//   const parts = value.split(`; ${name}=`);
//   if (parts.length === 2) return parts.pop().split(";").shift();
//   return null; // Nếu không tìm thấy
// }

// const csrfToken = getCSRFTokenFromCookie();
