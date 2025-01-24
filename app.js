import express from 'express';
import bodyParser from 'body-parser'; // Changed to import
import cors from 'cors';
import connectDB from './config/dbConnection.js'; // Added .js extension
import routers from './config/routes.js'; // Added .js extension

import dotenv from 'dotenv'; // Changed to import
dotenv.config(); // To use environment variables from .env

const app = express();
const PORT = process.env.PORT || 3000; 

/* ------------------------ cors ------------------------ */
app.use(cors());
app.use(bodyParser.json());

/* ------------------------ use route ------------------------ */
routers(app);

// connect database
connectDB();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
