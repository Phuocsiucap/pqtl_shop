import { useState } from "react";
import { FiShoppingCart } from "react-icons/fi";

function VoucherModal({ setShowVoucher, voucher, onSelectVoucher, totalPrice }) {
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const handleSelectVoucher = (item) => {
    if (item.voucher.min_order_value <= totalPrice) {
      setSelectedVoucher(item); // Lưu voucher được chọn trong state của modal
      onSelectVoucher(item); // Truyền voucher được chọn về component cha
    } else {
      alert("Giá trị đơn hàng chưa đủ điều kiện để sử dụng voucher này!");
    }
  };

  return (
    <div
      className="fixed inset-0 z-10 bg-gray-800 bg-opacity-50 flex justify-center items-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-[500px] md:w-[700px] h-auto bg-white rounded-xl py-5 shadow-lg">
        <div className="text-center">
          <p className="pt-5 font-semibold text-xl text-gray-800">Voucher của bạn</p>
          {voucher && voucher.length > 0 ? (
            <ul className="space-y-4 my-5 mx-5">
              {voucher.map((item) => (
                <li
                  key={item.id}
                  className={`border rounded-lg p-4 flex items-center justify-between cursor-pointer shadow-md transition-all duration-200 ease-in-out ${
                    selectedVoucher?.id === item.id
                      ? "bg-blue-100 border-blue-500 shadow-lg scale-105"
                      : "hover:bg-gray-50 hover:shadow-lg"
                  }`}
                  onClick={() => handleSelectVoucher(item)}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-[80px] h-[80px] bg-blue-200 flex justify-center items-center rounded-md">
                      <FiShoppingCart className="text-3xl text-blue-500" />
                    </div>
                    <div>
                      <div className="flex flex-col space-y-4">
                        <p className="font-semibold text-lg text-gray-800">{item.voucher.title}</p>
                        <p className="font-semibold text-gray-800">
                          {item.voucher.min_order_value.toLocaleString()} VND
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                    </div>
                  </div>

                  <button
                    className={`px-4 py-2 rounded-md font-semibold ${
                      selectedVoucher?.id === item.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600 hover:bg-blue-500 hover:text-white"
                    }`}
                    // disabled={item.voucher.min_order_value > totalPrice} // Disable if totalPrice is less than min_order_value
                  >
                    {selectedVoucher?.id === item.id ? "Đã chọn" : "Chọn"}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-600 my-5">Bạn chưa có voucher nào</div>
          )}
        </div>
        <div className="flex justify-end mx-5">
          <button
            onClick={() => setShowVoucher(false)}
            className="px-5 py-2 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600 transition duration-200"
          >
            Hoàn thành
          </button>
        </div>
      </div>
    </div>
  );
}

export default VoucherModal;
