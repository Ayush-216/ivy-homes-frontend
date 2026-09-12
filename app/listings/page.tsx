'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';
import { Search, MapPin, Bed, IndianRupee, Loader2, SlidersHorizontal, ChevronDown } from 'lucide-react';

export default function ListingsPage() {
  const [summary, setSummary] = useState<any>({ total_listings: 3500, median_price: 11200000, median_price_per_sqft: 26670 });
  const [listings, setListings] = useState<any[]>([]);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingListings, setLoadingListings] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Base Filters
  const [searchName, setSearchName] = useState('');
  const [filterLocality, setFilterLocality] = useState('');
  const [filterBhk, setFilterBhk] = useState('');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(50000000);

  // Advanced Filters
  const [filterPropType, setFilterPropType] = useState('');
  const [filterBath, setFilterBath] = useState('');
  const [filterFacing, setFilterFacing] = useState('');
  const [filterPostedBy, setFilterPostedBy] = useState('');

  useEffect(() => {
    fetchApi('/v1/analytics/summary').then(setSummary).catch(() => {});
    
    const savedState = sessionStorage.getItem('nexus_feed_state_v2');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      setListings(parsed.listings);
      setPage(parsed.page);
      setTotalPages(parsed.totalPages);
      setSearchName(parsed.searchName || '');
      setFilterLocality(parsed.filterLocality || '');
      setFilterBhk(parsed.filterBhk || '');
      setMinPrice(parsed.minPrice || 0);
      setMaxPrice(parsed.maxPrice || 50000000);
      setFilterPropType(parsed.filterPropType || '');
      setFilterBath(parsed.filterBath || '');
      setFilterFacing(parsed.filterFacing || '');
      setFilterPostedBy(parsed.filterPostedBy || '');
      setInitialLoad(false);
    } else {
      loadListings(1);
    }
  }, []);

  useEffect(() => {
    if (!initialLoad) {
      sessionStorage.setItem('nexus_feed_state_v2', JSON.stringify({
        listings, page, totalPages, searchName, filterLocality, filterBhk, 
        minPrice, maxPrice, filterPropType, filterBath, filterFacing, filterPostedBy
      }));
    }
  }, [listings, page, totalPages, searchName, filterLocality, filterBhk, minPrice, maxPrice, filterPropType, filterBath, filterFacing, filterPostedBy, initialLoad]);

  const loadListings = async (targetPage: number) => {
    setLoadingListings(true);
    try {
      const offset = (targetPage - 1) * 50;
      const data = await fetchApi(`/v1/listings?offset=${offset}&limit=50`);
      setListings(data.results || data.data || []);
      setPage(targetPage);
      setTotalPages(Math.ceil(3500 / 50)); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingListings(false);
      setInitialLoad(false);
    }
  };

  const displayedListings = listings.filter(l => {
    const nameMatch = (l.apartment_name || l.property_type || '').toLowerCase();
    if (searchName && !nameMatch.includes(searchName.toLowerCase())) return false;
    if (filterLocality && !l.locality?.toLowerCase().includes(filterLocality.toLowerCase())) return false;
    if (filterBhk && l.bedroom?.toString() !== filterBhk) return false;
    if (l.price < minPrice || l.price > maxPrice) return false;
    if (filterPropType && l.property_type !== filterPropType) return false;
    if (filterBath && l.bathroom?.toString() !== filterBath) return false;
    if (filterFacing && l.facing_direction !== filterFacing) return false;
    if (filterPostedBy && l.posted_by !== filterPostedBy) return false;
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <section className="bg-gray-900/60 p-6 rounded-2xl border border-gray-800 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
            <input type="text" placeholder="Search property name..." value={searchName} onChange={(e) => setSearchName(e.target.value)} className="w-full bg-gray-950 border border-gray-700 text-white pl-10 pr-4 py-2.5 rounded-xl focus:border-cyan-500 outline-none" />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
            <input type="text" placeholder="Filter Locality..." value={filterLocality} onChange={(e) => setFilterLocality(e.target.value)} className="w-full bg-gray-950 border border-gray-700 text-white pl-10 pr-4 py-2.5 rounded-xl focus:border-cyan-500 outline-none" />
          </div>
          <div className="relative">
            <Bed className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
            <select value={filterBhk} onChange={(e) => setFilterBhk(e.target.value)} className="w-full bg-gray-950 border border-gray-700 text-white pl-10 pr-4 py-2.5 rounded-xl focus:border-cyan-500 outline-none appearance-none">
              <option value="">Any Configuration</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4+ BHK</option>
            </select>
          </div>
        </div>

        {/* Dual Slider */}
        <div className="border-t border-gray-800 pt-6 mb-6">
          <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-400 uppercase">
            <SlidersHorizontal size={16} /> Price Range
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 w-full relative h-2 bg-gray-800 rounded-full">
               <input type="range" min="0" max="100000000" step="100000" value={minPrice} onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice - 100000))} className="absolute w-full top-0 appearance-none bg-transparent pointer-events-auto h-2 z-20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400" />
               <input type="range" min="0" max="100000000" step="100000" value={maxPrice} onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice + 100000))} className="absolute w-full top-0 appearance-none bg-transparent pointer-events-auto h-2 z-30 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500" />
               <div className="absolute h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full z-10" style={{ left: `${(minPrice / 100000000) * 100}%`, right: `${100 - (maxPrice / 100000000) * 100}%` }} />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                <input type="number" value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value))} className="w-32 bg-gray-950 border border-gray-700 text-white pl-8 pr-2 py-2 rounded-lg text-sm focus:border-cyan-500 outline-none" />
              </div>
              <span className="text-gray-600">to</span>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-32 bg-gray-950 border border-gray-700 text-white pl-8 pr-2 py-2 rounded-lg text-sm focus:border-cyan-500 outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-cyan-400 text-sm font-semibold hover:text-cyan-300 transition-colors">
          <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} /> 
          {showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-800">
            <select value={filterPropType} onChange={(e) => setFilterPropType(e.target.value)} className="bg-gray-950 border border-gray-700 text-white px-4 py-2 rounded-lg focus:border-cyan-500 outline-none">
              <option value="">Property Type</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="independent house">Independent House</option>
            </select>
            <select value={filterBath} onChange={(e) => setFilterBath(e.target.value)} className="bg-gray-950 border border-gray-700 text-white px-4 py-2 rounded-lg focus:border-cyan-500 outline-none">
              <option value="">Bathrooms</option>
              <option value="1">1 Bath</option>
              <option value="2">2 Baths</option>
              <option value="3">3 Baths</option>
              <option value="4">4+ Baths</option>
            </select>
            <select value={filterFacing} onChange={(e) => setFilterFacing(e.target.value)} className="bg-gray-950 border border-gray-700 text-white px-4 py-2 rounded-lg focus:border-cyan-500 outline-none">
              <option value="">Facing Direction</option>
              <option value="north">North</option>
              <option value="south">South</option>
              <option value="east">East</option>
              <option value="west">West</option>
              <option value="north-east">North-East</option>
            </select>
            <select value={filterPostedBy} onChange={(e) => setFilterPostedBy(e.target.value)} className="bg-gray-950 border border-gray-700 text-white px-4 py-2 rounded-lg focus:border-cyan-500 outline-none">
              <option value="">Listed By</option>
              <option value="owner">Owner</option>
              <option value="agent">Agent</option>
              <option value="builder">Builder</option>
            </select>
          </div>
        )}
      </section>

      <section className="relative min-h-[400px]">
        {loadingListings ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950/50 backdrop-blur-sm z-10 rounded-2xl">
            <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedListings.map(listing => (
            <Link href={`/listings/${listing.listing_id}`} key={listing.listing_id}>
              <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800 hover:border-cyan-500/50 hover:bg-gray-900 transition-all cursor-pointer group h-full flex flex-col shadow-lg">
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
      </section>
    </div>
  );
}