import { useState, useCallback, useEffect } from 'react';
import { Product, SearchParams, Page, SearchHistory } from '../types/product';
import { request1 as apiRequest } from '../utils/request'; // Sử dụng request1 cho API backend
import { getCategories } from '../api/category';
import { computeFinalPrice } from '../utils/pricing';

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

      // Chuẩn hóa sortBy để khớp backend và client
      const normalizeSort = (value?: string) => {
        switch (value) {
          case 'price_low_to_high':
          case 'price_asc':
            return 'price_low_to_high';
          case 'price_high_to_low':
          case 'price_desc':
            return 'price_high_to_low';
          case 'rating':
          case 'rating_desc':
            return 'rating_desc';
          case 'newest':
            return 'newest';
          case 'popular':
          case 'sold_desc':
            return 'popular';
          default:
            return value;
        }
      };

      // Lọc các tham số khác
      Object.entries(params).forEach(([key, value]) => {
        if (key !== 'keyword' && value !== undefined && value !== null && value !== "") {
          filteredParams[key] = key === 'sortBy' ? normalizeSort(value as string) : value;
        }
      });

      console.log('Search params:', filteredParams); // Debug log
      const response = await apiRequest.get('v1/search', { params: filteredParams }); // API path là /api/v1/search, baseURL đã gồm /api/
      console.log('Search response:', response.data); // Debug log

      const normalizedPage = adaptResponseToPage(response.data, filteredParams);

      // Đảm bảo luôn có finalPrice và tự sắp xếp khi sortBy liên quan tới giá
      const enrichedContent = normalizedPage.content.map((product) => ({
        ...product,
        finalPrice: computeFinalPrice(product),
      }));

      let sortedContent = enrichedContent;
      if (filteredParams.sortBy === 'price_low_to_high' || filteredParams.sortBy === 'price_asc') {
        sortedContent = [...enrichedContent].sort((a, b) => computeFinalPrice(a) - computeFinalPrice(b));
      } else if (filteredParams.sortBy === 'price_high_to_low' || filteredParams.sortBy === 'price_desc') {
        sortedContent = [...enrichedContent].sort((a, b) => computeFinalPrice(b) - computeFinalPrice(a));
      }

      setProducts({
        ...normalizedPage,
        content: sortedContent,
      });

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