const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username :{
    type:String, 
    unique: [true, "Username already exists"],
    required: true
  },
  email: {
    type: String, 
    unique:[true,"Email already exists"],
    required: true
  },
  password: { 
    type: String,
    required: true 
  },
  role: {
  type: String,
  enum: ["admin", "recruiter", "candidate"],
  default: "candidate"
},
   // 🔥 OTP fields (for login only)
  otp: String,
  otpExpires: Date

}, { timestamps: true });

const userModel = mongoose.model('User', userSchema);
module.exports = userModel;