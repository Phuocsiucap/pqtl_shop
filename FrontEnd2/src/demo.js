function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split('.')[1])); // Giải mã Payload
    const expirationTime = payload.exp;
    const currentTime = Math.floor(Date.now() / 1000);
  
    return expirationTime < currentTime;
  }
  
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzMyMTA3NjM4LCJpYXQiOjE3MzIxMDA0MzgsImp0aSI6ImIwOWU3OWViMTFiYTRmYjNhODY5NTQyMDU5ODVjOGM5IiwidXNlcl9pZCI6MTF9.NOVJrX6CGb2MtCgWm4KrSc1mvTCIvgJ3ArJDXlghT0c";
  
  if (isTokenExpired(token)) {
    console.log("Token đã hết hạn.");
  } else {
    console.log("Token vẫn còn hiệu lực.");
  }