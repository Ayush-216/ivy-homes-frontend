'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';
import { Search, MapPin, Bed, IndianRupee, Loader2 } from 'lucide-react';

export default function ListingsPage() {
  const [summary, setSummary] = useState<any>({ total_listings: 3500, median_price: 11200000, median_price_per_sqft: 26670 });
  const [listings, setListings] = useState<any[]>([]);
  
  // Pagination & Loading State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingListings, setLoadingListings] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Filters
  const [searchName, setSearchName] = useState('');
  const [filterLocality, setFilterLocality] = useState('');
  const [filterBhk, setFilterBhk] = useState('');

  // 1. Restore State on Mount (Fixes the "Back button" re-load issue)
  useEffect(() => {
    fetchApi('/v1/analytics/summary').then(setSummary).catch(() => {});
    
    const savedState = sessionStorage.getItem('nexus_feed_state');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      setListings(parsed.listings);
      setPage(parsed.page);
      setTotalPages(parsed.totalPages);
      setSearchName(parsed.searchName);
      setFilterLocality(parsed.filterLocality);
      setFilterBhk(parsed.filterBhk);
      setInitialLoad(false);
    } else {
      loadListings(1);
    }
  }, []);

  // 2. Save State on Change
  useEffect(() => {
    if (!initialLoad) {
      sessionStorage.setItem('nexus_feed_state', JSON.stringify({
        listings, page, totalPages, searchName, filterLocality, filterBhk
      }));
    }
  }, [listings, page, totalPages, searchName, filterLocality, filterBhk, initialLoad]);

  const loadListings = async (targetPage: number) => {
    setLoadingListings(true);
    try {
      const offset = (targetPage - 1) * 50;
      const data = await fetchApi(`/v1/listings?offset=${offset}&limit=50`);
      const newResults = data.results || data.data || [];
      
      setListings(newResults);
      setPage(targetPage);
      
      // Calculate total pages based on our offline discovery (3500 total / 50 per page)
      setTotalPages(Math.ceil(3500 / 50)); 
    } catch (err) {
      console.error("Failed to load listings", err);
    } finally {
      setLoadingListings(false);
      setInitialLoad(false);
    }
  };

  // Frontend Filtering
  const displayedListings = listings.filter(l => {
    const nameMatch = (l.apartment_name || l.property_type || '').toLowerCase();
    if (searchName && !nameMatch.includes(searchName.toLowerCase())) return false;
    if (filterLocality && !l.locality?.toLowerCase().includes(filterLocality.toLowerCase())) return false;
    if (filterBhk && l.bedroom?.toString() !== filterBhk) return false;
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Dashboard Widgets */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Listings", val: summary.total_listings },
          { label: "Median Price", val: `₹${(summary.median_price || 0).toLocaleString()}` },
          { label: "Avg Price / SqFt", val: `₹${summary.median_price_per_sqft}` }
        ].map((stat, i) => (
          <div key={i} className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800 hover:border-cyan-500/30 transition-all shadow-lg hover:shadow-cyan-500/10">
            <h3 className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-2">{stat.label}</h3>
            <p className="text-3xl font-extrabold text-white">{stat.val}</p>
          </div>
        ))}
      </section>

      {/* Control Panel (Filters) */}
      <section className="bg-gray-900/60 p-6 rounded-2xl border border-gray-800 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search property name..." 
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 text-white pl-10 pr-4 py-2.5 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Filter Locality..." 
              value={filterLocality}
              onChange={(e) => setFilterLocality(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 text-white pl-10 pr-4 py-2.5 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
            />
          </div>
          <div className="relative">
            <Bed className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
            <select 
              value={filterBhk}
              onChange={(e) => setFilterBhk(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 text-white pl-10 pr-4 py-2.5 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all appearance-none"
            >
              <option value="">Any Configuration</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4+ BHK</option>
            </select>
          </div>
        </div>
      </section>

      {/* Data Grid */}
      <section className="relative min-h-[400px]">
        {loadingListings ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950/50 backdrop-blur-sm z-10 rounded-2xl">
            <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedListings.map(listing => (
            <Link href={`/listings/${listing.listing_id}`} key={listing.listing_id}>
              <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800 hover:border-cyan-500/50 hover:bg-gray-900 transition-all cursor-pointer group h-full flex flex-col shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-100 group-hover:text-cyan-400 line-clamp-1">
                    {listing.apartment_name || listing.property_type}
                  </h3>
                  <span className="bg-blue-900/30 text-blue-400 border border-blue-800/50 text-xs px-2.5 py-1 rounded-md font-semibold shrink-0">
                    {listing.bedroom} BHK
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-6 capitalize flex items-center gap-1.5 flex-1">
                  <MapPin size={14} className="text-gray-500" />
                  {listing.locality}
                </p>
                <div className="flex justify-between items-end border-t border-gray-800/50 pt-4 mt-auto">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Asking Price</p>
                    <p className="font-bold text-green-400 text-lg flex items-center gap-1">
                      <IndianRupee size={16} />{listing.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Area</p>
                    <p className="text-gray-300 font-medium">{listing.carpet_area} sqft</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Numbered Pagination */}
        <div className="mt-12 flex justify-center items-center gap-2">
          <button 
            disabled={page === 1}
            onClick={() => loadListings(page - 1)}
            className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-cyan-500 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            Prev
          </button>
          
          <div className="flex items-center gap-1 px-4 text-sm font-medium">
            <span className="text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-md border border-cyan-500/20">{page}</span>
            <span className="text-gray-600 mx-2">/</span>
            <span className="text-gray-400">{totalPages}</span>
          </div>

          <button 
            disabled={page === totalPages}
            onClick={() => loadListings(page + 1)}
            className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-cyan-500 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
}