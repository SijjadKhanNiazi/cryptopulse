import PriceHistory from "../models/PriceHistory.js";
import { redisClient } from "../services/redisService.js";

// 1. GET LATEST PRICES (Uses Redis Cache for O(1) Speed)
export const getLatestPrices = async (req, res) => {
  try {
    // Check if data exists in Redis
    const cachedData = await redisClient.get("crypto:latest");

    if (cachedData) {
      console.log("🎯 REDIS CACHE HIT - Returning lightning fast data!");
      return res
        .status(200)
        .json({ source: "cache", data: JSON.parse(cachedData) });
    }

    console.log("⚠️ REDIS CACHE MISS - Fetching from MongoDB...");
    // Fallback if cache expired: Get latest entry per coin from DB (Using Index)
    // Abhi temporary hum generic find kar rahy hain pipeline optimization se pehle
    const dbData = await PriceHistory.find().sort({ timestamp: -1 }).limit(50);

    return res.status(200).json({ source: "database", data: dbData });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// 2. GET COIN ANALYTICS (Uses Complex Mongoose Aggregation Pipeline)
export const getCoinAnalytics = async (req, res) => {
  const { coinId } = req.params;

  try {
    console.log(`📊 Running Aggregation Pipeline for coin: ${coinId}`);

    // Complex Pipeline to calculate Max, Min, Average Price, and Total Records
    const analytics = await PriceHistory.aggregate([
      {
        $match: { coinId: coinId.toLowerCase() },
      },
      {
        $group: {
          _id: "$coinId",
          averagePrice: { $avg: "$priceUSD" },
          maxPrice: { $max: "$priceUSD" },
          minPrice: { $min: "$priceUSD" },
          totalDataPoints: { $count: {} },
        },
      },
    ]);

    if (analytics.length === 0) {
      return res
        .status(404)
        .json({ message: "No data found for this coin yet." });
    }

    return res
      .status(200)
      .json({ source: "mongodb_aggregation", data: analytics[0] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
