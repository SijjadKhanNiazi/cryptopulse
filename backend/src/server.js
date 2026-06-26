import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { connectRedis } from "./services/redisService.js";
import { startCryptoWorker } from "./workers/cryptoWorker.js";

dotenv.config();

const app = express();
app.use(express.json());

// Main Setup Function
const startServer = async () => {
  // Connect Databases
  await connectDB();
  await connectRedis();

  // Start Background Worker
  startCryptoWorker();

  app.get("/", (req, res) => {
    res.send("CryptoPulse Backend Engine is Running with Redis & Mongo!");
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
  });
};

startServer();
