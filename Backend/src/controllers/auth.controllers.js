const bcrypt = require('bcrypt'); 
const User = require('../Models/user.models');
const jwt = require('jsonwebtoken');
const BlackListToken = require("../Models/blacklist.models");
const sendMail = require("../services/mail.service");

// @route registerUser
async function registerUser(req, res) {

  const { username, email, password } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "Please provide all required fields"
    });
  }

  const isUserAlreadyExist = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (isUserAlreadyExist) {
    return res.status(400).json({
      message: "User already exists"
    });
  }

  const hash = await bcrypt.hash(password, 10);



  const user = await User.create({
    username,
    email,
    password: hash
  });

   // ✅ SEND MAIL (non-blocking safe)
  await sendMail("register", user);

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

 res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  path: "/"
});

  res.status(201).json({
    message: "User registered successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email
    }
  });
}

async function loginUser(req, res) {

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      message: "Please provide all required fields"
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      message: "Invalid credentials"
    });
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    return res.status(400).json({
      message: "Invalid credentials"
    });
  }

   // ✅ SEND LOGIN ALERT MAIL
  
  await sendMail("login", user);

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  path: "/"
});

  res.status(200).json({
    message: "User logged in successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email
    }
  });
}
// send otp
async function sendLoginOtp(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;

    await user.save();

    await sendMail("otp", {
      email: user.email,
      username: user.username,
      otp
    });

    return res.status(200).json({
      message: "OTP sent to email"
    });

  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
}

// login with otp
async function loginWithOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP required"
      });
    }

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({
        message: "Invalid or expired OTP"
      });
    }

    // ✅ clear OTP
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/"
    });

    return res.status(200).json({
      message: "Login successful (OTP)",
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error("OTP Login Error:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
}

// logout user
const logoutUser = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(400).json({ message: "No token provided" });
  }

  try {
    const blackListToken = new BlackListToken({ token });
    await blackListToken.save();

    res.clearCookie("token");

    return res.status(200).json({ 
      message: "User logged out successfully" 
    });

  } catch (error) {
    console.error("Logout Error:", error);

    return res.status(500).json({ 
      message: "Error logging out user", 
      error: error.message 
    });
  }
};

// @name getMeController
// @description Get the profile of the logged in user
// access Private
async function getMe(req,res){
  const user = await User.findById(req.user.id);

  if(!user){
    return res.status(404).json({message:"User not found"});
  }

  res.status(200).json({
    message: "User profile fetched successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email
    }
  });
}

module.exports = {
  registerUser,
  loginUser, logoutUser ,getMe, sendLoginOtp,
  loginWithOtp
};