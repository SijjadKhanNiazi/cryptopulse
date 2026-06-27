import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { TrendingUp, BarChart2 } from "lucide-react";

function CryptoTable({ data, onSelectCoin }) {
  const tableRef = useRef(null);

  // GSAP Animation effect trigger on data update
  useEffect(() => {
    if (data.length > 0) {
      gsap.fromTo(
        tableRef.current.querySelectorAll(".crypto-row"),
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.02, ease: "power2.out" },
      );
    }
  }, [data]);

  return (
    <div
      ref={tableRef}
      className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-md"
    >
      <table className="w-full text-left border-collapse text-slate-300">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-950 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <th className="p-4">Asset</th>
            <th className="p-4">Price (USD)</th>
            <th className="p-4">Market Cap</th>
            <th className="p-4">Volume (24h)</th>
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-sm">
          {data.map((coin) => (
            <tr
              key={coin.coinId}
              className="crypto-row hover:bg-slate-800/40 transition-colors group"
            >
              {/* Asset Info */}
              <td className="p-4 flex items-center gap-3 font-medium text-slate-100">
                <span className="bg-slate-800 px-2 py-1 rounded text-xs text-emerald-400 font-mono uppercase">
                  {coin.symbol}
                </span>
                <span className="capitalize">{coin.name}</span>
              </td>

              {/* Price */}
              <td className="p-4 font-mono font-bold text-emerald-400">
                $
                {coin.priceUSD?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </td>

              {/* Market Cap */}
              <td className="p-4 font-mono text-slate-400">
                ${coin.marketCapUSD?.toLocaleString()}
              </td>

              {/* Volume */}
              <td className="p-4 font-mono text-slate-400">
                ${coin.volume24hUSD?.toLocaleString()}
              </td>

              {/* Action Trigger */}
              <td className="p-4 text-center">
                <button
                  onClick={() => onSelectCoin(coin.coinId)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 transition-all duration-200"
                >
                  <BarChart2 size={14} /> Analytics
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CryptoTable;
