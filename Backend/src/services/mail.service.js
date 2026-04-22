const nodemailer = require("nodemailer");
const { google } = require("googleapis");
require("dotenv").config();
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const { loginTemplate, registerTemplate, otpTemplate } = require("../templates/emailTemplates");
const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(type, user) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken?.token,
      },
    });

    let subject = "";
    let html = "";

    if (type === "register") {
      subject = "🎉 Welcome to Resume Maker";
      html = registerTemplate(user);
    }

    if (type === "login") {
      subject = "🔐 Login Alert";
      html = loginTemplate(user);
    }

    if (type === "otp") {
      subject = "🔐 Your OTP Code";
      html = otpTemplate(user);
    }

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