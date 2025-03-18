const User = require("../models/userModal");
const { generateOtp, } = require("../services/otpService");
const { generateToken } = require('../utils/generateToken');
const bcrypt = require("bcryptjs");

// ✅ SIGNUP API (Handles OTP Generation)
exports.signUp = async (req, res) => {
  const { name, email, phone_number, address } = req.body;

  if (!name || !email || !phone_number || !address) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    let user = await User.findOne({ phone_number });

    if (!user) {
      // If user does not exist, create a new one
      const otp = generateOtp(); // Generate OTP
      user = new User({
        name,
        email,
        phone_number,
        address,
        otp,
        is_verified: false,
        first_time_login: true,
        status: false, // Initially not logged in
      });

      await user.save();
      console.log(`Generated OTP for Signup: ${otp}`);

      return res.status(201).json({ message: "User registered successfully. OTP sent." });
    } else {
      return res.status(400).json({ error: "User already exists with this phone number" });
    }
  } catch (error) {
    console.error("Error in sign-up API:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ LOGIN API (Handles OTP Verification)
exports.login = async (req, res) => {
  const { phone_number, otp } = req.body;

  if (!phone_number || !otp) {
    return res.status(400).json({ error: "Phone number and OTP are required" });
  }

  try {
    const user = await User.findOne({ phone_number });

    if (!user) {
      return res.status(401).json({ error: "User not found. Please sign up first." });
    }

    if (user.otp !== otp) {
      return res.status(401).json({ error: "Invalid OTP" });
    }

    // OTP matched – Mark as verified and allow login
    user.is_verified = true;
    user.otp = null; // Clear OTP after successful verification
    user.status = true; // User is now logged in

    // If first-time login, mark it as completed
    if (user.first_time_login) {
      user.first_time_login = false;
    }

    await user.save();

    // Generate JWT Token
    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        is_verified: user.is_verified,
        first_time_login: user.first_time_login,
        address: user.address,
        status: user.status,
      },
    });

  } catch (error) {
    console.error("Error in login API:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ LOGOUT API (Marks User as Logged Out & Generates New OTP)
exports.logout = async (req, res) => {
  const { user_id } = req.body;

  try {
    const user = await User.findOne({ user_id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.status = false; // Mark user as logged out
    user.is_verified = false; // Require OTP verification for next login

    // Generate new OTP for next login
    const otp = generateOtp();
    user.otp = otp;
    await user.save();

    console.log(`New OTP after logout: ${otp}`); // Log OTP for testing
    res.status(200).json({ message: "Logout successful. OTP required for next login." });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// Get Logged-in Users
exports.getLoggedInUsers = async (req, res) => {
  try {
    const users = await User.find({ status: true }).select(
      "status name user_id email phone_number is_verified photo address activity_status"
    );
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching logged-in users:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get User by user_id
exports.getUserById = async (req, res) => {
  const { user_id } = req.params;
  try {
    const user = await User.findOne({ user_id }).select(
      "status name user_id email phone_number is_verified photo address activity_status"
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
  const { name, email, phone_number, address } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { user_id },
      { name, email, phone_number, address },
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