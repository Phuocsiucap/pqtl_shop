import { FaWifi } from "react-icons/fa";
import { FaFacebookF } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import { FaArrowsAltV } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";
import { MdLocationPin } from "react-icons/md";
import { FaShoppingBag } from "react-icons/fa";
import { MdOutlineSecurity } from "react-icons/md";
function Footer() {
    const lienhes=["Khách cá nhân phím 1","Khách công ty, đại lý phím 2","Bảo hành phím 3","Góp ý & khiếu nại phím 4"]
    const theodois=[
        {title:"Follow zalo cập nhật khuyến mãi",icon: <FaWifi/>},
        {title:"Facebook",icon: <FaFacebookF/>},
        {title:"Tik tok",icon: <FaTiktok/>},
        {title:"PHD Tech lap",icon: <FaYoutube/>},
        {title:"Có gì mới",icon: <FaStar/>},
        
    ]
    const chinhsachs=[
        {title:"Trung tâm chăm sóc khách hàng",icon: <FaPlus/>},
        {title:"Bảo hành đổi trả",icon: <FaArrowsAltV/>},
        {title:"Hạng thành viên",icon: <FaUser/>},
        {title:"Thanh toán",icon: <FaCartShopping/>},
        {title:"Giao nhận",icon: <MdLocationPin/>},
        {title:"Mua hàng",icon: <FaShoppingBag/>},
        {title:"Bảo mật",icon: <MdOutlineSecurity/>},
        
    ]
    const abouts=["Giới thiệu","Shop review","Hợp tác NTS","Tuyển dụng","Góp ý-Khuyếu Nại"]
    return (
        <div>
            <div className="test grid grid-cols-2 lg:grid-cols-4 gap-x-5  justify-between font-Montserrat text-left">
            {/*Liên hệ */}
            <div className="bg-green-50 rounded-xl px-3 py-2 text-xs lg:text-base">
                <h1 className="text-lg font-bold py-2 top-menu-item cursor-pointer">Liên hệ</h1>
                <h2 className="whitespace-nowrap font-semibold cursor-pointer hover:text-primary">Hot line: 0123456789 </h2>
                <div className="font-sm">
                    {lienhes.map((lienhe,index)=>{
                        return(
                            <div key={index}>
                                <li className="text-xs lg:text-base">
                                    {lienhe}
                                </li>
                            </div>
                        )    
                    })}
                </div>
                <div>
                    {/*email */}
                <p className="font-semibold pt-5">Email: <span className="text-primary">phdtech@gmail.com</span></p>
                {/*address */}
                <p>Showroom trải nghiệm: 
                <span className="text-primary font-semibold">95C Nguyễn Thị Minh Khai,</span>
                </p>
                P. Bến Thành, Q1, TP HCM 
                <p className="text-primary font-semibold">(giờ làm việc: 8h30 - 19h30)</p>
                </div>
            </div>
            {/*Theo dõi */}
            <div className="bg-green-50 rounded-xl px-3 py-2">
                <h1 className="text-lg font-bold py-2 top-menu-item cursor-pointer">Theo dõi</h1>
                <div className="font-sm">
                    {theodois.map((theodoi,index)=>{
                        return(
                            <div key={index}>
                                <li className="text-xs lg:text-sm font-bold py-3 cursor-pointer list-none flex items-center justify-start gap-x-3 hover:text-primary">
                                    <div className="text-xl">
                                        {theodoi.icon}
                                    </div>
                                    {theodoi.title} 
                                    
                                </li>
                            </div>
                        )    
                    })}
                </div>
            </div>
            {/*Chính sách */}
            <div className="bg-green-50 rounded-xl px-3 py-2 my-3 lg:my-0">
                <h1 className="text-lg font-bold py-2 top-menu-item cursor-pointer">Chính sách</h1>
                <div className="font-sm">
                    {chinhsachs.map((chinhsach,index)=>{
                        return(
                            <div key={index}>
                                <li className="text-xs lg:text-sm font-bold py-3 cursor-pointer list-none flex items-center justify-start gap-x-3 hover:text-primary">
                                    <div className="text-xl">
                                        {chinhsach.icon}
                                    </div>
                                    {chinhsach.title} 
                                    
                                </li>
                            </div>
                        )    
                    })}
                </div>
            </div>
            {/*Về chúng tôi */}
            <div className="bg-green-50 rounded-xl px-3 py-2 my-3 lg:my-0">
                <h1 className="text-lg font-bold py-2 top-menu-item cursor-pointer">Về chúng tôi</h1>
                <div className="font-sm">
                    {abouts.map((about,index)=>{
                        return(
                            <div key={index}>
                                <li className="text-xs lg:text-sm font-bold py-3 list-none">
                                    {about}
                                </li>
                            </div>
                        )    
                    })}
                </div>
            </div>
            
        </div>
        <div className="text-center font-Montserrat text-xs bg-gray-50 test rounded-md text-gray-500">
            <p>
            PHDTech 2024. Công Ty TNHH PHDTechShop, Mã Số Thuế: 0123456789 do Sở KHDT TP Hà Nội cấp ngày 31/08/2014. Địa chỉ: 102A Phùng Văn Cung, Phường 7, Quận Phú Nhuận, TP HCM, người đại diện pháp luât: Việt Hùng. Email: info@Phdtechshop.vn. Điện thoại: 0123456789
            </p>
        </div>
        </div>
        
     );
}

export default Footer;