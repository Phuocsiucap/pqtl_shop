// src/page/OAuth2RedirectHandler/index.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LoginUser } from "../../redux/Actions"; // <-- đi lên 2 cấp
import Cookies from "js-cookie";


export default function OAuth2RedirectHandler() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

useEffect(() => {
  const url = new URL(window.location.href);
  const token = url.searchParams.get("token");
  

  if (token) {
    localStorage.setItem("token", token);

    // gọi API lấy thông tin user
    fetch("http://localhost:8080/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((txt) => {
            const msg = txt || `HTTP ${res.status}`;
            throw new Error(msg);
          });
        }
        return res.json();
      })
      .then((user) => {
        const normalizedUser = user && user.data ? user.data : user;
        localStorage.setItem("user", JSON.stringify(normalizedUser));
        dispatch(LoginUser(normalizedUser));
        navigate("/");
      })
      .catch((err) => {
        console.error('OAuth2 me fetch failed:', err);
        alert("Đăng nhập thất bại!");
        localStorage.removeItem("token");
        navigate("/login");
      });
  } else {
    alert("Đăng nhập thất bại!");
    navigate("/login");
  }
}, [dispatch, navigate]);


  return <div>Đang đăng nhập bằng Google...</div>;
}
