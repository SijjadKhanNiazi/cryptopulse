import mongoose from "mongoose";

const priceHistorySchema = new mongoose.Schema({
  coinId: { type: String, required: true, lowercase: true, trim: true },
  symbol: { type: String, required: true, uppercase: true },
  name: { type: String, required: true },
  priceUSD: { type: Number, required: true },
  marketCapUSD: { type: Number },
  volume24hUSD: { type: Number },
  timestamp: { type: Date, default: Date.now, required: true },
});

// ⚡ COMPOUND INDEX FOR FAST ANALYTICS
priceHistorySchema.index({ coinId: 1, timestamp: -1 });

// 🛡️ TTL INDEX: Automatically delete records older than 1 hour (3600 seconds)
priceHistorySchema.index({ timestamp: 1 }, { expireAfterSeconds: 3600 });

const PriceHistory = mongoose.model("PriceHistory", priceHistorySchema);
export default PriceHistory;
