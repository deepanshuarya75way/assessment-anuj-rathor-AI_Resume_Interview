const app = require('./src/app');
require('dotenv').config();
const invokeGeminiAi = require("./src/services/ai.service");
const port = 3000;
const {resume, selfDescription, jobDescription} = require("./src/services/ai.service");
const connectDB = require('./src/config/database');
const generateInterviewReport = require("./src/services/ai.service");
connectDB();

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
