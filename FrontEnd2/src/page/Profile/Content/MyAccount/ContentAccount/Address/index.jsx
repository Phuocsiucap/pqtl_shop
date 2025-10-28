import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaPlus } from "react-icons/fa";
import { request1 } from "../../../../../../utils/request"; // Your axios helper function
import { getCSRFTokenFromCookie } from "../../../../../../Component/Token/getCSRFToken";
import { AddAddress, UpdateAddress, DeleteAddress } from "../../../../../../redux/Actions"; // Action imports

function Address() {
  const dispatch = useDispatch();
  const Addresslists = useSelector((state) => state.address);
  const [addresses, setAddresses] = useState([]);  // State to store addresses locally
  const [address, setAddress] = useState({
    phone: "",
    name: "",
    addressct: "",
    city: "",
    is_default: false,
  });
  const [message, setMessage] = useState(false);
  const [showAdd, setShowadd] = useState(false);
  const [showUpdate, setShowupdate] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const access_token = getCSRFTokenFromCookie("access_token");

  useEffect(() => {
    // Fetch all addresses when component mounts
    const fetchAddresses = async () => {
      try {
        const response = await request1.get("user/addresses/", {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("Fetched addresses:", response.data);
        
        // Gán trực tiếp vào local state
        setAddresses(response.data);
        
        // Đồng thời dispatch vào Redux store để chia sẻ với các component khác
        dispatch({ type: "SET_ADDRESSES", payload: response.data });
      } catch (error) {
        console.error("Error fetching addresses:", error);
        alert("Có lỗi khi tải địa chỉ");
      }
    };
    fetchAddresses();
  }, [access_token, dispatch]);

  // Handle form input change
  const handleOnchange = (e) => {
    const { name, value } = e.target;
    setAddress({
      ...address,
      [name]: value,
    });
  };

  // Check form validation
  const check = () => {
    if (address.name === "" || address.phone === "" || address.addressct === "" || address.city === "") {
      setMessage(true);
      return false;
    } else {
      setMessage(false);
      return true;
    }
  };

  // Add new address API call
  const handleOnclickHT = async () => {
    if (check()) {
      console.log(address);

      try {
        const response = await request1.post(
          "user/addresses/",
          address,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.status === 201) {
          alert("Thêm địa chỉ thành công");

          // Cập nhật Redux và local state
          dispatch(AddAddress(response.data));
          setAddresses([...addresses, response.data]);  // Update local state
          setShowadd(false);
          setAddress({
            name: "",
            phone: "",
            addressct: "",
            city: "",
            is_default: false,
          });
        } else {
          alert("Lỗi khi thêm địa chỉ.");
        }
      } catch (error) {
        console.error("Lỗi khi thêm địa chỉ:", error.response?.data || error);
        alert("Có lỗi khi thêm địa chỉ.");
      }
    }
  };

  // Update address API call
  const handleOnclickUpdate = (id) => {
    const addressToEdit = addresses.find((item) => item.id === id);

    if (addressToEdit) {
      console.log("Address found for update:", addressToEdit); // Debugging log
      setAddress({
        name: addressToEdit.name,
        phone: addressToEdit.phone,
        addressct: addressToEdit.addressct,
        city: addressToEdit.city,
        is_default: addressToEdit.is_default,
      });
      setCurrentEditId(id);
      setShowupdate(true);
    } else {
      console.error("Address not found with id:", id); // Debugging log
      alert("Không tìm thấy địa chỉ.");
    }
  };

  const handleOnclickCN = async () => {
    if (check()) {
      try {
        const response = await request1.put(
          `user/addresses/${currentEditId}/`,
          address,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.status === 200) {
          alert("Cập nhật địa chỉ thành công");

          // Cập nhật Redux và local state
          dispatch(UpdateAddress(response.data));
          const updatedAddresses = addresses.map((addr) =>
            addr.id === currentEditId ? response.data : addr
          );
          setAddresses(updatedAddresses); // Update local state
          setShowupdate(false);
          setAddress({
            name: "",
            phone: "",
            addressct: "",
            city: "",
            is_default: false,
          });
        } else {
          alert("Lỗi khi cập nhật địa chỉ.");
        }
      } catch (error) {
        console.error("Lỗi khi cập nhật địa chỉ:", error);
        alert("Có lỗi khi cập nhật địa chỉ.");
      }
    }
  };

  // Delete address API call
  const handleOnclickXoa = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này không ?")) {
      try {
        const response = await request1.delete(`user/addresses/${id}/`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.status === 204) {
          alert("Xóa địa chỉ thành công");

          // Cập nhật Redux và local state
          dispatch(DeleteAddress(id));
          setAddresses(addresses.filter((addr) => addr.id !== id));  // Update local state
        } else {
          alert("Lỗi khi xóa địa chỉ.");
        }
      } catch (error) {
        console.error("Lỗi khi xóa địa chỉ:", error);
        alert("Có lỗi khi xóa địa chỉ.");
      }
    }
  };

  return (
    <div className="font-Montserrat relative flex flex-col">
      <div className="font-bold text-xl flex justify-around py-6 border-y-2 border-b-gray-100">
        Địa chỉ của tôi
        <div
          className="font-semibold text-base px-9 py-2 rounded-md bg-primary hover:bg-primary/60 text-white text-center cursor-pointer transition-all duration-500 ease-in-out whitespace-nowrap relative"
          onClick={() => setShowadd(!showAdd)}
        >
          <button>
            <FaPlus className="absolute right-2 top-3" />
            Thêm địa chỉ mới
          </button>
        </div>
      </div>

      {/* Add and update address modals */}
      <div className={`fixed inset-0 z-10 bg-gray-800 bg-opacity-50 flex justify-center items-center transition-opacity duration-500 ease-in-out ${showAdd || showUpdate ? "opacity-100 block" : "opacity-0 hidden"}`}>
        <div className="bg-white p-6 rounded shadow-lg w-[600px]">
          <h2 className="text-lg font-semibold mb-4">{showUpdate ? "Cập nhật địa chỉ" : "Địa chỉ mới"}</h2>
          <form className="grid grid-cols-1 gap-y-3">
            <div className="flex justify-around gap-x-4">
              <input
                type="text"
                placeholder="Họ tên"
                value={address.name}
                name="name"
                onChange={handleOnchange}
                className={`border-2 border-gray-400 p-2 mb-4 w-[50%] focus:outline-primary ${message && !address.name ? "outline-red-500 border-red-500 placeholder:text-red-500" : "outline-primary border-primary"}`}
              />
              <input
                type="text"
                placeholder="Số điện thoại"
                value={address.phone}
                name="phone"
                onChange={handleOnchange}
                className={`border-2 border-gray-400 p-2 mb-4 w-[50%] focus:outline-primary ${message && !address.phone ? "outline-red-500 border-red-500 placeholder:text-red-500" : "outline-primary border-primary"}`}
              />
            </div>
            <input
              type="text"
              placeholder="Tỉnh thành phố"
              value={address.city}
              name="city"
              onChange={handleOnchange}
              className={`border-2 border-gray-400 p-2 mb-4 focus:outline-primary ${message && !address.city ? "outline-red-500 border-red-500 placeholder:text-red-500" : "outline-primary border-primary"}`}
            />
            <input
              type="text"
              placeholder="Địa chỉ nhận hàng"
              value={address.addressct}
              name="addressct"
              onChange={handleOnchange}
              className={`border-2 border-gray-400 p-2 mb-4 focus:outline-primary ${message && !address.addressct ? "outline-red-500 border-red-500 placeholder:text-red-500" : "outline-primary border-primary"}`}
            />
            <div>
              <input
                type="checkbox"
                checked={address.is_default}
                onChange={(e) => setAddress({ ...address, is_default: e.target.checked })}
                id="default"
              />
              <label htmlFor="default" className="font-xs font-semibold">Đặt làm địa chỉ mặc định</label>
            </div>
            <div className="flex justify-end gap-x-10 text-sm font-semibold">
              <button
                type="button"
                className="bg-primary text-white p-2 rounded"
                onClick={() => { setShowadd(false); setShowupdate(false); }}
              >
                Trở lại
              </button>
              <button
                type="button"
                onClick={showUpdate ? handleOnclickCN : handleOnclickHT}
                className="bg-red-500 text-white p-2 rounded ml-2"
              >
                {showUpdate ? "Cập nhật" : "Hoàn thành"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Displaying address list */}
      <div>
        <ul>
          {addresses.length === 0 ? (
            <div className="py-5">
              <p className="text-center text-xl font-semibold">Bạn chưa thiết lập địa chỉ giao hàng nào</p>
            </div>
          ) : (
            addresses.map((Addresslist) => (
              <li key={Addresslist.id} className="border-b-2 border-b-gray-100 pb-20 grid grid-cols-2 gap-x-44 transition-all duration-500 ease-in-out">
                <div>
                  <p className="font-semibold text-base py-3">{Addresslist.name} <span className="font-medium px-5">|| {Addresslist.phone} (Số điện thoại)</span></p>
                  <p>Địa chỉ: {Addresslist.addressct}</p>
                </div>
                <div className="flex justify-around gap-x-10 pt-10">
                  <button
                    className="px-3 w-[120px] rounded-md bg-blue-500 hover:bg-blue-700 text-white cursor-pointer transition-all duration-500 ease-in-out font-bold h-10"
                    onClick={() => handleOnclickUpdate(Addresslist.id)}
                  >
                    Cập nhật
                  </button>
                  <button
                    className="px-3 w-[120px] rounded-md bg-red-500 hover:bg-red-700 text-white cursor-pointer transition-all duration-500 ease-in-out font-bold h-10"
                    onClick={() => handleOnclickXoa(Addresslist.id)}
                  >
                    Xóa
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default Address;
