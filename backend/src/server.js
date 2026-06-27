import express from "express";
import dotenv from "dotenv";
import os from "os";
import connectDB from "./config/db.js";
import { connectRedis } from "./services/redisService.js";
import { startCryptoWorker } from "./workers/cryptoWorker.js";
import {
  getLatestPrices,
  getCoinAnalytics,
} from "./controllers/analyticsController.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  console.log(
    `🎯 Request handled by Container ID [Hostname]: ${os.hostname()}`,
  );
  next();
});

app.get("/api/prices/latest", getLatestPrices);
app.get("/api/analytics/:coinId", getCoinAnalytics);
app.get("/", (req, res) => {
  res.send(`CryptoPulse Engine is scaling from container: ${os.hostname()}`);
});

const startServer = async () => {
  await connectDB();
  await connectRedis();

  // ⚡ CRITICAL: Sirf wahi container worker chalaye ga jahan RUN_WORKER=true hoga
  if (process.env.RUN_WORKER === "true") {
    console.log("🤖 This container is designated as the Background Worker.");
    startCryptoWorker();
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
