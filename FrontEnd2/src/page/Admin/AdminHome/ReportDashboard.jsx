import React, { useEffect, useState } from "react";
import { request1 } from "../../../utils/request";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import { FaMoneyBillWave, FaChartLine, FaShoppingCart, FaStore, FaGlobe } from "react-icons/fa";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const ReportDashboard = ({ access_token }) => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Default: 30 days ago
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });

    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await request1.get('/admin/reports/revenue', {
                params: { startDate, endDate },
                headers: { Authorization: `Bearer ${access_token}` }
            });
            setReportData(response.data);
        } catch (error) {
            console.error("Error fetching report:", error);
            // alert("Lỗi tải báo cáo: " + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (access_token) {
            fetchReport();
        }
    }, [access_token]); // Chỉ fetch khi có token hoặc manual refresh (nếu cần)

    // Helper format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    if (!reportData) return <div className="p-8 text-center">Đang tải báo cáo...</div>;

    // --- Prepare Chart Data ---

    // 1. Revenue Breakdown (Pie)
    const channelData = {
        labels: ['Online', 'POS (Tại quầy)'],
        datasets: [
            {
                data: [reportData.onlineRevenue, reportData.posRevenue],
                backgroundColor: ['#3B82F6', '#EF4444'], // Blue, Red
                borderColor: ['#fff', '#fff'],
                borderWidth: 2,
            },
        ],
    };

    // 2. Revenue & Profit by Date (Bar + Line)
    // Cần sort date key
    const sortedDates = Object.keys(reportData.revenueByDate || {}).sort();
    const dailyRevenue = sortedDates.map(date => reportData.revenueByDate[date]);

    const dailyChartData = {
        labels: sortedDates,
        datasets: [
            {
                type: 'bar',
                label: 'Doanh thu',
                data: dailyRevenue,
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
            }
        ],
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <FaChartLine className="text-blue-600" />
                    Báo cáo Doanh thu & Lợi nhuận
                </h1>

                <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Từ:</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Đến:</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <button
                        onClick={fetchReport}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Đang tải...' : 'Xem báo cáo'}
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Tổng Doanh thu */}
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Tổng Doanh thu</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">
                                {formatCurrency(reportData.totalRevenue)}
                            </h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-full">
                            <FaMoneyBillWave className="text-blue-500 text-xl" />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-4 text-xs text-gray-500">
                        <span>Online: <b>{formatCurrency(reportData.onlineRevenue)}</b></span>
                        <span>POS: <b>{formatCurrency(reportData.posRevenue)}</b></span>
                    </div>
                </div>

                {/* Lợi nhuận Gộp */}
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Lợi nhuận Gộp</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">
                                {formatCurrency(reportData.totalGrossProfit)}
                            </h3>
                        </div>
                        <div className="p-3 bg-green-50 rounded-full">
                            <FaChartLine className="text-green-500 text-xl" />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                        Tỷ suất lợi nhuận: <b className="text-green-600">
                            {reportData.totalRevenue > 0
                                ? ((reportData.totalGrossProfit / reportData.totalRevenue) * 100).toFixed(1)
                                : 0}%
                        </b>
                    </div>
                </div>

                {/* Tổng Đơn hàng */}
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Tổng Đơn hàng</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">
                                {reportData.totalOrders}
                            </h3>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-full">
                            <FaShoppingCart className="text-purple-500 text-xl" />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-4 text-xs text-gray-500">
                        <span>Online: <b>{reportData.onlineOrders}</b></span>
                        <span>POS: <b>{reportData.posOrders}</b></span>
                    </div>
                </div>

                {/* Kênh hiệu quả */}
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Kênh Doanh thu cao nhất</p>
                            <h3 className="text-xl font-bold text-gray-800 mt-1">
                                {reportData.onlineRevenue >= reportData.posRevenue ? 'Online Web' : 'Tại quầy (POS)'}
                            </h3>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-full">
                            {reportData.onlineRevenue >= reportData.posRevenue
                                ? <FaGlobe className="text-orange-500 text-xl" />
                                : <FaStore className="text-orange-500 text-xl" />
                            }
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                        Chiếm <b className="text-orange-600">
                            {reportData.totalRevenue > 0
                                ? ((Math.max(reportData.onlineRevenue, reportData.posRevenue) / reportData.totalRevenue) * 100).toFixed(1)
                                : 0}%
                        </b> tổng doanh thu
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Biểu đồ Doanh thu theo ngày</h3>
                    <div className="h-80">
                        {sortedDates.length > 0 ? (
                            <Bar
                                data={dailyChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { position: 'top' },
                                    }
                                }}
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">
                                Chưa có dữ liệu cho khoảng thời gian này
                            </div>
                        )}
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Tỷ trọng doanh thu</h3>
                    <div className="h-64 flex justify-center">
                        <Pie
                            data={channelData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                            }}
                        />
                    </div>
                    <div className="mt-6 space-y-3">
                        <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-sm font-medium text-gray-700">Online</span>
                            </div>
                            <span className="text-sm font-bold text-blue-600">{formatCurrency(reportData.onlineRevenue)}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span className="text-sm font-medium text-gray-700">POS (Tại quầy)</span>
                            </div>
                            <span className="text-sm font-bold text-red-600">{formatCurrency(reportData.posRevenue)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportDashboard;
