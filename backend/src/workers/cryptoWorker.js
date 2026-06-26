import axios from "axios";
import PriceHistory from "../models/PriceHistory.js";

export const startCryptoWorker = () => {
  setInterval(async () => {
    try {
      console.log(" Fetching live data from Public CoinGecko API...");

      // Using CoinGecko Free Public API as alternative
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
        await PriceHistory.insertMany(bulkData, { ordered: false });
        console.log(
          ` Successfully saved ${bulkData.length} coin metrics to MongoDB.`,
        );
      }
    } catch (error) {
      console.error(" Worker Error fetching crypto data:", error.message);
      console.log(
        " Tip: Make sure your internet is working and you can access api.coingecko.com",
      );
    }
  }, 30000); // 30 seconds
};
