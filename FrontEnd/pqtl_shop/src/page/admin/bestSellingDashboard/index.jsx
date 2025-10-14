import React, { useEffect } from "react";
import { useBestSelling } from "../../../context/BestSellingContext";
import StatsCards from "./StatsCards";
import FilterPanel from "./FilterPanel";
import ChartSection from "./ChartSection";
import ProductTable from "./ProductTable";

const Dashboard = () => {
  const { products, loadProducts } = useBestSelling();

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản Lý Sản Phẩm Bán Chạy</h1>
          <p className="text-gray-600">Thống kê và phân tích sản phẩm theo thời gian thực</p>
        </header>

        <StatsCards totalRevenue={totalRevenue} totalQuantity={totalQuantity} totalProducts={products.length} />
        <FilterPanel />
        
        <ChartSection />
          {/* Có thể thêm TopProduct component sau */}
        
        <ProductTable />
      </div>    
    </div>
  );
};

export default Dashboard;
