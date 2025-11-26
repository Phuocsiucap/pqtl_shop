import React, { useState, useEffect } from 'react';
import "./index.css";
// import LaptopImage from "../../assets/images/Product_1.png";
// import MouseImage from "../../assets/images/Product_1.png";
// import KeyboardImage from "../../assets/images/Product_1.png";

function SaleProducts() {
  // Placeholder for agricultural products
  const products = [];

  const [timeLeft, setTimeLeft] = useState([]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft(prevTime =>
        prevTime.map(time => (time > 0 ? time - 1 : 0))
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const formatTime = (seconds) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = seconds % 60;
    return { days, hours, minutes, secs };
  };

  const renderProduct = (product, time, key) => {
    const { days, hours, minutes, secs } = formatTime(time);
    const savingsAmount = product.oldPrice - product.newPrice;
    return (
      <div key={key} className="product-card">
        <div className="discount-tag">Giảm {product.discount}</div>
        <img className="product-image" src={product.ImageUrl} alt={product.name} />
        <h2 style={{ fontWeight: "bold" }}>{product.name}</h2>
        <div className="specs-row">
          {/* {product.ram && <div className="spec">RAM: {product.ram}</div>} */}
          {/* {product.storage && <div className="spec">SSD: {product.storage}</div>} */}
        </div>
        <div className="colors">
          <p>Các màu: {product.colors.join(", ")}</p>
        </div>
        <div className="price-range">
          <span className="old-price">{product.oldPrice.toLocaleString('vi-VN')}đ</span> -{" "}
          <span className="current-price">{product.newPrice.toLocaleString('vi-VN')}đ</span>
        </div>
        <p className="saving">Tiết kiệm: {savingsAmount.toLocaleString('vi-VN')}đ</p>
        <div className="countdown">
          <span>{days} ngày</span> : <span>{hours} giờ</span> : <span>{minutes} phút</span> : <span>{secs} giây</span>
        </div>
      </div>
    );
  };

  return (
    <div className='test'>
      <h1 style={{ fontSize: '1.7em', margin: '20px 0px 30px 0px', fontWeight: 'bold' }}>KHUYẾN MÃI MỖI TUẦN</h1>
      <div className="text-center py-10">
        <p>Hiện tại chưa có chương trình khuyến mãi.</p>
      </div>
    </div>
  );
}
export default SaleProducts;
