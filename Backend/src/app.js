const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require("cors");
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://resume-maker-c6ko.vercel.app",
  "https://resume-maker-khaki-nine.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests without origin (Postman, mobile apps, server-to-server)
    if (!origin) return callback(null, true);

    // allow exact domains
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // allow any vercel deployment for resume-maker
    if (
      origin.endsWith(".vercel.app") &&
      origin.includes("resume-maker")
    ) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"]
}));
// require all the routes here
const authRouter = require('./routes/auth.routes');
const interviewRouter = require("./routes/interview.routes");
const resumeRoutes = require("./routes/resume.routes");
const monitoringRoutes = require("./routes/monitoring.routes");
const adminRoutes = require("./routes/admin.routes");



// using all the routes here
app.use('/api/auth', authRouter);
app.use('/api/interview',interviewRouter);
app.use("/api/resume", resumeRoutes);
app.use("/api/monitor", monitoringRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;
