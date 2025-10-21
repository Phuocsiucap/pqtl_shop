import axios from "axios";
import Cookies from "js-cookie";

// const API_BASE_URL = process.env.REACT_APP_API_URL
const API_BASE_URL = 'http://localhot:8080';
const DEBUG = process.env.REACT_APP_DEBUG === "true";  // nhớ dùng REACT_APP_DEBUG trong .env

console.log("🔍 API Base URL:", API_BASE_URL);
console.log("DEBUG:", DEBUG);

export const apiCall1 = async (method, endpoint, data = null, config = {}) => {
  try {
    const token = localStorage.getItem("token") || "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0b2x1ZW4zMDAwQGdtYWlsLmNvbSIsImlhdCI6MTc2MTA2MDk1MCwiZXhwIjoxNzYxMDYxODUwfQ.h4R_iOROjDs3mT5k0gDuoy6oU1-U_a22y8yGcspurbk";
;
    // console.log("csrftoken:", csrfToken);
    
    const response = await axios({
      method,
      url: `${API_BASE_URL}${endpoint}`,
      data,
      headers: {
        "Authorization" : `Bearer ${token}`,
        "Content-Type": "application/json",
        ...config.headers,
      },
      ...config,
    });

    return response;
  } catch (error) {
    console.error(`API error [${method.toUpperCase()} ${endpoint}]:`, error);
    throw error;
  }
};

export const apiCall2 = async (method, endpoint, data = null, config = {}) => {
  try {
    const response = await axios({
      method,
      url: `${API_BASE_URL}${endpoint}`,
      data,
      ...config,
    });
    console.log(response.data);
    return response;
  } catch (error) {
    console.error(
      `API error [${method.toUpperCase()} ${endpoint}]:`,
      error.response?.data || error.message
    );
    throw error;
  }
};




