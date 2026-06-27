import React, { useState, useEffect } from "react";
import axios from "axios";
import CryptoTable from "./components/CryptoTable";
import AnalyticsModal from "./components/AnalyticsModal";
import { Activity, Server, Layers } from "lucide-react";

function App() {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("");
  const [selectedCoin, setSelectedCoin] = useState(null);

  const fetchLatestPrices = async () => {
    try {
      const response = await axios.get("/api/prices/latest");
      setCryptoData(response.data.data);
      setSource(response.data.source);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching metrics from proxy stack:", error);
    }
  };

  useEffect(() => {
    fetchLatestPrices();
    // Auto-polling interval to fetch fresh metrics from Redis cache every 10 seconds
    const interval = setInterval(fetchLatestPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-12 selection:bg-emerald-500 selection:text-slate-950">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-emerald-400 tracking-tight flex items-center gap-2">
              <Layers className="text-emerald-500 animate-pulse" /> CryptoPulse
              Engine
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              High-frequency metrics layer backed by{" "}
              <span className="text-slate-200 font-medium">
                Nginx Load Balancing
              </span>{" "}
              and{" "}
              <span className="text-slate-200 font-medium">
                Redis Cluster Cache
              </span>
              .
            </p>
          </div>

          {/* Infrastructure Cache Badge */}
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-inner">
            <Server
              size={18}
              className={
                source === "cache" ? "text-emerald-400" : "text-amber-400"
              }
            />
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                Gateway Strategy
              </div>
              <div
                className={`text-xs font-mono font-black ${source === "cache" ? "text-emerald-400" : "text-amber-400"}`}
              >
                {source
                  ? `O(1) ${source.toUpperCase()} HIT`
                  : "INITIALIZING..."}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center pt-32 text-slate-500 space-y-3">
            <Activity className="animate-spin text-emerald-500" size={40} />
            <p className="text-sm tracking-wide">
              Syncing state with distributed microservices cluster...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-500 px-1">
              <span>Displaying top 50 global index assets</span>
              <span className="animate-pulse text-emerald-500 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>{" "}
                Live Node Balanced Status
              </span>
            </div>

            {/* GSAP Animated Data Grid */}
            <CryptoTable
              data={cryptoData}
              onSelectCoin={(id) => setSelectedCoin(id)}
            />
          </div>
        )}

        {/* Aggregation Pipeline Analytics Modal */}
        {selectedCoin && (
          <AnalyticsModal
            coinId={selectedCoin}
            onClose={() => setSelectedCoin(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
