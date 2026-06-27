import axios from "axios";
import PriceHistory from "../models/PriceHistory.js";
import { redisClient } from "../services/redisService.js";

export const startCryptoWorker = () => {
  setInterval(async () => {
    try {
      console.log(" Fetching live data from Public CoinGecko API...");

      const response = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1",
      );
      const assets = response.data;

      const bulkData = assets.map((coin) => ({
        coinId: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        priceUSD: coin.current_price,
        marketCapUSD: coin.market_cap,
        volume24hUSD: coin.total_volume,
        timestamp: new Date(),
      }));

      if (bulkData.length > 0) {
        // 1. Save to MongoDB for Historical Analytics
        await PriceHistory.insertMany(bulkData, { ordered: false });
        console.log(` Saved ${bulkData.length} metrics to MongoDB.`);

        // 2. Cache the Latest Prices in Redis for Fast Response
        // Pure array ko single key 'crypto:latest' mein store kar rahe hain with 60s expiration
        await redisClient.setEx("crypto:latest", 60, JSON.stringify(bulkData));
        console.log(" Latest prices cached in Redis!");
      }
    } catch (error) {
      console.error(" Worker Error:", error.message);
    }
  }, 30000);
};
