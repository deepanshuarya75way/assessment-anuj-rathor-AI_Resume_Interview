require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');

const port = process.env.PORT ? parseInt(String(process.env.PORT).trim(), 10) : 3000;

connectDB();

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

