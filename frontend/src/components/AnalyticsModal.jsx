import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  X,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";

function AnalyticsModal({ coinId, onClose }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // Hitting our heavy MongoDB Aggregation Endpoint
        const response = await axios.get(`/api/analytics/${coinId}`);
        setAnalytics(response.data.data);
      } catch (error) {
        console.error("Error fetching aggregation data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (coinId) fetchAnalytics();
  }, [coinId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg border border-slate-700 bg-slate-900 p-6 rounded-2xl shadow-2xl text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-emerald-500" size={24} />
            <h2 className="text-xl font-bold capitalize">{coinId} Analytics</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Activity
              className="animate-spin text-emerald-500 mb-2"
              size={32}
            />
            <p className="text-sm">Running Mongoose Aggregation Pipeline...</p>
          </div>
        ) : analytics ? (
          <div className="mt-6 space-y-4">
            <p className="text-xs text-slate-500 bg-slate-950 p-2 rounded-md border border-slate-800">
              ⚡ Source:{" "}
              <span className="text-emerald-400 font-mono">
                mongodb_aggregation_pipeline
              </span>
            </p>

            {/* Grid Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <ArrowUpRight size={14} className="text-emerald-500" /> Max
                  Price (1h)
                </span>
                <p className="text-lg font-bold text-slate-200 mt-1">
                  ${analytics.maxPrice?.toLocaleString()}
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <ArrowDownRight size={14} className="text-rose-500" /> Min
                  Price (1h)
                </span>
                <p className="text-lg font-bold text-slate-200 mt-1">
                  ${analytics.minPrice?.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">
                Rolling Average Price
              </span>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                ${analytics.averagePrice?.toFixed(2)}
              </p>
            </div>

            <div className="flex justify-between items-center bg-slate-800/40 px-4 py-2 rounded-lg text-xs text-slate-400">
              <span>Total Data Points Analyzed:</span>
              <span className="font-mono text-slate-200 bg-slate-900 px-2 py-0.5 rounded">
                {analytics.totalDataPoints} records
              </span>
            </div>
          </div>
        ) : (
          <p className="text-center text-slate-500 py-6">
            No historical metrics collected yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default AnalyticsModal;
