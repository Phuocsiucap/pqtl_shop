import { useState } from "react";
import { Link } from "react-router-dom";
function AddressOD({
  setShowAddress,
  handleSelectAddress,
  address,
  selectAddress,
}) {
  return (
    <div
    className="fixed inset-0 z-10 bg-gray-800 bg-opacity-50 flex justify-center items-center"
    role="dialog"
    aria-modal="true"
  >
    <div className="w-[500px] md:w-[700px] h-auto bg-white rounded-xl py-5">
      <div className="text-center">
        <p className="pt-5 font-semibold text-xl text-left px-3">
          Địa chỉ của bạn
        </p>
        {address.length > 0 ? (
          <ul className="my-5 mx-5 space-y-4">
            {address.map((item) => (
              <li
                key={item.id}
                onClick={() => handleSelectAddress(item)} // Khi click vào, set địa chỉ được chọn
                className={`border rounded-lg p-4 flex justify-between items-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 ease-in-out ${
                  selectAddress?.id === item.id ? "bg-blue-100 border-blue-500" : "bg-gray-50"
                }`}
              >
                <div className="text-left">
                  <p className="font-semibold text-lg text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    {item.phone} - {item.city}
                  </p>
                  <p className="text-sm text-gray-500">{item.addressct}</p>
                </div>
                <button
                  onClick={() => handleSelectAddress(item)}
                  className="px-5 py-2 text-white bg-primary rounded-lg hover:bg-blue-600 transition duration-200"
                >
                  Chọn
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div>
            <p>
              Bạn chưa thiết lập địa chỉ nào, vui lòng{" "}
              <span>
                <Link to={"/profile"}>thiết lập địa chỉ</Link>
              </span>
            </p>
          </div>
        )}
      </div>
      <div className="flex justify-end mx-5">
        <button
          onClick={() => setShowAddress(false)}
          className="button-primary px-5 py-2 bg-primary"
        >
          Hoàn thành
        </button>
      </div>
    </div>
  </div>
  );
}

export default AddressOD;
