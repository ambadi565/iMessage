import express from 'express';
import cors from 'cors'; // Browser security rules, to enable which all urls can access this server
import dotenv from 'dotenv'; dotenv.config();
import User from './models/user.model.js';
import connectDB from './lib/db.js';
import { clerkMiddleware } from '@clerk/express';


const app = express();

const PORT = process.env.PORT
const frontendUrl = process.env.FRONTEND_URL

app.use(express.json());

//app.use(cors()); // all sites can access
app.use(cors({
    origin: frontendUrl,
    credentials: true
}));
app.use(clerkMiddleware());

app.get("/", (req, res) => {
    res.status(200).json({ message: "Hello World" });
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
  connectDB();  
});