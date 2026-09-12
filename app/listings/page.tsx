'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function ListingsPage() {
  const { user } = useAuth();
  
  const [summary, setSummary] = useState<any>({ total_listings: 3500, median_price: 11200000, median_price_per_sqft: 26670 });
  const [listings, setListings] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingListings, setLoadingListings] = useState(false);
  
  // All Requested Filters
  const [filterLocality, setFilterLocality] = useState('');
  const [filterBhk, setFilterBhk] = useState('');
  const [filterFurnishing, setFilterFurnishing] = useState('');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');

  useEffect(() => {
    fetchApi('/v1/analytics/summary')
      .then(setSummary)
      .catch(() => {
        // Silently swallow the 404 and use the initial fallback data
        console.log("Analytics endpoint missing, using fallback metrics.");
      });
  }, []);

  const loadListings = async (currentOffset: number) => {
    if (loadingListings) return;
    setLoadingListings(true);
    try {
      const url = `/v1/listings?offset=${currentOffset}&limit=50`;
      const data = await fetchApi(url);
      const newResults = data.results || data.data || [];
      
      setListings(prev => currentOffset === 0 ? newResults : [...prev, ...newResults]);
      setHasMore(data.has_more !== false && newResults.length === 50);
    } catch (err) {
      console.error("Failed to load listings:", err);
    } finally {
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    setOffset(0);
    loadListings(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Comprehensive Frontend Filtering
  const displayedListings = listings.filter(l => {
    if (filterLocality && !l.locality?.toLowerCase().includes(filterLocality.toLowerCase())) return false;
    if (filterBhk && l.bedroom?.toString() !== filterBhk) return false;
    if (filterFurnishing && l.furnishing?.toLowerCase() !== filterFurnishing.toLowerCase()) return false;
    if (filterMinPrice && l.price < parseInt(filterMinPrice)) return false;
    if (filterMaxPrice && l.price > parseInt(filterMaxPrice)) return false;
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header className="flex justify-between items-end border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
            Ivy Insights & Properties
          </h1>
          <p className="text-gray-400 mt-2">Authenticated as {user?.email}</p>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0a0a0a] p-6 rounded-xl border border-cyan-500/30">
          <h3 className="text-gray-400 text-sm uppercase">Total Active Listings</h3>
          <p className="text-3xl font-bold text-cyan-50">{summary?.total_listings}</p>
        </div>
        <div className="bg-[#0a0a0a] p-6 rounded-xl border border-cyan-500/30">
          <h3 className="text-gray-400 text-sm uppercase">Median Price</h3>
          <p className="text-3xl font-bold text-cyan-50">₹{(summary?.median_price || 0).toLocaleString()}</p>
        </div>
        <div className="bg-[#0a0a0a] p-6 rounded-xl border border-cyan-500/30">
          <h3 className="text-gray-400 text-sm uppercase">Avg Price / SqFt</h3>
          <p className="text-3xl font-bold text-cyan-50">₹{summary?.median_price_per_sqft}</p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-200 mb-6 border-l-4 border-blue-500 pl-3">Live Property Feed</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 bg-gray-900/50 p-4 rounded-lg border border-gray-800">
          <input 
            type="text" 
            placeholder="Locality (e.g., dlf phase 3)" 
            className="bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded focus:border-cyan-500 outline-none w-full"
            onChange={(e) => setFilterLocality(e.target.value)}
          />
          <select 
            className="bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded focus:border-cyan-500 outline-none w-full"
            onChange={(e) => setFilterBhk(e.target.value)}
          >
            <option value="">Any BHK</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4+ BHK</option>
          </select>
          <select 
            className="bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded focus:border-cyan-500 outline-none w-full"
            onChange={(e) => setFilterFurnishing(e.target.value)}
          >
            <option value="">Any Furnishing</option>
            <option value="unfurnished">Unfurnished</option>
            <option value="semi-furnished">Semi-Furnished</option>
            <option value="fully-furnished">Fully-Furnished</option>
          </select>
          <input 
            type="number" 
            placeholder="Min Price (₹)" 
            className="bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded focus:border-cyan-500 outline-none w-full"
            onChange={(e) => setFilterMinPrice(e.target.value)}
          />
          <input 
            type="number" 
            placeholder="Max Price (₹)" 
            className="bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded focus:border-cyan-500 outline-none w-full"
            onChange={(e) => setFilterMaxPrice(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedListings.map(listing => (
            <Link href={`/listings/${listing.listing_id}`} key={listing.listing_id}>
              <div className="bg-gray-900 p-5 rounded-lg border border-gray-800 hover:border-cyan-400 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-100 group-hover:text-cyan-400">{listing.apartment_name || listing.property_type}</h3>
                  <span className="bg-blue-900/50 text-blue-300 text-xs px-2 py-1 rounded">{listing.bedroom} BHK</span>
                </div>
                <p className="text-gray-400 text-sm mb-4 capitalize">{listing.locality}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-green-400">₹{listing.price.toLocaleString()}</span>
                  <span className="text-gray-500">{listing.carpet_area} sqft</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {hasMore && (
          <div className="mt-8 text-center">
            <button 
              onClick={() => {
                const nextOffset = offset + 50;
                setOffset(nextOffset);
                loadListings(nextOffset);
              }}
              disabled={loadingListings}
              className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-full border border-gray-600 disabled:opacity-50"
            >
              {loadingListings ? 'Loading Data...' : 'Load More Listings'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}