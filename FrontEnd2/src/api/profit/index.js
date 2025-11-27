import { request1 } from "../../utils/request";
import { getCSRFTokenFromCookie } from "../../Component/Token/getCSRFToken";

// Get profit statistics by period
export const getProfitStats = async (period = "month", startDate = null, endDate = null) => {
  const access_token = getCSRFTokenFromCookie("access_token_admin");
  
  let url = `v1/admin/profit/?period=${period}`;
  if (startDate && endDate) {
    url += `&startDate=${startDate}T00:00:00&endDate=${endDate}T23:59:59`;
  }
  
  const response = await request1.get(url, {
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
  
  return response.data;
};

// Get top products by profit
export const getTopProfitProducts = async (limit = 10, sort = "highest") => {
  const access_token = getCSRFTokenFromCookie("access_token_admin");
  
  const response = await request1.get(`v1/admin/profit/top-products/?limit=${limit}&sort=${sort}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
  
  return response.data;
};

// Get monthly profit statistics
export const getMonthlyProfitStats = async (year = new Date().getFullYear()) => {
  const access_token = getCSRFTokenFromCookie("access_token_admin");
  
  const response = await request1.get(`v1/admin/profit/monthly/?year=${year}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
  
  return response.data;
};
