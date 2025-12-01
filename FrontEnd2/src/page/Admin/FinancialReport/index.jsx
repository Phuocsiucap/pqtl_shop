import React, { useEffect, useState } from "react";
import { 
  FaChartLine, FaMoneyBillWave, FaCoins, FaPercent, 
  FaShoppingCart, FaBoxes, FaCalendarAlt, FaFileExcel,
  FaArrowUp, FaArrowDown, FaTrophy
} from "react-icons/fa";
import { request1 } from "../../../utils/request";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken";
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const FinancialReport = () => {
  const [reportData, setReportData] = useState(null);
  const [profitRanking, setProfitRanking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("month");
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  const [useCustomRange, setUseCustomRange] = useState(false);
  const access_token = getCSRFTokenFromCookie("access_token_admin");

  const fetchFinancialReport = async () => {
    setLoading(true);
    try {
      let url = `v1/admin/financial-report/?period=${timeRange}`;
      
      if (useCustomRange && customDateRange.startDate && customDateRange.endDate) {
        url += `&startDate=${customDateRange.startDate}T00:00:00&endDate=${customDateRange.endDate}T23:59:59`;
      }
      
      const response = await request1.get(url, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      console.log("Financial report:", response.data);
      setReportData(response.data);
    } catch (e) {
      console.log("Lỗi fetching financial report:", e);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfitRanking = async () => {
    try {
      const response = await request1.get(`v1/admin/products/profit-ranking/?period=${timeRange}&limit=10`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      console.log("Profit ranking:", response.data);
      setProfitRanking(response.data);
    } catch (e) {
      console.log("Lỗi fetching profit ranking:", e);
      setProfitRanking(null);
    }
  };

  useEffect(() => {
    fetchFinancialReport();
    fetchProfitRanking();
  }, [timeRange, useCustomRange, customDateRange]);

  // Export to CSV
  const exportToCSV = () => {
    if (!reportData) return;
    
    const headers = ["Ngày", "Doanh thu", "Chi phí", "Lợi nhuận", "Số đơn", "Số sản phẩm"];
    const data = (reportData.periodStats || []).map(stat => [
      stat.date,
      stat.revenue || 0,
      stat.cost || 0,
      stat.profit || 0,
      stat.orders || 0,
      stat.items || 0
    ]);
    
    const summary = [
      [""],
      ["TỔNG KẾT"],
      ["Tổng doanh thu", reportData.totalRevenue || 0],
      ["Tổng chi phí", reportData.totalCost || 0],
      ["Tổng lợi nhuận", reportData.totalProfit || 0],
      ["Biên lợi nhuận", `${(reportData.profitMargin || 0).toFixed(2)}%`],
      ["Tổng đơn hàng", reportData.totalOrders || 0],
      ["Giá trị đơn TB", reportData.avgOrderValue || 0],
    ];
    
    const csvContent = [
      headers.join(","),
      ...data.map(row => row.join(",")),
      ...summary.map(row => row.join(","))
    ].join("\n");
    
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `bao-cao-tai-chinh-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chart data
  const chartData = reportData?.chartData ? {
    labels: reportData.chartData.labels || [],
    datasets: [
      {
        label: "Doanh thu",
        data: reportData.chartData.revenue || [],
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Chi phí",
        data: reportData.chartData.cost || [],
        borderColor: "rgba(239, 68, 68, 1)",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Lợi nhuận",
        data: reportData.chartData.profit || [],
        borderColor: "rgba(16, 185, 129, 1)",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  } : null;

  const doughnutData = reportData ? {
    labels: ['Chi phí', 'Lợi nhuận'],
    datasets: [{
      data: [reportData.totalCost || 0, reportData.totalProfit || 0],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(16, 185, 129, 0.8)',
      ],
      borderColor: [
        'rgba(239, 68, 68, 1)',
        'rgba(16, 185, 129, 1)',
      ],
      borderWidth: 1,
    }],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Biểu đồ Doanh thu - Chi phí - Lợi nhuận' },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const formatCurrency = (value) => {
    return (value || 0).toLocaleString('vi-VN') + ' ₫';
  };

  return (
    <div className="p-6 w-full font-medium">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <FaChartLine className="text-blue-600 text-3xl" />
          <h2 className="text-2xl font-semibold text-gray-800">
            Báo cáo tài chính
          </h2>
        </div>
        
        <button
          onClick={exportToCSV}
          disabled={!reportData}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <FaFileExcel />
          Xuất báo cáo
        </button>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Time Range Buttons */}
          <div className="flex gap-2">
            {[
              { value: "week", label: "Tuần này" },
              { value: "month", label: "Tháng này" },
              { value: "year", label: "Năm nay" },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => { setTimeRange(value); setUseCustomRange(false); }}
                className={`px-4 py-2 rounded-md transition-colors ${
                  timeRange === value && !useCustomRange
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          
          <div className="h-8 w-px bg-gray-300"></div>
          
          {/* Custom Date Range */}
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-500" />
            <input
              type="date"
              value={customDateRange.startDate}
              onChange={(e) => {
                setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }));
                setUseCustomRange(true);
              }}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">đến</span>
            <input
              type="date"
              value={customDateRange.endDate}
              onChange={(e) => {
                setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }));
                setUseCustomRange(true);
              }}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!loading && reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Total Revenue */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Tổng doanh thu</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(reportData.totalRevenue)}</p>
                  <p className="text-blue-200 text-sm mt-1">{reportData.totalOrders || 0} đơn hàng</p>
                </div>
                <FaMoneyBillWave className="text-5xl text-blue-300" />
              </div>
            </div>

            {/* Total Cost */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Tổng chi phí (giá nhập)</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(reportData.totalCost)}</p>
                  <p className="text-red-200 text-sm mt-1">{reportData.totalItems || 0} sản phẩm</p>
                </div>
                <FaCoins className="text-5xl text-red-300" />
              </div>
            </div>

            {/* Total Profit */}
            <div className={`bg-gradient-to-r ${(reportData.totalProfit || 0) >= 0 ? 'from-green-500 to-green-600' : 'from-orange-500 to-orange-600'} text-white p-6 rounded-lg shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${(reportData.totalProfit || 0) >= 0 ? 'text-green-100' : 'text-orange-100'} text-sm`}>Tổng lợi nhuận</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(reportData.totalProfit)}</p>
                  <p className={`${(reportData.totalProfit || 0) >= 0 ? 'text-green-200' : 'text-orange-200'} text-sm mt-1 flex items-center gap-1`}>
                    {(reportData.totalProfit || 0) >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                    {reportData.profitMargin?.toFixed(2) || 0}% biên lợi nhuận
                  </p>
                </div>
                <FaPercent className="text-5xl text-green-300" />
              </div>
            </div>

            {/* Average Order Value */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Giá trị đơn TB</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(reportData.avgOrderValue)}</p>
                  <p className="text-purple-200 text-sm mt-1">Lợi nhuận TB: {formatCurrency(reportData.avgProfitPerOrder)}</p>
                </div>
                <FaShoppingCart className="text-5xl text-purple-300" />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Line Chart */}
            <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Biểu đồ theo thời gian</h3>
              <div className="h-[350px]">
                {chartData && <Line data={chartData} options={chartOptions} />}
              </div>
            </div>

            {/* Doughnut Chart */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Cơ cấu doanh thu</h3>
              <div className="h-[300px] flex items-center justify-center">
                {doughnutData && <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />}
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500"></div>
                    Chi phí:
                  </span>
                  <span className="font-semibold">{formatCurrency(reportData.totalCost)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500"></div>
                    Lợi nhuận:
                  </span>
                  <span className="font-semibold">{formatCurrency(reportData.totalProfit)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profit Ranking */}
          {profitRanking && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top High Profit */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
                  <FaTrophy className="text-yellow-500" />
                  Top sản phẩm lời cao nhất
                </h3>
                <div className="space-y-3">
                  {(profitRanking.topHighProfit || []).slice(0, 5).map((product, index) => (
                    <div key={product.productId || index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                          index === 0 ? 'bg-yellow-400 text-white' :
                          index === 1 ? 'bg-gray-300 text-gray-700' :
                          index === 2 ? 'bg-orange-400 text-white' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-800">{product.productName || product.productId}</p>
                          <p className="text-sm text-gray-500">Bán: {product.soldQuantity || 0} | Đơn: {product.orderCount || 0}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(product.profit)}</p>
                        <p className="text-xs text-gray-500">Biên: {(product.profitMargin || 0).toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Low Profit */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
                  <FaArrowDown className="text-red-500" />
                  Top sản phẩm lời thấp nhất
                </h3>
                <div className="space-y-3">
                  {(profitRanking.topLowProfit || []).slice(0, 5).map((product, index) => (
                    <div key={product.productId || index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-red-200 text-red-700 font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-800">{product.productName || product.productId}</p>
                          <p className="text-sm text-gray-500">Bán: {product.soldQuantity || 0} | Đơn: {product.orderCount || 0}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${(product.profit || 0) >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {formatCurrency(product.profit)}
                        </p>
                        <p className="text-xs text-gray-500">Biên: {(product.profitMargin || 0).toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Daily Stats Table */}
          <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
            <h3 className="text-lg font-semibold p-4 border-b text-gray-700">Chi tiết theo ngày</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Ngày</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">Doanh thu</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">Chi phí</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">Lợi nhuận</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">Đơn hàng</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">Sản phẩm</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {(reportData.periodStats || []).map((stat, index) => (
                    <tr key={stat.date || index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-3 font-medium">{stat.date}</td>
                      <td className="px-6 py-3 text-right text-blue-600">{formatCurrency(stat.revenue)}</td>
                      <td className="px-6 py-3 text-right text-red-600">{formatCurrency(stat.cost)}</td>
                      <td className={`px-6 py-3 text-right font-semibold ${(stat.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(stat.profit)}
                      </td>
                      <td className="px-6 py-3 text-center">{stat.orders || 0}</td>
                      <td className="px-6 py-3 text-center">{stat.items || 0}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-200 font-semibold">
                  <tr>
                    <td className="px-6 py-3">TỔNG CỘNG</td>
                    <td className="px-6 py-3 text-right text-blue-700">{formatCurrency(reportData.totalRevenue)}</td>
                    <td className="px-6 py-3 text-right text-red-700">{formatCurrency(reportData.totalCost)}</td>
                    <td className={`px-6 py-3 text-right ${(reportData.totalProfit || 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {formatCurrency(reportData.totalProfit)}
                    </td>
                    <td className="px-6 py-3 text-center">{reportData.totalOrders || 0}</td>
                    <td className="px-6 py-3 text-center">{reportData.totalItems || 0}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}

      {/* No Data */}
      {!loading && !reportData && (
        <div className="text-center py-12">
          <FaChartLine className="mx-auto text-6xl text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Không có dữ liệu báo cáo</p>
          <p className="text-gray-400">Hãy thử thay đổi khoảng thời gian</p>
        </div>
      )}
    </div>
  );
};

export default FinancialReport;
