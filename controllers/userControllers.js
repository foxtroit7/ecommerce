const User = require("../models/userModal");
const { generateOtp, } = require("../services/otpService");
const { generateToken } = require('../utils/generateToken');


exports.signUp = async (req, res) => {
  const { name, email, phone_number, address } = req.body;

  // Check for missing fields
  if (!name || !email || !phone_number || !address) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ phone_number });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this phone number" });
    }
   const otp='1111'
    // Create and save the new user
    const user = new User({ name, email, phone_number, address, otp });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error in sign-up API:", error);
    res.status(500).json({ error: "Server error" });
  }
};


// Login API
exports.login = async (req, res) => {
  const { phone_number} = req.body;

  if (!phone_number) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  try {
    // Use phone_number for the query
    const user = await User.findOne({ phone_number });


    // Check if the user is verified
    if (!user.is_verified) {
      return res.status(401).json({ error: "User is not verified" });
    }
const user_photo = await User.findOne({ user_id: user.user_id });
        const profilePhoto = user_photo ? user.photo : null; 
    // Generate JWT token
          const token = generateToken(user._id);
// Update status to true (logged in)
user.status = true;
await user.save();
    res.status(200).json({ message: "Login successful", token, 
      status: user.status, 
      name: user.name, 
      user_id: user.user_id , 
      email: user.user.email,
      phone_number: user.phone_number,
      is_verfied: user.is_verified,
      photo: profilePhoto, 
      address: user.address, 
      activity_status: user.activity_status
    });
  } catch (error) {
    console.error("Error in login API:", error);
    res.status(500).json({ error: "Server error" });
  }
};


// Verify OTP API
exports.verifyOtp = async (req, res) => {
  const { phone_number, otp } = req.body;
console.log(req.body);
  if (!phone_number || !otp) {
    return res.status(400).json({ error: "Phone and OTP are required" });
  }

  try {
    const user = await User.findOne({ phone_number });
    if (!otp) {
      return res.status(401).json({ error: "Invalid OTP" });
    }

    user.is_verified = true;
    user.otp = null; // Clear OTP after verification
    await user.save();

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Generate OTP API (Optional Helper)
exports.generateOtpForUser = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = generateOtp();
    user.otp = otp;
    await user.save();

    console.log(`Generated OTP: ${otp}`); // Log OTP for testing
    res.json({ message: "OTP generated and sent" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
// **Logout Controller**
exports.logout = async (req, res) => {
  const { user_id } = req.body;

  try {
      const user = await User.findOne({user_id});

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Update status to false (logged out)
      user.status = false;
      await user.save();

      res.status(200).json({ message: 'Logout successful', status: user.status });
  } catch (error) {
      console.error('Error during logout:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
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