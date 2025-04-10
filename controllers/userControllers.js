const User = require("../models/userModal");
const  generateOtp = require("../services/generateOtp");
const { generateToken } = require("../utils/generateToken"); 
const axios = require("axios");

// ✅ Function to send OTP via MSG91
const sendOtp = async (phone_number, otp) => {
  if (phone_number === "919999999999") {
    console.log(`Test OTP for ${phone_number} is ${otp}`);
    return;
  }
  const apiKey = "443215AFsHLWhDFo67d11830P1";
  const sender = "DIGHAK"; // Example: "TXTLCL"
  const templateId = "67d1171cd6fc05772778bde3"; // Get from MSG91
  
  const url = `https://control.msg91.com/api/v5/otp?authkey=${apiKey}&mobile=${phone_number}&otp=${otp}&sender=${sender}&template_id=${templateId}`;

  try {
    await axios.get(url);
  } catch (error) {
    console.error("Error sending OTP:", error);
  }
};

// ✅ Function to verify OTP via MSG91
const verifyOtp = async (phone_number, otp) => {
  if (phone_number === "919999999999" && otp === "999999") {
    return { type: "success" }; // simulate success
  }
  const apiKey = "443215AFsHLWhDFo67d11830P1";
  const url = `https://control.msg91.com/api/v5/otp/verify?authkey=${apiKey}&mobile=${phone_number}&otp=${otp}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return null;
  }
};

exports.signUp = async (req, res) => {
  const { name, phone_number, address } = req.body;

  if (!name || !phone_number || !address) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // ✅ Add '91' prefix if it's not already present
  const formattedNumber = phone_number.startsWith('91') 
    ? phone_number 
    : `91${phone_number}`;

  try {
    let user = await User.findOne({ phone_number: formattedNumber });

    if (user) {
      return res.status(400).json({ error: "User already registered. Please log in." });
    }

    // ✅ Create new user with formatted phone number
    user = new User({
      name,
      phone_number: formattedNumber,
      address,
      is_verified: false,
      first_time_login: true,
      status: false,
    });
    await user.save();

    // ✅ Generate and send OTP with formatted number
    const otp = generateOtp(formattedNumber);
    user.otp = otp;
    await user.save();
    await sendOtp(formattedNumber, otp);

    return res.status(201).json({ message: "OTP sent for verification." });

  } catch (error) {
    console.error("Error in sign-up API:", error);
    res.status(500).json({ error: "Server error" });
  }
};


// ✅ VERIFY OTP API (Checks OTP for Verification)
exports.verifyOtp = async (req, res) => {
  const { phone_number, otp } = req.body;

  if (!phone_number || !otp) {
    return res.status(400).json({ error: "Phone number and OTP are required" });
  }

  try {
    const user = await User.findOne({ phone_number });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ Verify OTP using MSG91
    const otpVerification = await verifyOtp(phone_number, otp);
    if (!otpVerification || otpVerification.type !== "success") {
      return res.status(401).json({ error: "Invalid OTP" });
    }

    // ✅ Mark user as verified and logged in
    user.is_verified = true;
    user.status = true;
    await user.save();  

    // ✅ Generate token
    const token = generateToken(phone_number);
    
    return res.status(200).json({ message: "OTP verified successfully.", token, user });

  } catch (error) {
    console.error("Error in OTP verification API:", error);
    res.status(500).json({ error: "Server error" });
  }
};


exports.sendOtpApi = async (req, res) => {
  const { phone_number } = req.body;

  if (!phone_number) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  try {
    const user = await User.findOne({ phone_number });

    if (!user) {
      return res.status(404).json({ error: "User not found. Please sign up first." });
    }

    // ✅ Generate OTP and send it
    const otp = generateOtp(phone_number);
    user.otp = otp;
    await user.save();
    await sendOtp(phone_number, otp);

    return res.status(200).json({ message: "OTP sent successfully." });

  } catch (error) {
    console.error("Error in login API:", error);
    res.status(500).json({ error: "Server error" });
  }
};



// ✅ LOGOUT API (Marks User as Logged Out & Generates New OTP for Next Login)
exports.logout = async (req, res) => {
  const { phone_number } = req.body;

  try {
    const user = await User.findOne({ phone_number });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.status = false; // Mark user as logged out
    user.is_verified = false; // Require OTP for next login
    await user.save();

    res.status(200).json({ message: "Logout successful. Next time, OTP will be required." });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};





// Get Logged-in Users
exports.getLoggedInUsers = async (req, res) => {
  try {
    const users = await User.find().select(
      "status name user_id  phone_number is_verified photo address activity_status"
    );
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching logged-in users:", error);
    res.status(500).json({ error: "Server error" });
  }
};
// Get Logged-in Users with Optional Search by Name
exports.getLoggedInUsers = async (req, res) => {
  try {
    const { name } = req.query; // Get search query from request

    let filter = {}; // Default filter (empty = fetch all users)

    // If a name is provided, apply case-insensitive search
    if (name) {
      filter.name = { $regex: new RegExp(name, "i") }; 
    }

    const users = await User.find(filter).select(
      "status name user_id phone_number is_verified photo address activity_status"
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Server error" });
  }
};


// Get User by user_id
exports.getUserById = async (req, res) => {
  const { user_id } = req.params;
  try {
    const user = await User.findOne({ user_id }).select(
      "status name user_id  phone_number is_verified photo address activity_status"
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update User by user_id
exports.updateUserById = async (req, res) => {
  const { user_id } = req.params;
  const { name, phone_number, address } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { user_id },
      { name, phone_number, address },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete User by user_id
exports.deleteUserById = async (req, res) => {
  const { user_id } = req.params;
  try {
    const user = await User.findOneAndDelete({ user_id });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Server error" });
  }
};