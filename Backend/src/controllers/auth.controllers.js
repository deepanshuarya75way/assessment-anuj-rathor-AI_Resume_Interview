const bcrypt = require('bcrypt'); 
const User = require('../Models/user.models');
const jwt = require('jsonwebtoken');
const BlackListToken = require("../Models/blacklist.models");
const sendMail = require("../services/mail.service");

const RefreshToken = require("../Models/refreshToken.model");
const {
  issueAuthTokrns,
  createAccessToken,
  createRefreshToken,
  hashToken,
  getCookieOptions,
  clearAuthCookies,
  REFRESH_TOKEN_MS,
  issueAuthToken
} = require("../utils/authToken");


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

   // Send email asynchronously in background (non-blocking)
  sendMail("register", user).catch((err) => console.error("Register mail error:", err.message));

  // const token = jwt.sign(
  //   { id: user._id, username: user.username },
  //   process.env.JWT_SECRET,
  //   { expiresIn: "1d" }
  // );

  // const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER === "true" || process.env.VERCEL;
  // res.cookie("token", token, {
  //   httpOnly: true,
  //   secure: isProduction,
  //   sameSite: isProduction ? "none" : "lax",
  //   path: "/",
  //   maxAge: 24 * 60 * 60 * 1000
  // });

  const {accessToken} = await issueAuthToken(user,res);

  return res.status(201).json({
    message: "User registered successfully",
    token: accessToken,
    accessToken,
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

   // Send login alert asynchronously in background (non-blocking)
  sendMail("login", user).catch((err) => console.error("Login alert mail error:", err.message));

  // const token = jwt.sign(
  //   { id: user._id, username: user.username },
  //   process.env.JWT_SECRET,
  //   { expiresIn: "1d" }
  // );

  // const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER === "true" || process.env.VERCEL;
  // res.cookie("token", token, {
  //   httpOnly: true,
  //   secure: isProduction,
  //   sameSite: isProduction ? "none" : "lax",
  //   path: "/",
  //   maxAge: 24 * 60 * 60 * 1000
  // });

  const {accessToken} = await issueAuthToken(user,res);

  return res.status(200).json({
    message: "User logged in successfully",
    token : accessToken,
    accessToken,
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

    // const token = jwt.sign(
    //   { id: user._id, username: user.username },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "1d" }
    // );

    // const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER === "true" || process.env.VERCEL;
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: isProduction,
    //   sameSite: isProduction ? "none" : "lax",
    //   path: "/",
    //   maxAge: 24 * 60 * 60 * 1000
    // });

    const {accessToken} = await issueAuthToken(user,res);

    return res.status(200).json({
      message: "Login successful (OTP)",
      token: accessToken,
      accessToken,
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

const logoutUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const accessToken = (authHeader && authHeader.startsWith("Bearer ")?authHeader.slice(7):null) || req.cookies?.token;
    const refreshToken = req.cookies?.refreshToken;
    if(accessToken) {
      try {
        await BlackListToken.updateOne(
          {token : accessToken},
          {$setOnInsert : {token: accessToken}},
          {upsert: true}
        );
      }catch(error) {
        console.error("Access token revocation error:",error);
      }
    }
    if(refreshToken) {
      await RefreshToken.updateOne(
        {tokenHash:hashToken(refreshToken),revokedAt:null},
        {$set: {revokedAt:new Date()}}
      );
    }
    clearAuthCookies(res);
    return res.status(200).json({
      message : "User logged out successfully"
    });
  } catch(error) {
    console.error("Logout error:",error);
    return res.status(500).json({
      message : "Error logging out user"
    })
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

async function refreshAccessToken(req,res) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if(!refreshToken) {
      clearAuthCookies(res);
      return res.status(401).json({
        message : "Refresh token missing. Please log in again."
      });
    }
    let decoded;
    try{
      decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
    } catch {
      clearAuthCookies(res);
      return res.status(401).json({
        message : "Refresh token expired or invalid. Please log in again"
      });
    }
    if(decoded.type != "refresh" || !decoded.id) {
      clearAuthCookies(res);
      return res.status(401).json({
        message : "Invalid refresh token."
      });
    }
    const oldHash = hashToken(refreshToken);
    const oldRecord = await RefreshToken.findOneAndUpdate(
      {
        userId : decoded.id,
        tokenHash : oldHash,
        revokedAt : null,
        expiresAt : {$gt:new Date()}
      },
      {
        $set : {revokedAt : new date()}
      },
      {new : false}
    );
    if(!oldRecord) {
      await RefreshToken.updateMany(
        {userId:decoded.id,revokedAt:null},
        {$set : {revokedAt : new Date()}}
      );
      clearAuthCookies(res);
      return res.status(401).json({
        message : "Refresh token is invalid or has already been used. Please log in again"
      });
    }
    const user = await User.findById(decoded.id);
    if(!user) {
      clearAuthCookies(res);
      return res.status(401).json({
        message : "User no longer exists"
      });
    }
      const accessToken = createAccessToken(user);
      const newRefreshToken = createRefreshToken(user);
      const newHash = hashToken(newRefreshToken);
      await RefreshToken.create({
        userId: user._id,
        tokenHash : newHash,
        expiresAt : new Date(Date.now() + REFRESH_TOKEN_MS)
      });
      await RefreshToken.updateOne(
        {_id : oldRecord._id},
        {$set:{replacesByTokenHash:newHash}}
      );
      const cookieOptions = getCookieOptions();
      res.cookie("token",accessToken,{
        ...cookieOptions,
        maxAge: 15*60*1000
      });
      res.cookie("refreshToken",newRefreshToken,{
        ...cookieOptions,
        maxAge: REFRESH_TOKEN_MS
      });
      return res.status(200).json({
        message : "Access token refreshed successfully",
        token: accessToken,
        accessToken
      });
  } catch(error) {
    console.error("Refresh token error: error");
    return res.status(500).json({
      message : "Unable to refresh token"
    });
  }
}

module.exports = {
  registerUser,
  loginUser, 
  logoutUser, 
  getMe,
  sendLoginOtp,
  loginWithOtp,
  refreshAccessToken
};