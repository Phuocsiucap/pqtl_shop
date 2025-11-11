import { useState, useCallback, useEffect } from 'react';
import { Product, SearchParams, Page, SearchHistory } from '../types/product';
import { request1 as apiRequest } from '../utils/request'; // Sử dụng request1 cho API backend
import { Category } from '../api/category'; // Import danh mục

// Định nghĩa lại kiểu Category dựa trên dữ liệu tĩnh
type CategoryType = {
    id: string;
    categporyName: string;
}

interface SearchResult {
  products: Page<Product> | null;
  history: SearchHistory[] | null;
  loading: boolean;
  error: string | null;
  categories: CategoryType[]; // Sử dụng CategoryType
  search: (params: SearchParams) => void;
  fetchHistory: (userId?: string) => void;
}

export const useSearch = (): SearchResult => {
  const [products, setProducts] = useState<Page<Product> | null>(null);
  const [history, setHistory] = useState<SearchHistory[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryType[]>([]); // State cho danh mục

  const search = useCallback(async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    try {
      // Lọc bỏ các tham số null/undefined trước khi gửi
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
      );
      
      const response = await apiRequest.get('/v1/search', { params: filteredParams }); // API path là /api/v1/search, nhưng baseURL đã là /api/
      setProducts(response.data);
      
    } catch (err) {
      console.error('Search failed:', err);
      setError('Không thể tìm kiếm sản phẩm.');
      setProducts(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
      try {
          // Sử dụng dữ liệu tĩnh đã import
          setCategories(Category);
      } catch (err) {
          console.error('Fetch categories failed:', err);
          setCategories([]);
      }
  }, []);

  const fetchHistory = useCallback(async (userId?: string) => {
    // Giả định userId được truyền vào hoặc lấy từ context/auth
    try {
      const response = await apiRequest.get('/v1/search/history', {
        params: { userId },
      });
      setHistory(response.data);
    } catch (err) {
      console.error('Fetch history failed:', err);
      setHistory(null);
    }
  }, []);

  // Fetch categories khi mount
  useEffect(() => {
      fetchCategories();
  }, [fetchCategories]);

  return {
    products,
    history,
    loading,
    error,
    categories, // Trả về categories
    search,
    fetchHistory,
  };
};