import React from "react";
import ReportDashboard from "./ReportDashboard";
import {getCSRFTokenFromCookie} from "../../../Component/Token/getCSRFToken.js";

function AdminHome() {
    const access_token = getCSRFTokenFromCookie("access_token_admin");

    return (
        <div className="bg-gray-50 w-full min-h-screen">
            <ReportDashboard access_token={access_token}/>
        </div>
     );
}

export default AdminHome;