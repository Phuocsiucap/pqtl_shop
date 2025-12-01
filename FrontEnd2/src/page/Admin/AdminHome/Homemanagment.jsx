import React, { useEffect, useState } from "react";
import { FaUser, FaBoxOpen, FaDollarSign, FaTicketAlt, FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";
import {request1} from "../../../utils/request.js"
const HomeRevenueManagement = ({access_token}) => {
  // Dữ liệu mẫu
const [data,setData]=useState({})
const [voucherStats, setVoucherStats] = useState({ total: 0, active: 0, used: 0 })
  // console.log("token ",access_token)
  useEffect(()=>{
    const fetch=async()=>{
      try{
        const response=await request1.get("v1/admin/today-revenue/",{
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

  // Fetch voucher stats
  useEffect(() => {
    const fetchVoucherStats = async () => {
      try {
        const response = await request1.get("v1/admin/vouchers/", {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        const vouchers = response.data || [];
        setVoucherStats({
          total: vouchers.length,
          active: vouchers.filter(v => v.isActive && v.isValid).length,
          used: vouchers.reduce((sum, v) => sum + (v.usedCount || 0), 0)
        });
      } catch (e) {
        console.log("Lỗi khi lấy voucher stats:", e);
      }
    };
    if (access_token) {
      fetchVoucherStats();
    }
  }, [access_token]);

  return (
    <div className="p-6">
      {/* Tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Khối Voucher */}
        <Link to="/admin/managevoucher" className="bg-purple-100 p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow cursor-pointer">
          <FaTicketAlt className="text-4xl text-purple-600 mb-3" />
          <h3 className="text-xl font-semibold text-gray-700">Voucher</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">{voucherStats.active}/{voucherStats.total}</p>
          <p className="text-sm text-gray-500 mt-1">Đang hoạt động / Tổng</p>
        </Link>
      </div>

      {/* Thống kê chi tiết voucher */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Tổng voucher</p>
              <p className="text-2xl font-bold text-gray-800">{voucherStats.total}</p>
            </div>
            <FaTicketAlt className="text-3xl text-purple-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Voucher hoạt động</p>
              <p className="text-2xl font-bold text-green-600">{voucherStats.active}</p>
            </div>
            <FaTicketAlt className="text-3xl text-green-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Lượt sử dụng</p>
              <p className="text-2xl font-bold text-orange-600">{voucherStats.used}</p>
            </div>
            <FaShoppingCart className="text-3xl text-orange-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeRevenueManagement;
