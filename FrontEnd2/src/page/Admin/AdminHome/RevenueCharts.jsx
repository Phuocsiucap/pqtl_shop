import React, { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { request1 } from "../../../utils/request";
import { data } from "autoprefixer";
// Đăng ký các phần mở rộng của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RevenueCharts = ({ access_token }) => {
  const [dataMonth, setDataMonth] = useState([]);
  const [dataWeek, setDataWeek] = useState([]);

  // Tính toán mảng revenue từ dataMonth
  const monthlyRevenueDesc = Array.isArray(dataMonth) && dataMonth.length > 0
    ? dataMonth.map(item => item.revenue || 0)
    : Array(12).fill(0);

  const monthlyOnlineRevenue = Array.isArray(dataMonth) && dataMonth.length > 0
    ? dataMonth.map(item => item.onlineRevenue || 0)
    : Array(12).fill(0);

  const monthlyPosRevenue = Array.isArray(dataMonth) && dataMonth.length > 0
    ? dataMonth.map(item => item.posRevenue || 0)
    : Array(12).fill(0);

  // Tính toán mảng revenue từ dataWeek
  const weeklyRevenueDesc = Array.isArray(dataWeek) && dataWeek.length > 0
    ? dataWeek.map(item => item.revenue || 0)
    : Array(7).fill(0);

  const weeklyOnlineRevenue = Array.isArray(dataWeek) && dataWeek.length > 0
    ? dataWeek.map(item => item.onlineRevenue || 0)
    : Array(7).fill(0);

  const weeklyPosRevenue = Array.isArray(dataWeek) && dataWeek.length > 0
    ? dataWeek.map(item => item.posRevenue || 0)
    : Array(7).fill(0);

  // Dữ liệu mẫu cho doanh thu trong 12 tháng
  const monthlyRevenueData = {
    labels: [
      "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
      "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
    ],
    datasets: [
      {
        label: "Tổng doanh thu",
        data: monthlyRevenueDesc,
        borderColor: "#34D399", // Xanh lá
        backgroundColor: "rgba(52, 211, 153, 0.2)",
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: "Bán Online",
        data: monthlyOnlineRevenue,
        borderColor: "#3B82F6", // Xanh dương
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: "Tại Quầy (POS)",
        data: monthlyPosRevenue,
        borderColor: "#F59E0B", // Cam
        backgroundColor: "rgba(245, 158, 11, 0.2)",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  // Dữ liệu mẫu cho doanh thu trong tuần này
  const weeklyRevenueData = {
    labels: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"],
    datasets: [
      {
        label: "Tổng doanh thu",
        data: weeklyRevenueDesc,
        borderColor: "#8B5CF6", // Tím
        backgroundColor: "rgba(139, 92, 246, 0.2)",
        borderWidth: 2,
      },
      {
        label: "Bán Online",
        data: weeklyOnlineRevenue,
        borderColor: "#3B82F6", // Xanh dương
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderWidth: 2,
      },
      {
        label: "Tại Quầy (POS)",
        data: weeklyPosRevenue,
        borderColor: "#F59E0B", // Cam
        backgroundColor: "rgba(245, 158, 11, 0.2)",
        borderWidth: 2,
      },
    ],
  };
  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await request1.get("v1/admin/revenue/monthly/", {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        console.log("Monthly revenue:", response.data);
        setDataMonth(response.data);
      } catch (e) {
        console.log("Lỗi ", e);
      }
    };
    fetch();
  }, []);
  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await request1.get("v1/admin/revenue/weekly/", {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        console.log("Weekly revenue:", response.data);
        setDataWeek(response.data);
      } catch (e) {
        console.log("Lỗi ", e);
      }
    };
    fetch();
  }, []);
  return (
    <div className="p-6 space-y-40">
      {/* Biểu đồ doanh thu trong tuần này */}
      <div
        className="bg-white p-6 rounded-lg shadow-md my-20"
        style={{ height: "400px", width: "100%" }}
      >
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Doanh thu trong tuần này
        </h3>
        <Bar
          data={weeklyRevenueData}
          options={{
            responsive: true,
            maintainAspectRatio: false, // Đảm bảo chiều cao không bị kéo dài quá nhiều
            aspectRatio: 1.5, // Tỷ lệ khung hình cho biểu đồ
          }}
        />
      </div>
      {/* Biểu đồ doanh thu trong 12 tháng */}
      <div
        className="bg-white p-6 rounded-lg shadow-md"
        style={{ height: "400px", width: "100%" }}
      >
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Doanh thu trong 12 tháng
        </h3>
        <Line
          data={monthlyRevenueData}
          options={{
            responsive: true,
            maintainAspectRatio: false, // Đảm bảo chiều cao không bị kéo dài quá nhiều
            aspectRatio: 1.5, // Tỷ lệ khung hình cho biểu đồ
          }}
        />
      </div>
    </div>
  );
};

export default RevenueCharts;
