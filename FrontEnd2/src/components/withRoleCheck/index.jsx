import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { request1 } from "../../utils/request";
import AccessDenied from "../AccessDenied";

/**
 * HOC kiểm tra quyền truy cập
 * @param {Component} WrappedComponent - Component cần wrap
 * @param {Array} allowedRoles - Mảng các role được phép truy cập, ví dụ: ["ADMIN"] hoặc ["ADMIN", "STAFF"]
 */
const withRoleCheck = (WrappedComponent, allowedRoles = ["ADMIN"]) => {
  return function WithRoleCheckComponent(props) {
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkUserRole = async () => {
        try {
          const token = Cookies.get("access_token_admin");

          if (!token) {
            setUserRole(null);
            setLoading(false);
            return;
          }

          // Gọi API để lấy thông tin user hiện tại
          const response = await request1.get("auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.data && response.data.role) {
            setUserRole(response.data.role);
          }
        } catch (error) {
          console.error("Lỗi khi kiểm tra quyền:", error);
          setUserRole(null);
        } finally {
          setLoading(false);
        }
      };

      checkUserRole();
    }, []);

    if (loading) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    // Kiểm tra xem userRole có nằm trong allowedRoles không
    if (!userRole || !allowedRoles.includes(userRole)) {
      return <AccessDenied requiredRole={allowedRoles.join(" hoặc ")} />;
    }

    return <WrappedComponent {...props} userRole={userRole} />;
  };
};

export default withRoleCheck;
