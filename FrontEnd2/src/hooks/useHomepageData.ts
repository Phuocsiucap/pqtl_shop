import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types/product';
import { request1 as apiRequest } from '../utils/request';

interface HomepageData {
  bestsellers: Product[] | null;
  seasonalProducts: Product[] | null;
  loading: boolean;
  error: string | null;
  fetchData: () => void;
}

export const useHomepageData = (): HomepageData => {
  const [bestsellers, setBestsellers] = useState<Product[] | null>(null);
  const [seasonalProducts, setSeasonalProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bestsellersResponse, seasonalResponse] = await Promise.all([
        apiRequest.get('v1/homepage/bestsellers'),
        apiRequest.get('v1/homepage/seasonal'),
      ]);

      // Log để debug
      console.log('Bestsellers Response:', bestsellersResponse);
      console.log('Seasonal Response:', seasonalResponse);
      
      // Đảm bảo dữ liệu là mảng
      const bestsellersData = Array.isArray(bestsellersResponse.data) 
        ? bestsellersResponse.data 
        : (bestsellersResponse.data?.content || []);
      
      const seasonalData = Array.isArray(seasonalResponse.data) 
        ? seasonalResponse.data 
        : (seasonalResponse.data?.content || []);

      console.log('Bestsellers Data:', bestsellersData);
      console.log('Bestsellers Data Length:', bestsellersData?.length);
      console.log('Seasonal Data:', seasonalData);
      console.log('Seasonal Data Length:', seasonalData?.length);

      // Luôn set dữ liệu, kể cả khi là mảng rỗng (để component có thể xử lý)
      setBestsellers(bestsellersData);
      setSeasonalProducts(seasonalData);
    } catch (err) {
      console.error('Failed to fetch homepage data:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Không thể tải dữ liệu trang chủ.');
      // Set null để component hiển thị thông báo "Không tìm thấy"
      setBestsellers(null);
      setSeasonalProducts(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    bestsellers,
    seasonalProducts,
    loading,
    error,
    fetchData,
  };
};