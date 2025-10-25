import React, { useState, useEffect } from 'react';
import "./index.css";
import LaptopImage from "../../assets/images/Product_1.png";
import MouseImage from "../../assets/images/Product_1.png";
import KeyboardImage from "../../assets/images/Product_1.png";

function SaleProducts() {
  const laptopProduct = {
    discount: "38%",
    storage: "512GB",
    ram: "16GB",
    name: "Surface Pro 11 – Snapdragon X Plus 16GB 512GB",
    ImageUrl: LaptopImage,
    oldPrice: 41990000,
    newPrice: 26190000,
    countdownTime: 7 * 24 * 60 * 60 + 5 * 60 * 60 + 30 * 60, // Thời gian tính bằng giây
    colors: ["Black", "Platinum"],
  };
  
  const mouseProduct = {
    discount: "20%",
    name: "Chuột Logitech M350S Pebble Chính Hãng",
    ImageUrl: MouseImage,
    oldPrice: 1599000,
    newPrice: 1279000,
    countdownTime: 7 * 24 * 60 * 60 + 5 * 60 * 60 + 30 * 60, // Thời gian tính bằng giây
    colors: ["Black", "White", "Blue"],
  };

  const keyboardProduct = {
    discount: "20%",
    name: "Bàn phím Alcantara Signature Surface GO",
    ImageUrl: KeyboardImage,
    oldPrice: 3490000,
    newPrice: 2792000,
    countdownTime: 7 * 24 * 60 * 60 + 5 * 60 * 60 + 30 * 60, // Thời gian tính bằng giây
    colors: ["Black", "White"],
  };

  const [timeLeft, setTimeLeft] = useState([
    laptopProduct.countdownTime,
    mouseProduct.countdownTime,
    keyboardProduct.countdownTime,
  ]);

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
          {product.ram && <div className="spec">RAM: {product.ram}</div>}
          {product.storage && <div className="spec">SSD: {product.storage}</div>}
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
      <h1 style={{ fontSize: '1.7em', margin: '20px 0px 30px 0px', fontWeight: 'bold' }}>DELL HOT MỖI TUẦN</h1>
      <h2 style={{ margin: '20px 0px 0px 0px', fontWeight: 'bold' }}>Laptop</h2>
      <hr style={{ paddingBottom: "20px" }} />
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <div className="product-grid">
          {[...Array(4)].map((_, index) => renderProduct(laptopProduct, timeLeft[0], `${laptopProduct.name}-${index}`))}
        </div>
      </div>
      <h2 style={{ fontWeight: 'bold' }}>Phụ Kiện Máy Tính</h2>
      <hr style={{ paddingBottom: "20px" }} />
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <div className="product-grid">
          {[...Array(4)].map((_, index) => renderProduct(mouseProduct, timeLeft[1], `${mouseProduct.name}-${index}`))}
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <div className="product-grid">
          {[...Array(4)].map((_, index) => renderProduct(keyboardProduct, timeLeft[2], `${keyboardProduct.name}-${index}`))}
        </div>
      </div>
    </div>
  );
}
export default SaleProducts;
