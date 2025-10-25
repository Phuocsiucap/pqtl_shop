import axios from "axios";
import { data } from "react-router-dom";

const API_URL = "http://localhost:8080/api/auth"; // đổi theo backend của bạn

export const register = async (data) => {
  const response = await axios.post(`${API_URL}/register`, data);
  return response.data;
};

export const login = async (data) => {
  const response = await axios.post(`${API_URL}/login`, data);
  return response.data;
};

const API_URL1 = "http://localhost:8080/api"; // bỏ /auth

export const getUserInfo = async () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const res = await axios.get(`${API_URL1}/user/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { ...res.data, isLoggedIn: true };
  } catch (err) {
    console.error(err);
    return null;
  }
};


