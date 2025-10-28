import HomeRevenueManagement from "./Homemanagment";
import RevenueCharts from "./RevenueCharts";
import {getCSRFTokenFromCookie} from "../../../Component/Token/getCSRFToken.js";
function AdminHome() {
    const access_token = getCSRFTokenFromCookie("access_token_admin");
    // console.log("1",access_token)
    return ( 
        <div className="bg-gray-50 w-full">
            <HomeRevenueManagement access_token={access_token}/>
            <RevenueCharts access_token={access_token}/>
        </div>
     );
}

export default AdminHome;