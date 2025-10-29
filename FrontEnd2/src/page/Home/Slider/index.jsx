
import { useState } from 'react';
import Image1 from '../../../assets/images/Titel_1.jpg';
import Image2 from '../../../assets/images/Image2.jpg';
import Image3 from '../../../assets/images/Image3.jpg';
import Image4 from '../../../assets/images/Image4.png';
function Slider() {
    const [index,setIndex]=useState(0);
    const Images=[
        {title:"Thực phẩm sạch – Organic / Nông sản tươi", data: Image1},
        {title:"Thực phẩm đông lạnh / Hải sản", data: Image2},
        {title:"Cửa hàng trái cây – Vitamin mỗi ngày", data: Image3},
        {title:"Ưu đãi mùa này – Giảm giá đến 40%", data: Image4},
    ]
    return ( 
    <div className='rounded-xl mx-3 my-3 lg:mx-15 xl:mx-32 relative border-2 border-gray-100 border-solid'>
        {/*background  image*/}
        <div className='flex justify-center items-center rounded-xl'>
            <img src={Images[index].data} alt="" className='rounded-t-xl cursor-pointer'/>
        </div>
        {/*button  change*/}
        <div className='hidden lg:block '>
            <ul className='flex justify-center items-center px-3 text-sm font-bold font-Montserrat gap-x-5 py-3'>
            {
            Images.map((Image,i)=>{
                return(
                    <li className='list-none text-center top-menu-item cursor-pointer' key={i} onClick={()=>setIndex(i)}>   
                            <span href="">{Image.title}</span>
                        
                    </li>  
                ) 
            }
            )
            }
            </ul>
        
        </div>
    </div> 
    );
}

export default Slider;

