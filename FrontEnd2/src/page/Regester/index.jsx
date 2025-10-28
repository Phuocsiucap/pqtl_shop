import {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom';
import { FaUser } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import {request, request1} from '../../utils/request';
import ListUsers from '../../api/users'
function Regester() {
    const [showpassword,setShowPassword]=useState(false);
    const [showconfirnpassword,setShowconfirnPassword]=useState(false);
    const [nameerror,setNameerror]=useState("");
    const [passworderror,setPassworderror]=useState("");
    const [confirnpassworderror,setconfirnPassworderror]=useState("");
    const [emailerror,setEmailerror]=useState("");
    const [user,setUser]=useState({
        email: "",
        name:"",
        password: "",
        confirmpassword:""
    })
    const navigate=useNavigate();
    //abc@gmail.com
    let checkemail=/\w+@[a-zA-Z]\w+\.com$/;
    let validate=true;
    const checkInput = (name,value) => {
        switch(name){
            case "name":
                if(value===""){
                    setNameerror("Tên đăng nhập không được để trống");
                    validate=false;
                }
                else if(value.length<5){
                    setNameerror("Tên đăng nhập phải có từ 5 kí tự trở lên");
                    validate=false;
                }
                else{
                    setNameerror("");
                }
            break;
            case "password":
                if(value===""){
                    setPassworderror("Mật khẩu không được để trống")
                    validate=false;
                }
                else if(value.length<8){
                    setPassworderror("Mật khẩu phải có ít nhất 8 kí tự")
                    validate=false;
                }
                else{
                    setPassworderror("")
                }
            break;
            case "confirmpassword":
                if(value===""){
                    setconfirnPassworderror("Xác nhận mật khẩu không được để trống")
                    validate=false;
                }
                else if(value!==user.password){
                    setconfirnPassworderror("Xác nhận mật khẩu phải giống mật khẩu")
                    validate=false;
                }
                else {
                    setconfirnPassworderror("")
                }
            break;
            case "email":
                if(value===""){
                    setEmailerror("Email không được để trống");
                    validate=false;
                }
                else if(!checkemail.test(value)){
                    setEmailerror("Email không đúng định dạng");
                    validate=false;
                }
                else{
                    setEmailerror("")
                }
            break;
            default:
                break;
        }
        return validate;
    };
    const handleOnchange=(e)=>{
        const {name, value}=e.target;
        setUser({
            ...user,
            [name]: value
        })
        checkInput(name,value);
    }
    
    const handleOnsumbit= async (e)=>{
        e.preventDefault();
        const validatename=checkInput('name',user.name)
        const validateemail=checkInput('email',user.email)
        const validatepassdword=checkInput('password',user.password)
        const validateconfirmpassword=checkInput('confirmpassword',user.confirmpassword)
        if(validatename && validateemail && validatepassdword && validateconfirmpassword){
            const newuser={
                fullName: user.name,
                email: user.email,
                password:user.password,
                userType: "Bạc",
                loyaltyPoints:0,
            }
            try{
                const response=await request1.post("user/register",newuser)
                alert("Đăng ký tài khoản thành công");
                navigate("/login");
            }
            catch(error){
                if(error.response.status==400){
                    alert("Email đã được đăng ký vui lòng đăng ký email khác")
                    return;
                }
                else{
                    alert("Có lỗi xảy ra");
                    return;
                }
            }
        }
    }
    return ( 
        // login page
        <div className="flex justify-center items-center font-Montserrat h-[95vh]">
            <form action="" className='w-full flex justify-center items-center'
            onSubmit={handleOnsumbit}
            >
                <div className="font-Montserrat w-[100%] md:w-[50%] xl:w-[30%] border-[0.5px] border-gray-200 rounded-md flex flex-col gap-y-1 items-center bg-white mx-2 shadow-sm shadow-green-100">
                    <Link to={'/'}>
                        <p className="font-bold text-primary  text-sm lg:text-3xl uppercase text-center mt-2">
                            phdtech
                        </p>
                    </Link>
                    <p className='font-bold text-2xl'>
                        Đăng ký
                    </p>
                    <div className="flex flex-col items-center py-1 w-full text-sm lg:text-base group relative">
                        <label htmlFor="name" className='text-left w-full px-6 font-semibold py-2'><p>Tên người dùng</p></label>
                        <input placeholder="Tên người dùng" id='name'
                        type="text"
                        className="input-form"
                        value={user.name} name='name'
                        onChange={(e)=>handleOnchange(e)}
                        // style={nameerror&&{border:'2px solid red'}}
                        />
                        <FaUser className='absolute right-8 top-[65px] lg:right-10 font-bold lg:text-xl group-focus:text-primary cursor-pointer'/>
                        {nameerror&& <p className='text-xs w-full px-6 text-left font-bold text-red-500 absolute bottom-[-10px]'>{nameerror}</p>}
                    </div>
                    <div className="flex flex-col py-1 w-full relative group items-center">
                    <label htmlFor="email" className='text-left w-full px-6 font-semibold py-2'>Email</label>
                    <input type="text" placeholder="Địa chỉ gmail" id='email'
                        className="input-form"
                        value={user.email} name='email'
                        onChange={(e)=>handleOnchange(e)}
                        />
                    <FaUser className='absolute right-8 top-[65px] lg:right-10 font-bold lg:text-xl group-focus:text-primary '/>
                    {emailerror&& <p className='text-xs w-full px-6 text-left font-bold text-red-500 absolute bottom-[-10px]'>{emailerror}</p>}
                    </div>
                    <div className="flex flex-col items-center py-1 w-full text-sm lg:text-base group relative">
                        <label htmlFor="password" className='text-left w-full px-6 font-semibold py-2'><p>Mật khẩu</p></label>
                        <input placeholder="Mật khẩu" id='password'
                        type={showpassword? "text": "password"}
                        className="input-form"
                        value={user.password} name='password'
                        onChange={(e)=>handleOnchange(e)}
                        />
                        <FaEye className='absolute right-8 top-[65px] lg:right-10 font-bold lg:text-xl group-focus:text-primary cursor-pointer' onClick={()=>setShowPassword(!showpassword)}/>
                        {passworderror&& <p className='text-xs w-full px-6 text-left font-bold text-red-500 absolute bottom-[-10px]'>{passworderror}</p>}

                    </div>
                    <div className="flex flex-col items-center py-1 w-full text-sm lg:text-base group relative">
                        <label htmlFor="confirmpassword" className='text-left w-full px-6 font-semibold py-2'><p>Xác nhận mật khẩu</p></label>
                        <input placeholder="Nhập lại mật khẩu" id='confirmpassword'
                        type={showconfirnpassword? "text": "password"}
                        className="input-form"
                        value={user.confirmpassword} name='confirmpassword'
                        onChange={(e)=>handleOnchange(e)}/>
                        <FaEye className='absolute right-8 top-[65px] lg:right-10 font-bold lg:text-xl group-focus:text-primary cursor-pointer' onClick={()=>setShowconfirnPassword(!showconfirnpassword)}/>
                        {confirnpassworderror&& <p className='text-xs w-full px-6 text-left font-bold text-red-500 absolute bottom-[-10px]'>{confirnpassworderror}</p>}
                    </div>
                    {/* button */}
                    <button className=" my-5 px-3 py-2 lg:px-5 lg:py-3 w-[90%] bg-primary hover:bg-primary/70 transition-all duration-500 ease-in-out rounded-md text-white font-semibold">Đăng ký</button>
                    <div className='font-bold text-xs lg:text-base mb-2 text-black py-2'>
                        <p>
                            Bạn đã có tài khoản? &ensp;
                            <Link 
                            to={"/login"}
                            className='text-primary hover:text-red-500'>Đăng nhập</Link>
                        </p>
                    </div>
                </div>
            </form>
        </div>
     );
}
export default Regester;