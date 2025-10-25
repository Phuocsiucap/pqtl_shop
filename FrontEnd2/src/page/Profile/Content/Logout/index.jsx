import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LogoutUser } from "../../../../redux/Actions";
import { useEffect } from "react";
import Cookies from "js-cookie";
function Logout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(LogoutUser());
    localStorage.removeItem("user");
    Cookies.remove("access_token", { path: "" });
    Cookies.remove("refresh_token", { path: "" });
    Cookies.remove("user", { path: "" });

    // localStorage.removeItem("refresh_token");
    // localStorage.removeItem("CSRF_token");
    // deleteCookie('csrftoken');
    navigate("/");
  }, []);
}

export default Logout;
