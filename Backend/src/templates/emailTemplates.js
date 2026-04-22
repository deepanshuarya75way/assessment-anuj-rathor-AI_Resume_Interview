function loginTemplate(user) {
  return `
  <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:40px;">
    <div style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.1);">
      
      <div style="background: linear-gradient(135deg, #e1034d, #ff4d6d); padding:20px; text-align:center; color:white;">
        <h1 style="margin:0;">Resume Maker</h1>
        <p style="margin:5px 0 0;">Security Alert</p>
      </div>

      <div style="padding:30px; color:#333;">
        <h2>Hello ${user.username} 👋</h2>

        <p>A new login was detected on your account.</p>

        <div style="background:#f9fafb; padding:15px; border-radius:8px; margin:20px 0;">
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <p>If this was you, no action is required.</p>

        <div style="text-align:center; margin-top:20px;">
          <a href="https://resume-maker-c6ko.vercel.app"
            style="background:#e1034d; color:white; padding:12px 20px; border-radius:6px; text-decoration:none;">
            Go to Dashboard
          </a>
        </div>
      </div>

      <div style="background:#f1f5f9; padding:15px; text-align:center; font-size:12px;">
        <p>© ${new Date().getFullYear()} Resume Maker</p>
      </div>

    </div>
  </div>
  `;
}

function registerTemplate(user) {
  return `
  <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:40px;">
    <div style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden;">
      
      <div style="background: linear-gradient(135deg, #4f46e5, #6366f1); padding:20px; text-align:center; color:white;">
        <h1>Welcome 🎉</h1>
      </div>

      <div style="padding:30px; color:#333;">
        <h2>Hello ${user.username} 👋</h2>

        <p>Your account has been successfully created.</p>

        <div style="margin:20px 0; text-align:center;">
          <a href="https://resume-maker-c6ko.vercel.app"
            style="background:#4f46e5; color:white; padding:12px 20px; border-radius:6px; text-decoration:none;">
            Start Building Resume
          </a>
        </div>

        <p style="font-size:14px; color:#666;">
          We're excited to have you onboard 🚀
        </p>
      </div>

      <div style="background:#f1f5f9; padding:15px; text-align:center; font-size:12px;">
        <p>© ${new Date().getFullYear()} Resume Maker</p>
      </div>

    </div>
  </div>
  `;
}

function otpTemplate(data) {
  return `
    <div style="font-family:Arial;padding:20px;">
      <h2>Hello ${data.username} 👋</h2>
      <p>Your login OTP is:</p>
      <h1 style="color:#e1034d;letter-spacing:5px;">
        ${data.otp}
      </h1>
      <p>This OTP is valid for 5 minutes.</p>
    </div>
  `;
}

module.exports = {
  loginTemplate,
  registerTemplate,
  otpTemplate
};