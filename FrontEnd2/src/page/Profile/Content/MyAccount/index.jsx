import { useState } from "react";
import { ContentArr } from "./ContentAccount";
function MyAccount() {
    const title1s=[
        "Thông tin hồ sơ", "Thông tin địa chỉ"
    ]
    const [content,setContent]=useState(0);
    const handleOnclick=(index)=>{
        setContent(index);
    }
    let Content= ContentArr[content].component; 
    return ( 
        <div className="lg:ml-4 mt-3 font-Montserrat">
            {/* tiêu đề */}
           <div className="lg:px-20 border-b-2 border-b-gray-100 flex flex-col gap-y-5 py-2">
            <p className="font-bold text-3xl">
                Hồ sơ của tôi
            </p>
            <p className="font-semibold text-base ">
                Quản lý thông tin của bạn để bảo mật an toàn hơn
            </p>
           </div>
           {/* điều khiển */}
           <div className="px-8 py-2">
            <ul className="flex gap-x-10">
                {
                    title1s.map((title1,index)=>{
                        return(
                           <li key={index} className="px-1 md:px-5 py-2 bg-gray-300 rounded-md cursor-pointer font-bold  text-sm whitespace-nowrap md:text-base hover:text-white hover:bg-primary transition-all duration-500 ease-in-out"
                           onClick={()=>handleOnclick(index)}
                           style={content===index?{
                            background : "rgb(0, 173, 162)",
                            color: "white"
                           }:{}}
                           >
                                {title1}
                           </li>
                        )
                    })
                }
            </ul>
           </div>
           {/* nội dung form dữ liệu */}
           <div className="py-10 px-8">
                <Content/>
           </div>
        </div>
     );
}

export default MyAccount;