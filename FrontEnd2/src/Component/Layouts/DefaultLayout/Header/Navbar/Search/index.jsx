function Search({search}) {
    const products=[
        "Laptop xu hướng",
        "Lap văn phòng siêu sịn",
        "Lap đồ họa code siêu trâu",
        "Bàn phím máy tính siêu rẻ",
        "Chuột gamming nhấp nháy"
    ]
    let test=[];
    const result=()=>{
        if(search.length>0){
            for(let i=0;i<search.length;i++){
                test=products.filter(item=>{
                    return item.toLowerCase().includes(search[i])
                })
        }
        }
        return test;
    }
    result();
    return ( 
        <div className=" max-h-[50%] w-svw lg:w-[700px] xl:w-[900px] z-10 bg-white font-Montserrat text-left ">
           <div className="text-base lg:text-xl font-bold text-primary py-5 px-5">
            {
           search?
           <span>Gợi ý cho bạn</span>
            :
            <span>Sản phầm xu hướng</span>
            }</div>
           <ul className="font-semibold text-xs lg:text-sm">
            {
                test.map((product,index)=>{
                    return(
                        <li key={index} className=" cursor-pointer px-5 py-3 text-gray-600 hover:bg-gray-200 hover:text-primary hover:font-bold transition-all duration-500 ease-in-out">
                            {product}
                        </li>
                    )
                })
            }
           </ul>
        </div>
     );
}

export default Search;