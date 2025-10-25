import { useEffect, useState } from "react";
import { request1,request } from "../../../../utils/request";
import { Link } from "react-router-dom";
import { PricetoString } from "../../../../Component/Translate_Price/index.jsx";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

function Ultrabook({good}) {
  const [ismore, setIsmore] = useState(true);
  const [numberproduct, setNumberproduct] = useState(5);
  const [productSlice, setProductsilce] = useState([]);
  // const [good, setGood] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(50);
  useEffect(() => {
    if (good && good.length > 0) {
      setProductsilce(good.slice(currentIndex, currentIndex + numberproduct));
    }
  }, [good, currentIndex, numberproduct]);

  const handleClickIsmore = () => {
    setNumberproduct(numberproduct + 5);
    if (productSlice.length >= 10) {
      setIsmore(false);
    }
  };

  const handleNext = () => {
    if (currentIndex + numberproduct < good.length) {
      setCurrentIndex(currentIndex + numberproduct);
    }
  };

  const handlePrev = () => {
    if (currentIndex - numberproduct >= 0) {
      setCurrentIndex(currentIndex - numberproduct);
    }
  };
  // console.log("good", good);
  return (
    <div className="mx-3 my-3 lg:mx-16 xl:mx-32 relative border-solid">
      <h1 className="uppercase font-bold font-Montserrat text-md lg:text-xl cursor-pointer hover:text-primary">
        Phụ kiện nổi bật
      </h1>
      <div className="relative">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 my-5 relative gap-y-10">
          {productSlice &&
            productSlice.length > 0 &&
            productSlice.map((Product, index) => {
              return (
                <Link to={`/product/${Product.id}`} key={index}>
                  <div
                    className={`group block border-2 border-gray-100 rounded-xl cursor-pointer relative font-Montserrat ${
                      Product.amount === 0 ? "opacity-50" : ""
                    }`}
                  >
                    {/* Hết hàng */}
                    {Product.amount === 0 && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-xl shadow-lg flex justify-center items-center">
                        Hết hàng
                      </div>
                    )}
                    {/* Image */}
                    <div className="max-w- overflow-hidden">
                      <img
                        src={`${request}${Product.image}`}
                        className="max-w-full hover:scale-110 transition-all ease-in-out duration-500 block"
                      />
                    </div>
                    {/* Sale */}
                    <div className="absolute px-3 py-1 bg-primary rounded-xl text-xs font-semibold text-white top-5">
                      <p>Giảm giá sốc</p>
                    </div>
                    {/* Information */}
                    <div className="flex justify-around uppercase font-Montserrat font-bold my-3 text-xs">
                      <p className="px-3 py-2 bg-gray-200 rounded-lg">
                        Mua ngay
                      </p>
                    </div>
                    {/* Product Name */}
                    <div className="top-menu-item font-Montserrat font-bold text-center text-sm lg:text-md">
                      <p>{Product.goodName.slice(0, 25)}</p>
                    </div>
                    <div className="font-Montserrat font-bold px-3 py-2 text-xs md:text-base">
                      <div className="flex justify-around items-center">
                        <p>
                          Chỉ từ:{" "}
                          <span className="text-red-500">
                            {PricetoString(
                              parseInt(Product.price.split(".")[0])
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>

        {/* Navigation Buttons (Prev & Next) */}
        <div className="absolute inset-y-0 left-0 flex items-center justify-center w-10">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="text-2xl text-primary disabled:text-gray-400 hover:text-gray-600"
          >
            <FiChevronLeft />
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center justify-center w-10">
          {
            good&&good.length>0&&
            <button
              onClick={handleNext}
              disabled={currentIndex + numberproduct >= good.length}
              className="text-2xl text-primary disabled:text-gray-400 hover:text-gray-600"
            >
              <FiChevronRight />
            </button>
          }
        </div>
      </div>

      {/* More Products Button */}
      {ismore && (
        <div className="font-bold font-Montserrat text-base text-center text-gray-500">
          <button
            className="py-3 px-4 border-2 border-gray-400 
                        border-solid rounded-lg hover:bg-primary hover:text-white transition-all ease-in-out duration-700 
                        hover:border-primary"
            onClick={handleClickIsmore}
          >
            More products
          </button>
        </div>
      )}
    </div>
  );
}

export default Ultrabook;
