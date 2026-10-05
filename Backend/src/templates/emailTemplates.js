function otpTemplate(data) {
  return `
  <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:40px;">
    <div style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.1);">
      
      <div style="background: linear-gradient(135deg, #e1034d, #ff4d6d); padding:25px; text-align:center; color:white;">
        <h2 style="margin:0;">🔐 Secure Login</h2>
        <p style="margin:5px 0 0;">Resume Maker Verification</p>
      </div>

      <div style="padding:35px; text-align:center;">
        <h3>Hello ${data.username} 👋</h3>
        <p>Your OTP code is:</p>

        <div style="
          font-size:32px;
          font-weight:bold;
          letter-spacing:8px;
          margin:20px 0;
          color:#e1034d;
        ">
          ${data.otp}
        </div>

        <p style="color:#666;">Valid for 5 minutes</p>

        <div style="margin-top:25px;">
          <a href="https://resume-maker-c6ko.vercel.app"
            style="background:#e1034d; color:white; padding:12px 25px; border-radius:6px; text-decoration:none;">
            Open App
          </a>
        </div>
      </div>

      <div style="background:#f1f5f9; padding:15px; text-align:center; font-size:12px;">
        <p>If you didn’t request this, ignore this email.</p>
      </div>

    </div>
  </div>
  `;
}

function registerTemplate(user) {
  return `
  <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:40px;">
    <div style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.1);">
      
      <div style="background: linear-gradient(135deg, #4f46e5, #6366f1); padding:30px; text-align:center; color:white;">
        <h1 style="margin:0;">Welcome 🎉</h1>
        <p style="margin:5px 0 0;">Resume Maker</p>
      </div>

      <div style="padding:30px; color:#333;">
        <h2>Hello ${user.username} 👋</h2>

        <p>
          Your account has been successfully created.  
          You're now ready to build powerful resumes and crack interviews.
        </p>

        <div style="margin:30px 0; text-align:center;">
          <a href="https://resume-maker-c6ko.vercel.app"
            style="background:#4f46e5; color:white; padding:14px 24px; border-radius:6px; text-decoration:none; font-weight:bold;">
            🚀 Start Building
          </a>
        </div>

        <p style="font-size:14px; color:#666;">
          Let’s get you hired faster ⚡
        </p>
      </div>

      <div style="background:#f1f5f9; padding:15px; text-align:center; font-size:12px;">
        <p>© ${new Date().getFullYear()} Resume Maker</p>
      </div>

    </div>
  </div>
  `;
}

function loginTemplate(user) {
  return `
  <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:40px;">
    <div style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.1);">
      
      <div style="background: linear-gradient(135deg, #e1034d, #ff4d6d); padding:25px; text-align:center; color:white;">
        <h1 style="margin:0;">Security Alert 🚨</h1>
      </div>

      <div style="padding:30px; color:#333;">
        <h2>Hello ${user.username} 👋</h2>

        <p>A login was detected on your account.</p>

        <div style="background:#f9fafb; padding:15px; border-radius:8px; margin:20px 0;">
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <p>If this wasn’t you, please secure your account immediately.</p>

        <div style="text-align:center; margin-top:25px;">
          <a href="https://resume-maker-c6ko.vercel.app"
            style="background:#e1034d; color:white; padding:12px 20px; border-radius:6px; text-decoration:none;">
            Check Activity
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

module.exports = {
  loginTemplate,
  registerTemplate,
  otpTemplate
};