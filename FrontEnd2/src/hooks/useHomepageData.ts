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
        apiRequest.get('/v1/homepage/bestsellers'),
        apiRequest.get('/v1/homepage/seasonal'),
      ]);

      setBestsellers(bestsellersResponse.data);
      setSeasonalProducts(seasonalResponse.data);
    } catch (err) {
      console.error('Failed to fetch homepage data:', err);
      setError('Không thể tải dữ liệu trang chủ.');
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