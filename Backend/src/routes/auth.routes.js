const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controllers');
const authUser = require('../middlewares/auth.middleware');
// @routes POST /api/auth/register
// @description Register a new user
router.post('/register', authController.registerUser);
// 
// @routes POST /api/auth/login
// @description Login a user with email and password
// @access Public 
router.post('/login', authController.loginUser);
router.post("/login-otp/send", authController.sendLoginOtp);
router.post("/login-otp/verify", authController.loginWithOtp);

// @routes get /api/auth/logout
// @description Logout a user by blacklisting the token
router.get('/logout', authController.logoutUser);


// @routes get /api/auth/get-me
// @description Get the profile of the logged in user

router.get('/get-me', authUser,authController.getMe);

module.exports = router;
