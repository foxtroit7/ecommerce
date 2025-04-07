const generateOtp = (phone_number) => {
  if (phone_number === "9999999999") {
    return "999999"; // fixed OTP for testing
  }
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
  };
  
  module.exports = generateOtp;
  