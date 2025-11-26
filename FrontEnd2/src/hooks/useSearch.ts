import { useState, useCallback, useEffect } from 'react';
import { Product, SearchParams, Page, SearchHistory } from '../types/product';
import { request1 as apiRequest } from '../utils/request'; // Sử dụng request1 cho API backend
import { getCategories } from '../api/category';

type CategoryType = {
  id?: string;
  name: string;
  slug?: string;
};

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

  const adaptResponseToPage = (
    data: any,
    params: SearchParams
  ): Page<Product> => {
    const defaultPage = params.page ?? 0;
    const fallbackSize = Array.isArray(data)
      ? data.length
      : data?.content?.length ?? 0;
    const defaultSize = (params.size ?? fallbackSize) || 1;

    if (Array.isArray(data)) {
      const totalElements = data.length;
      const totalPages = Math.max(1, Math.ceil(totalElements / defaultSize));
      const start = defaultPage * defaultSize;
      const end = start + defaultSize;

      return {
        content: data.slice(start, end),
        totalElements,
        totalPages,
        number: defaultPage,
        size: defaultSize,
        first: defaultPage === 0,
        last: defaultPage >= totalPages - 1,
      };
    }

    const content = Array.isArray(data?.content) ? data.content : [];
    const totalElements = data?.totalElements ?? content.length;
    const totalPages = data?.totalPages ?? Math.max(1, Math.ceil(totalElements / defaultSize));
    const number = data?.number ?? defaultPage;
    const size = data?.size ?? defaultSize;

    return {
      content,
      totalElements,
      totalPages,
      number,
      size,
      first: data?.first ?? number === 0,
      last: data?.last ?? number >= totalPages - 1,
    };
  };

  const search = useCallback(async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    try {
      // Lọc bỏ các tham số null/undefined trước khi gửi
      // Nhưng giữ lại keyword ngay cả khi là chuỗi rỗng (để backend xử lý)
      const filteredParams: any = {};
      
      // Luôn thêm keyword nếu có (kể cả chuỗi rỗng)
      if (params.keyword !== undefined && params.keyword !== null) {
        filteredParams.keyword = params.keyword;
      }
      
      // Lọc các tham số khác
      Object.entries(params).forEach(([key, value]) => {
        if (key !== 'keyword' && value !== undefined && value !== null && value !== "") {
          filteredParams[key] = value;
        }
      });
      
      console.log('Search params:', filteredParams); // Debug log
      const response = await apiRequest.get('v1/search', { params: filteredParams }); // API path là /api/v1/search, baseURL đã gồm /api/
      console.log('Search response:', response.data); // Debug log
      const normalizedPage = adaptResponseToPage(response.data, filteredParams);
      setProducts(normalizedPage);
      
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
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Fetch categories failed:', err);
      setCategories([]);
    }
  }, []);

  const fetchHistory = useCallback(async (userId?: string) => {
    // Giả định userId được truyền vào hoặc lấy từ context/auth
    try {
      const response = await apiRequest.get('v1/search/history', {
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