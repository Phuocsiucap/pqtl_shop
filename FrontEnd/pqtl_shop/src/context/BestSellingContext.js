import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { getBestSellingProducts } from './../services/bestSellingAPI';
import { exportService } from './../services/exportService';
const BestSellingContext = createContext();

export const BestSellingProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [timeFilter, setTimeFilter] = useState('week');
  const [sortBy, setSortBy] = useState('quantity');
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [exporting, setExporting] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBestSellingProducts(timeFilter);
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }, [timeFilter]);

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => (sortBy === 'quantity' ? b.quantity - a.quantity : b.revenue - a.revenue));
  }, [products, sortBy]);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const result = await exportService(format, sortedProducts);
      alert(`Xuất báo cáo thành công: ${result.filename}`);
    } catch {
      alert('Lỗi khi xuất báo cáo');
    } finally {
      setExporting(false);
    }
  };

  return (
    <BestSellingContext.Provider
      value={{ products, sortedProducts, timeFilter, setTimeFilter, sortBy, setSortBy, dateRange, setDateRange, loadProducts, handleExport, loading, exporting }}
    >
      {children}
    </BestSellingContext.Provider>
  );
};

export const useBestSelling = () => useContext(BestSellingContext);
