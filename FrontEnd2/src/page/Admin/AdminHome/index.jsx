import BestSellerList from "../BestSeller";
import {getCSRFTokenFromCookie} from "../../../Component/Token/getCSRFToken.js";
function AdminHome() {
    const access_token = getCSRFTokenFromCookie("access_token_admin");
    // console.log("1",access_token)
    return (
        <div className="bg-gray-50 w-full">
            <BestSellerList />
        </div>
     );
}

export default AdminHome;