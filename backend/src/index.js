import express from 'express';
import cors from 'cors'; // Browser security rules, to enable which all urls can access this server
import dotenv from 'dotenv'; dotenv.config();
import fs from 'fs';
import path from 'path';


import User from './models/user.model.js';
import connectDB from './lib/db.js';
import { clerkMiddleware } from '@clerk/express';
import clerkWebHook from "./webhooks/clerk.webhook.js";
import authRoutes from "./routes/auth.route.js"
import job from './lib/cron.js';

const app = express();

const PORT = process.env.PORT
const frontendUrl = process.env.FRONTEND_URL

const publicDir = path.join(process.cwd(), 'public');


app.use("/api/webhooks/clerk", express.raw({ type: "application/json"}), clerkWebHook);

app.use(express.json());
//app.use(cors()); // all sites can access
app.use(cors({
    origin: frontendUrl,
    credentials: true
}));
app.use(clerkMiddleware());


app.get("/health", (req, res) => {
    res.status(200).json({ message: "Hello World" });
});

app.use("/api/auth", authRoutes)

// Serve static files from public directory
// this is for production build
if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));

    // Handle all other routes by serving the index.html file
    app.get("/{*any}", (req, res, next) => {
    res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
  connectDB();  

  if(process.env.NODE_ENV === 'production') {
    job.start()
  }
});