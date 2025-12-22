// pqtl_shop/FrontEnd2/src/types/product.ts

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  price: number;
  discount: number;
  stockQuantity: number;
  soldQuantity: number;
  isBestSeller: boolean;
  isSeasonal: boolean;
  rating: number | null;
  reviewCount: number;
  finalPrice: number;
  subCategory?: string;
  origin?: string;
  certifications?: string[];
}

export interface ProductReview {
  id: string;
  productId: string;
  productName?: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  reviewDate: string; // ISO date string
  // Phản hồi từ admin
  adminReply?: string;
  adminReplyBy?: string;
  adminReplyDate?: string;
  // Trạng thái
  isApproved?: boolean;
  isVisible?: boolean;
}

export interface SearchHistory {
  id: string;
  userId: string;
  keyword: string;
  searchDate: string; // ISO date string
}

export interface  SearchParams {
  keyword?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  sortBy?:
    | 'price_asc'
    | 'price_desc'
    | 'price_low_to_high'
    | 'price_high_to_low'
    | 'rating_desc'
    | 'rating'
    | 'sold_desc'
    | 'popular'
    | 'newest';
  page?: number;
  size?: number;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // current page number
  size: number;
  first: boolean;
  last: boolean;
}