import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.REACT_APP_API_URL;
const DEBUG = process.env.REACT_APP_DEBUG === "true";  // nhớ dùng REACT_APP_DEBUG trong .env

console.log("🔍 API Base URL:", API_BASE_URL);
console.log("DEBUG:", DEBUG);

export const apiCall1 = async (method, endpoint, data = null, config = {}) => {
  try {
    const token = Cookies.get("csrf_token_fe");
;
    // console.log("csrftoken:", csrfToken);
    
    const response = await axios({
      method,
      url: `${API_BASE_URL}${endpoint}`,
      data,
      withCredentials: true,
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
      withCredentials: true,
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




