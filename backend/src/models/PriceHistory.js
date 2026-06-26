import mongoose from "mongoose";

const priceHistorySchema = new mongoose.Schema({
  coinId: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  symbol: { type: String, required: true, uppercase: true },
  name: { type: String, required: true },
  priceUSD: { type: Number, required: true },
  marketCapUSD: { type: Number },
  volume24hUSD: { type: Number },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

// ⚡ CRITICAL: COMPOUND INDEX FOR FAST RESPONSE & SCALABILITY
// 1 ka matlab Ascending, -1 ka matlab Descending.
// Jab hum query krein gy: { coinId: 'bitcoin' } sorting by timestamp, toh response O(1) jesa fast hoga.
priceHistorySchema.index({ coinId: 1, timestamp: -1 });

const PriceHistory = mongoose.model("PriceHistory", priceHistorySchema);

export default PriceHistory;
