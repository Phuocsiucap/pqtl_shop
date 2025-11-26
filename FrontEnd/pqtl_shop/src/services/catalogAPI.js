import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8080/api/v1";

/**
 * Helper to build full API path
 */
const withBaseUrl = (path) => `${API_BASE_URL}${path}`;

export const fetchCategories = async () => {
  const response = await axios.get(withBaseUrl("/categories/"));
  return response.data || [];
};

export const fetchProductsByCategory = async (
  categoryName,
  params = { size: 200 }
) => {
  const response = await axios.get(withBaseUrl("/search"), {
    params: {
      category: categoryName,
      size: params.size ?? 200,
      page: params.page ?? 0,
      sortBy: params.sortBy,
    },
  });
  return response.data;
};

export const fetchProductsByKeyword = async (keyword, params = {}) => {
  const response = await axios.get(withBaseUrl("/search"), {
    params: {
      keyword,
      ...params,
    },
  });
  return response.data;
};

