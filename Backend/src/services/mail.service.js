const nodemailer = require("nodemailer");
require("dotenv").config();

// ✅ Import your professional templates
const {
  loginTemplate,
  registerTemplate,
  otpTemplate
} = require("../templates/emailTemplates");

// ✅ Reusable transporter (optimized)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.APP_PASSWORD,
  },
});

async function sendMail(type, user) {
  try {
    let subject = "";
    let html = "";

    // 🎯 Select template
    switch (type) {
      case "register":
        subject = "🎉 Welcome to Resume Maker";
        html = registerTemplate(user);
        break;

      case "login":
        subject = "🔐 Login Alert";
        html = loginTemplate(user);
        break;

      case "otp":
        subject = "🔐 Your OTP Code";
        html = otpTemplate(user);
        break;

      default:
        throw new Error("Invalid email type");
    }

    // 📤 Send mail
    const result = await transporter.sendMail({
      from: `Resume Maker <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject,
      html,
    });

    console.log("✅ Mail sent:", result.response);

  } catch (error) {
    console.error("❌ MAIL ERROR:", error.message);
  }
}

module.exports = sendMail;