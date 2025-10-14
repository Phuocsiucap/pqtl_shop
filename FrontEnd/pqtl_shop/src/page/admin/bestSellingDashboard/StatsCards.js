import React from "react";
import { DollarSign, Package, TrendingUp } from "lucide-react";
import { formatCurrency } from "../../../utils/formatters";

const StatsCards = ({ totalRevenue, totalQuantity, totalProducts }) => {
  const cards = [
    {
      label: "Tổng Doanh Thu",
      value: formatCurrency(totalRevenue),
      icon: <DollarSign className="w-6 h-6 text-blue-600" />,
      color: "blue",
    },
    {
      label: "Tổng Số Lượng Bán",
      value: totalQuantity.toLocaleString(),
      icon: <Package className="w-6 h-6 text-green-600" />,
      color: "green",
    },
    {
      label: "Sản Phẩm",
      value: totalProducts,
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      color: "purple",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((c) => (
        <div key={c.label} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{c.label}</p>
              <p className={`text-2xl font-bold text-${c.color}-600`}>{c.value}</p>
            </div>
            <div className={`bg-${c.color}-100 p-3 rounded-lg`}>{c.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
