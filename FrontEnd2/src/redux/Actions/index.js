import { request1 } from "../../utils/request";
import { Types } from "../Types"
import { getCSRFTokenFromCookie } from "../../Component/Token/getCSRFToken";
//user
const access_token=getCSRFTokenFromCookie("access_token");
const LoginUser=(data)=>{
    // console.log("data "+data);
    return{
        type: Types.User.Login,
        payload: data,
    }
}
const LogoutUser=()=>{
    return{
        type: Types.User.Logout,
    }
}
const UpdateUser=(data)=>{
    console.log("update ",data);
    return{
        type: Types.User.Update,
        payload: data
    }
}
//address
const AddAddress=(data)=>{
    return{
        type: Types.Address.AddAddress,
        payload: data
    }
}
const DeleteAddress=(data)=>{
    console.log(data);
    return{
        type: Types.Address.DeleteAddress,
        payload: data
    }
}
const UpdateAddress=(data)=>{
    return{
        type: Types.Address.UpdateAddress,
        payload: data
    }
}
//cartShopping
const AddProduct= async(data)=>{
    try {
        const response= await request1.post("cart/add/", {
          good_id: data.id,
          quantity: data.number,
        }, {
          headers: {
            Authorization: `Bearer ${access_token}`,  // Đảm bảo token đúng
            "Content-Type": "application/json",
          },
          withCredentials: true,  // Cho phép gửi cookie
        });
        
        console.log(response);
        alert("Thêm sản phẩm vào giỏ hàng thành công");
      } catch (e) {
        console.log("lỗi", e);
      }
    return{
        type : Types.ShoppingCart.AddProduct,
        payload:data
    }
}
const DeleteProduct=(data)=>{
    return{
        type: Types.ShoppingCart.DeleteProduct,
        payload:data,

    }
}
const UpdateProduct=(data)=>{
    return{
        type: Types.ShoppingCart.UpdateProduct,
        payload: data,
    }
}
const getCart=()=>async dispatch=>{
    try{
        const response=await request1.get("cart/",{
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,  
        });
        dispatch({
            type: Types.ShoppingCart.GetCart,
            payload: response.data.cart_goods,
          });
      }
      catch(error){
        console.log("Lỗi",error)
      }
      finally {
        dispatch({ type: Types.ShoppingCart.GetCart, payload: false });
      }
}

export {LoginUser,LogoutUser,UpdateUser,UpdateAddress,DeleteAddress,AddAddress,UpdateProduct,DeleteProduct,AddProduct,getCart}