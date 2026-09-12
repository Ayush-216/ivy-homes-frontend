'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    fetchApi('/v1/analytics/summary')
      .then(data => setSummary(data))
      .catch((err) => {
        console.error("API Error intercepted:", err);
        setApiError(true);
        // Fallback to our offline computed data
        setSummary({
          total_listings: 3500,
          median_price: 11200000, 
          median_price_per_sqft: 26670 // rounded from our calculated 26669.96
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-cyan-400 animate-pulse">Loading Nexus Database...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10 flex justify-between items-end border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
            Ivy Insights
          </h1>
          <p className="text-gray-400 mt-2">Authenticated as {user?.email}</p>
        </div>
      </header>

      {apiError && (
        <div className="mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 flex items-center gap-3">
          <span className="font-bold">⚠️ SYSTEM ALERT:</span> 
          /v1/analytics/summary returned 404 Not Found. Displaying offline fallback data.
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#0a0a0a] p-6 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Active Listings</h3>
          <p className="text-3xl font-bold text-cyan-50">{summary?.total_listings}</p>
        </div>
        <div className="bg-[#0a0a0a] p-6 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Median Price</h3>
          <p className="text-3xl font-bold text-cyan-50">
            ₹{(summary?.median_price || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-[#0a0a0a] p-6 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Avg Price / SqFt 2BHK</h3>
          <p className="text-3xl font-bold text-cyan-50">₹{summary?.median_price_per_sqft}</p>
        </div>
      </section>

      <h2 className="text-2xl font-bold text-gray-200 mb-6 border-l-4 border-blue-500 pl-3">Data Discrepancies Discovered</h2>
      <ul className="space-y-4">
        {[
          "Pagination requires 'offset' instead of documented 'page'.",
          "Auth expects 'X-API-Key' in headers, not URL query params.",
          "Projects endpoint returns prices in Crores, violating integer INR documentation.",
          "Limit parameter hard-caps at 50, despite docs claiming 200.",
          "/v1/analytics/summary is entirely missing (404 Not Found)."
        ].map((item, i) => (
          <li key={i} className="flex items-center space-x-3 text-gray-300 bg-gray-900/50 p-4 rounded border border-gray-800">
            <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}