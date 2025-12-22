import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types/product';
import { request1 as apiRequest } from '../utils/request';

interface HomepageData {
  bestsellers: Product[] | null;
  newestProducts: Product[] | null;
  seasonalProducts: Product[] | null;
  loading: boolean;
  error: string | null;
  fetchData: () => void;
}

export const useHomepageData = (): HomepageData => {
  const [bestsellers, setBestsellers] = useState<Product[] | null>(null);
  const [newestProducts, setNewestProducts] = useState<Product[] | null>(null);
  const [seasonalProducts, setSeasonalProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bestsellersResponse, newestResponse, seasonalResponse] = await Promise.all([
        apiRequest.get('v1/homepage/bestsellers'),
        apiRequest.get('v1/homepage/newest'),
        apiRequest.get('v1/homepage/seasonal'),
      ]);

      // Đảm bảo dữ liệu là mảng
      const bestsellersData = Array.isArray(bestsellersResponse.data)
        ? bestsellersResponse.data
        : (bestsellersResponse.data?.content || []);

      const newestData = Array.isArray(newestResponse.data)
        ? newestResponse.data
        : (newestResponse.data?.content || []);

      const seasonalData = Array.isArray(seasonalResponse.data)
        ? seasonalResponse.data
        : (seasonalResponse.data?.content || []);

      setBestsellers(bestsellersData);
      setNewestProducts(newestData);
      setSeasonalProducts(seasonalData);
    } catch (err) {
      console.error('Failed to fetch homepage data:', err);
      setError('Không thể tải dữ liệu trang chủ.');
      setBestsellers(null);
      setNewestProducts(null);
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
    newestProducts,
    seasonalProducts,
    loading,
    error,
    fetchData,
  };
};