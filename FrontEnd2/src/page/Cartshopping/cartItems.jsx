import { HiPlusSm } from "react-icons/hi";
import { RiSubtractFill } from "react-icons/ri";
import { request1,request } from "../../utils/request";
import { PricetoString } from "../../Component/Translate_Price";
function CartItem({
  item,
  setCartgoods,
  access_token,
  selectedItems,
  setSelectedItems,
}) {
  const toggleSelectItem = () => {
    setSelectedItems((prev) => {
      if (prev.includes(item.id)) {
        return prev.filter((id) => id !== item.id); // Bỏ chọn
      } else {
        return [...prev, item.id]; // Chọn
      }
    });
  };

  const handleClickPlus = async () => {
    try {
      await request1.patch(
        `cart/update/${item.id}/`,
        { quantity: item.quantity + 1 },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setCartgoods((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } catch (error) {
      console.error("Lỗi khi tăng số lượng:", error);
    }
  };

  const handleClickSubtraction = async () => {
    if (item.quantity ===1){
      handleDelete(item);
      return;
    }
    try {
      await request1.patch(
        `cart/update/${item.id}/`,
        { quantity: item.quantity - 1 },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setCartgoods((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
        )
      );
    } catch (error) {
      console.error("Lỗi khi giảm số lượng:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await request1.delete(`cart/remove/${item.id}/`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        });
        setCartgoods((prev) => prev.filter((i) => i.id !== item.id));
      } catch (error) {
        console.error("Lỗi khi xóa sản phẩm:", error);
      }
    }
  };

  return (
    
    <div className="flex items-center bg-white shadow-sm rounded-md p-4 mb-4">
      <input
        type="checkbox"
        checked={selectedItems.includes(item.id)}
        onChange={toggleSelectItem}
        className="mr-4"
      />
      <div className="flex basis-[40%] lg:basis-[50%] px-1 lg:pl-5">
        <div className="flex items-center">
          <img
            src={`${request}${item.good.image}`}
            alt=""
            className=" w-[50px] h-[50px] lg:w-[150px] lg:h-[150px]"
          />
          <p className="font-semibold text-[8px] md:text-sm lg:text-base px-1">
            {item.good.goodName}
          </p>
        </div>
      </div>
      <div className="basis-[60%] flex items-center text-[8px] md:text-xs lg:text-base px-2 justify-around">
        {/* giá cả */}
        <p className="text-red-500 font-semibold">
          {
          
          PricetoString(item.good.price.split(".")[0])}
        </p>
        {/* số lượng sản phẩm */}
        <div className="font-bold">
          <p className="flex md:gap-x-1 items-center">
            Số lượng:
            <RiSubtractFill
              className="cursor-pointer mx-1 lg:mx-2 md:border-[2px]"
              onClick={() => handleClickSubtraction(item.id, item)}
            />
            {item.quantity}
            <HiPlusSm
              className="cursor-pointer mx-1 lg:mx-2 md:border-[2px]"
              onClick={() => handleClickPlus(item.id, item)}
            />
          </p>
        </div>
        {/* thao tác */}
        <span
          className="text-red-500 font-semibold cursor-pointer"
          onClick={() => handleDelete(item.id, item)}
        >
          Xóa
        </span>
      </div>
    </div>
  );
}

export default CartItem;
