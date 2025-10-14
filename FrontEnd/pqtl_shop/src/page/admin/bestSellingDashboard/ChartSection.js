import React, { useState } from "react";
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useBestSelling } from "../../../context/BestSellingContext";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1", "#14b8a6", "#f97316"];

const ChartSection = () => {
  const { sortedProducts } = useBestSelling();
  const [chartType, setChartType] = useState("bar");

  const chartData = sortedProducts.slice(0, 8).map((p) => ({
    name: p.name.length > 20 ? p.name.substring(0, 20) + "..." : p.name,
    quantity: p.quantity,
    revenue: p.revenue / 1000000,
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center ">
        <h2 className="text-lg font-semibold text-gray-900">Biểu Đồ Thống Kê</h2>
        {/* <div className="flex gap-2">
          <button
            onClick={() => setChartType("bar")}
            className={`px-3 py-1 rounded ${chartType === "bar" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Cột
          </button>
          <button
            onClick={() => setChartType("pie")}
            className={`px-3 py-1 rounded ${chartType === "pie" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Tròn
          </button>
        </div> */}
      </div>

      <div className="w-full h-96 flex">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="quantity" fill="#3b82f6" name="Số lượng" />
          </BarChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={100}
                fill="#8884d8"
                dataKey="quantity"
                >
                {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                </Pie>
                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartSection;
