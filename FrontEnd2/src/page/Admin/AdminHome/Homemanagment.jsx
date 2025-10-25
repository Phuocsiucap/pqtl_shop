import React, { useEffect, useState } from "react";
import { FaUser, FaBoxOpen, FaDollarSign } from "react-icons/fa";
import {request1} from "../../../utils/request.js"
const HomeRevenueManagement = ({access_token}) => {
  // Dữ liệu mẫu
const [data,setData]=useState({})
  // console.log("token ",access_token)
  useEffect(()=>{
    const fetch=async()=>{
      try{
        const response=await request1.get("admin/today-revenue/",{
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        })
        // console.log(response)
        setData(response.data)
      }
      catch(e){
        console.log("Lỗi ",e)
      }
    }
    fetch()
  },[])
  return (
    <div className="p-6">
      {/* Tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Khối Tổng số người đăng ký */}
        <div className="bg-blue-100 p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
          <FaUser className="text-4xl text-blue-600 mb-3" />
          <h3 className="text-xl font-semibold text-gray-700">Tổng số người đăng ký</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{data.total_users}</p>
        </div>

        {/* Khối Số sản phẩm bán được trong tháng */}
        <div className="bg-green-100 p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
          <FaBoxOpen className="text-4xl text-green-600 mb-3" />
          <h3 className="text-xl font-semibold text-gray-700">Số sản phẩm bán được trong tháng</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{data.delivered_orders_count}</p>
        </div>

        {/* Khối Doanh thu hôm nay */}
        <div className="bg-yellow-100 p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
          <FaDollarSign className="text-4xl text-yellow-600 mb-3" />
          <h3 className="text-xl font-semibold text-gray-700">Doanh thu hôm nay</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{data.revenue} VND</p>
        </div>
      </div>
    </div>
  );
};

export default HomeRevenueManagement;
