import { useState, useCallback } from 'react';
import { Product, ProductReview, Page } from '../types/product';
import { request1 as apiRequest } from '../utils/request';

interface ProductDetailResult {
  product: Product | null;
  similarProducts: Product[] | null;
  reviews: Page<ProductReview> | null;
  loading: boolean;
  error: string | null;
  fetchProductDetail: (id: string) => void;
  fetchReviews: (id: string, page: number, size: number) => void;
  addReview: (id: string, review: Omit<ProductReview, 'id' | 'reviewDate'>) => Promise<ProductReview | null>;
}

export const useProductDetail = (): ProductDetailResult => {
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[] | null>(null);
  const [reviews, setReviews] = useState<Page<ProductReview> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductDetail = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Product Detail
      const productResponse = await apiRequest.get(`/v1/products/${id}`);
      const fetchedProduct: Product = productResponse.data;
      setProduct(fetchedProduct);

      // 2. Fetch Similar Products (dựa trên category)
      if (fetchedProduct.category) {
        const similarResponse = await apiRequest.get(`/v1/products/${id}/similar`, {
          params: { category: fetchedProduct.category },
        });
        setSimilarProducts(similarResponse.data);
      }
    } catch (err) {
      console.error('Fetch product detail failed:', err);
      setError('Không thể tải chi tiết sản phẩm.');
      setProduct(null);
      setSimilarProducts(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReviews = useCallback(async (id: string, page: number = 0, size: number = 5) => {
    try {
      const response = await apiRequest.get(`/v1/products/${id}/reviews`, {
        params: { page, size },
      });
      setReviews(response.data);
    } catch (err) {
      console.error('Fetch reviews failed:', err);
      // Không set error toàn cục, chỉ log lỗi
    }
  }, []);

  const addReview = useCallback(async (id: string, review: Omit<ProductReview, 'id' | 'reviewDate'>): Promise<ProductReview | null> => {
    try {
      const response = await apiRequest.post(`/v1/products/${id}/reviews`, review);
      // Sau khi thêm review thành công, fetch lại reviews và product detail để cập nhật rating/reviewCount
      fetchReviews(id, 0, 5);
      fetchProductDetail(id); 
      return response.data;
    } catch (err) {
      console.error('Add review failed:', err);
      return null;
    }
  }, [fetchReviews, fetchProductDetail]);

  return {
    product,
    similarProducts,
    reviews,
    loading,
    error,
    fetchProductDetail,
    fetchReviews,
    addReview,
  };
};