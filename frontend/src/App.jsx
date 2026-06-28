import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import CryptoTable from "./components/CryptoTable";
import AnalyticsModal from "./components/AnalyticsModal";
import {
  Activity,
  Server,
  Layers,
  Wifi,
  WifiOff,
  Database,
  Gauge,
  ShieldCheck,
  Clock,
  TrendingUp,
  ChevronRight,
  RefreshCw,
  CircleDot,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────
   Small presentational helpers — purely visual, no logic
   ────────────────────────────────────────────────────────── */

function StatusDot({ active }) {
  return (
    <span className="relative inline-flex h-2 w-2">
      {active && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
      )}
      <span
        className={`relative inline-flex h-2 w-2 rounded-full ${
          active ? "bg-emerald-400" : "bg-amber-400"
        }`}
      />
    </span>
  );
}

function MetricChip({ icon: Icon, label, value, tone = "slate" }) {
  const toneMap = {
    emerald: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    amber: "text-amber-400 border-amber-500/20 bg-amber-500/5",
    slate: "text-slate-300 border-slate-700/60 bg-slate-900/40",
    cyan: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5",
  };
  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 backdrop-blur-sm transition-colors ${toneMap[tone]}`}
    >
      <Icon size={14} strokeWidth={2.25} className="shrink-0 opacity-90" />
      <div className="flex flex-col leading-tight">
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
          {label}
        </span>
        <span className="font-mono text-xs font-bold">{value}</span>
      </div>
    </div>
  );
}

function ClockReadout() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono text-xs font-bold text-slate-400">
      {now.toLocaleTimeString("en-US", { hour12: false })}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────
   Animated background grid + ambient glow (decorative only)
   ────────────────────────────────────────────────────────── */

function AmbientBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Base gradient wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.08),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(6,182,212,0.06),transparent)]" />

      {/* Faint grid */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.07]">
        <defs>
          <pattern
            id="grid"
            width="44"
            height="44"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 44 0 L 0 0 0 44"
              fill="none"
              stroke="rgb(148 163 184)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_0%,transparent_40%,rgba(2,6,23,0.6))]" />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Skeleton loading rows — shown while loading === true
   ────────────────────────────────────────────────────────── */

function SkeletonRows({ rows = 8 }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40">
      <div className="grid grid-cols-12 gap-4 border-b border-slate-800/80 px-5 py-3">
        {["#", "Asset", "Price", "24h", "Volume", "Market Cap"].map((h) => (
          <div
            key={h}
            className="col-span-2 text-[10px] font-bold uppercase tracking-widest text-slate-600"
          >
            {h}
          </div>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-12 items-center gap-4 border-b border-slate-800/40 px-5 py-4"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="col-span-2 flex items-center gap-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-slate-800" />
            <div className="space-y-1.5">
              <div className="h-3 w-16 animate-pulse rounded bg-slate-800" />
              <div className="h-2 w-10 animate-pulse rounded bg-slate-800/60" />
            </div>
          </div>
          <div className="col-span-2 h-3 w-20 animate-pulse rounded bg-slate-800" />
          <div className="col-span-2 h-3 w-14 animate-pulse rounded bg-slate-800/70" />
          <div className="col-span-2 h-3 w-20 animate-pulse rounded bg-slate-800/60" />
          <div className="col-span-2 h-3 w-24 animate-pulse rounded bg-slate-800/50" />
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Main App — same state, same effects, same data flow.
   Only render output / classNames are enhanced.
   ────────────────────────────────────────────────────────── */

function App() {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("");
  const [selectedCoin, setSelectedCoin] = useState(null);

  // Purely cosmetic: tracks the last successful refresh for the UI,
  // does not affect data-fetching logic at all.
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pollCountRef = useRef(0);

  const fetchLatestPrices = async () => {
    try {
      setIsRefreshing(true);
      const response = await axios.get("/api/prices/latest");
      setCryptoData(response.data.data);
      setSource(response.data.source);
      setLoading(false);
      setLastSyncedAt(new Date());
      pollCountRef.current += 1;
    } catch (error) {
      console.error("Error fetching metrics from proxy stack:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLatestPrices();
    // Auto-polling interval to fetch fresh metrics from Redis cache every 10 seconds
    const interval = setInterval(fetchLatestPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  const isCacheHit = source === "cache";

  const assetCount = useMemo(() => cryptoData?.length || 0, [cryptoData]);

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      <AmbientBackdrop />

      <div className="relative mx-auto max-w-7xl space-y-8 p-6 md:p-12">
        {/* ───────────────────── Top Header ───────────────────── */}
        <header className="flex flex-col gap-6 border-b border-slate-800/80 pb-7 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                <CircleDot size={10} className="animate-pulse" />
                Live
              </span>
              <span className="text-[11px] font-medium uppercase tracking-widest text-slate-500">
                Realtime Index Feed
              </span>
            </div>

            <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-slate-50 md:text-4xl">
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/20">
                <Layers
                  size={22}
                  strokeWidth={2.5}
                  className="text-slate-950"
                />
              </span>
              <span className="bg-gradient-to-r from-slate-50 via-slate-200 to-slate-400 bg-clip-text text-transparent">
                CryptoPulse Engine
              </span>
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-slate-400">
              High-frequency metrics layer backed by{" "}
              <span className="font-semibold text-slate-200">
                Nginx Load Balancing
              </span>{" "}
              and{" "}
              <span className="font-semibold text-slate-200">
                Redis Cluster Cache
              </span>
              .
            </p>
          </div>

          {/* ───────── Infrastructure status panel ───────── */}
          <div className="flex flex-wrap items-stretch gap-3">
            <MetricChip
              icon={Clock}
              label="System Time"
              value={<ClockReadout />}
            />
            <MetricChip
              icon={TrendingUp}
              label="Tracked Assets"
              value={loading ? "—" : assetCount}
              tone="cyan"
            />

            {/* Gateway strategy badge — preserves original "source" semantics */}
            <div
              className={`flex items-center gap-3 rounded-xl border p-3 shadow-inner backdrop-blur-sm transition-colors ${
                isCacheHit
                  ? "border-emerald-500/25 bg-emerald-500/[0.06]"
                  : "border-amber-500/25 bg-amber-500/[0.06]"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  isCacheHit ? "bg-emerald-500/15" : "bg-amber-500/15"
                }`}
              >
                {isCacheHit ? (
                  <Database
                    size={16}
                    strokeWidth={2.25}
                    className="text-emerald-400"
                  />
                ) : (
                  <Server
                    size={16}
                    strokeWidth={2.25}
                    className="text-amber-400"
                  />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Gateway Strategy
                  <StatusDot active={isCacheHit} />
                </div>
                <div
                  className={`font-mono text-xs font-black ${
                    isCacheHit ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {source
                    ? `O(1) ${source.toUpperCase()} HIT`
                    : "INITIALIZING..."}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ───────────────────── Dashboard Content ───────────────────── */}
        {loading ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center gap-4 pt-16 text-slate-500">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/20" />
                <Activity
                  className="relative animate-spin text-emerald-500"
                  size={32}
                  strokeWidth={2.25}
                />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-sm font-medium tracking-wide text-slate-300">
                  Syncing state with distributed microservices cluster
                </p>
                <p className="text-xs text-slate-500">
                  Establishing connection to Redis cluster cache layer…
                </p>
              </div>
            </div>
            <SkeletonRows />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Toolbar / status strip above the table */}
            <div className="flex flex-col gap-3 rounded-xl border border-slate-800/70 bg-slate-900/30 px-4 py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>
                  Displaying{" "}
                  <span className="font-semibold text-slate-200">
                    top {assetCount || 50}
                  </span>{" "}
                  global index assets
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs">
                {lastSyncedAt && (
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <RefreshCw
                      size={12}
                      className={
                        isRefreshing ? "animate-spin text-emerald-400" : ""
                      }
                    />
                    Synced{" "}
                    {lastSyncedAt.toLocaleTimeString("en-US", {
                      hour12: false,
                    })}
                  </span>
                )}

                <span className="flex items-center gap-1.5 font-semibold text-emerald-500">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  Live Node Balanced Status
                </span>
              </div>
            </div>

            {/* Table wrapper — adds a polished frame around the existing component */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/30 shadow-2xl shadow-black/20 backdrop-blur-sm transition-shadow hover:shadow-emerald-500/5">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
              <CryptoTable
                data={cryptoData}
                onSelectCoin={(id) => setSelectedCoin(id)}
              />
            </div>

            {/* Footer micro-status row */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-[11px] text-slate-600">
              <span className="flex items-center gap-1.5">
                <Wifi size={12} className="text-emerald-500/70" />
                Connected via secure gateway
              </span>
              <span className="flex items-center gap-1 font-mono">
                Poll cycle <ChevronRight size={11} className="text-slate-700" />{" "}
                10s interval
              </span>
            </div>
          </div>
        )}

        {/* ───────────────────── Analytics Modal ───────────────────── */}
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
