const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require("cors");
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = [
  "http://localhost:5173",
  "https://resume-maker-c6ko.vercel.app",
  "https://resume-maker-khaki-nine.vercel.app" // ✅ ADD THIS
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests without origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    // allow exact domains
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // 🔥 allow ONLY your Vercel preview domains
   if (
      origin.endsWith(".vercel.app") &&
      origin.includes("resume-maker")
    ) {
      return callback(null, true);
    }

    // block everything else
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
// require all the routes here
const authRouter = require('./routes/auth.routes');
const interviewRouter = require("./routes/interview.routes");
const resumeRoutes = require("./routes/resume.routes");
const monitoringRoutes = require("./routes/monitoring.routes");


// using all the routes here
app.use('/api/auth', authRouter);
app.use('/api/interview',interviewRouter);
app.use("/api/resume", resumeRoutes);
app.use("/api/monitor", monitoringRoutes);
module.exports = app;
