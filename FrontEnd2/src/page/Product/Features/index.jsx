function Features() {
    const Feature={
        name:"Surface Pro 11 – Snapdragon X Plus 16GB 512GB",
        outstanding_features:[
            "Màn hình: LCD display, 13 inch, 2880 x 1920 (267 PPI), PixelSense, cảm ứng 10 chạm, Dolby Vision IQ, Gorilla® Glass 5",
            "CPU: Snapdragon X Plus",
            "Card đồ họa: GPU Qualcomm Adreno",
            "NPU: Qualcomm Hexagon (chipset hỗ trợ Al)",
            "RAM: 16GB LPDDR5x",
            "Ổ cứng: 512GB (SSD thế hệ 4)",
            "Pin: 48WHrs",
            "Hệ điều hành: Windows 11",
            "Nút vật lý gọi Copilot nhanh chóng",
            "Trọng lượng: 895g"
        ],
        screen:{
            dimenstion:"13 inch",
            resolution:"2880 x 1920 (226 PPI)",
            scanning_frequency:"120Hz",// tần số quyét
            technology_screens:[
                "LCD display", 
                "Cảm ứng 10 điểm chạm",
                "Tỉ lệ màn hình: 3:2",
                "Độ tương phản: 1200:1",
                "Cấu hình màu: sRGB và sống động",
                "Dolby Vision IQ",
                "Gorilla@ Glass 5"
            ]
        },
        processor:{
            technology_CPUs:[
                "Snapdragon X plus",
                "NPU: Qualcomm Hexagon"
            ],
            So_luong:"Đang cập nhật",
            So_nhan:"Đang cập nhật",
        }
    }
    const screen=[
        "13 inch",
        "2880 x 1920 (226 PPI)",
        "120Hz",// tần số quyét
        [
            "LCD display", 
            "Cảm ứng 10 điểm chạm",
            "Tỉ lệ màn hình: 3:2",
            "Độ tương phản: 1200:1",
            "Cấu hình màu: sRGB và sống động",
            "Dolby Vision IQ",
            "Gorilla@ Glass 5"
        ]
    ]
    return ( 
        <div className="test my-4 grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Đặc điểm nổi bật */}
            <div className="font-Montserrat border-2 border-gray-50 rounded-md px-2 py-2">
                <p className="uppercase font-bold text-primary text-base lg:text-xl text-center">Đặc điểm nổi bật</p>
                <p className="text-sm lg:text-base font-semibold">{Feature.name} có các đặc điểm nổi bật:</p>
                <div className="py-5 px-3">
                    {
                        Feature.outstanding_features.map((feature,index)=>{
                            return(
                                <li key={index} className="text-sm font-medium py-1.5 text-justify">
                                    {feature}
                                </li>
                            )
                        })
                    }
                </div>
            </div>
            {/* Thông số kĩ thuật */}
            <div className="font-Montserrat border-2 border-gray-50 rounded-md px-2 py-2 shadow-sm">
                    <p className="text-base lg:text-xl font-bold py-3 px-3">
                        Thông số kĩ thuật
                    </p>
                    <table className="text-base w-full font-semibold text-gray-500">
                        <tbody>
                        <tr className="text-black hover:bg-gray-300 transtion-all duration-500 px-2 py-5">
                                <td colSpan={2}>Màn hình</td>
                            </tr>
                            <tr className="">
                                <td>Kích thước</td>
                                <td>{Feature.screen.dimenstion}</td>
                            </tr>
                            <tr>
                                <td>Độ phân giải</td>
                                <td>{Feature.screen.resolution}</td>
                            </tr>
                            <tr>
                                <td>Tần số quyét</td>
                                <td>{Feature.screen.scanning_frequency}</td>
                            </tr>
                            <tr>
                                <td>Công nghệ màn hình</td>
                                <td>{Feature.screen.technology_screens.map((technology,index)=>{
                                    return(
                                        <li key={index}>{technology}</li>
                                    )
                                })}</td>
                            </tr>
                            <tr aria-rowspan={2} className="text-black">
                                <td>Bộ xử lý</td>
                            </tr>
                            <tr>
                                <td>Công nghệ CPU</td>
                                <td>{Feature.processor.technology_CPUs.map((technology,index)=>{
                                    return(
                                        <li key={index}>{technology}</li>
                                    )
                                })}</td>
                            </tr>
                            <tr>
                                <td>Số luồng</td>
                                <td>{Feature.processor.So_luong}</td>
                            </tr>
                            <tr>
                                <td>Số nhân</td>
                                <td>{Feature.processor.So_nhan}</td>
                            </tr>
                        </tbody>
                    </table>
            </div>
        </div>
     );
}

export default Features;