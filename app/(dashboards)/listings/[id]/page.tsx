'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, ShieldAlert } from 'lucide-react';

export default function ListingDetail() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  
  // State to hold whichever endpoint actually works
  const [workingEndpoint, setWorkingEndpoint] = useState<string | null>(null);

  useEffect(() => {
    // 1. Fetch listing details
    fetchApi(`/v1/listings/${params.id}`)
      .then(setListing)
      .catch(console.error)
      .finally(() => setLoading(false));

    // 2. Automate Hypothesis Testing (The Prober)
    const probeForEndpoint = async () => {
      const hypotheses = [
        '/v1/saved', 
        '/v1/saved_listings', 
        '/v1/bookmarks', 
        '/v1/me/favourites',
        '/v1/users/me/favourites'
      ];

      for (const path of hypotheses) {
        try {
          // If this throws 404, the catch block swallows it and loops to the next
          const data = await fetchApi(path);
          
          console.log(`%c✅ DISCOVERED HIDDEN ENDPOINT: ${path}`, 'color: #4ade80; font-size: 16px; font-weight: bold;');
          
          setWorkingEndpoint(path);
          setSaved((data.results || data.data || []).some((fav: any) => fav.listing_id === params.id || fav.id === params.id));
          return; // Stop probing once we find it!
        } catch (e) {
          console.log(`❌ Hypothesis failed: ${path}`);
        }
      }
      console.warn("All endpoint hypotheses failed. The lie is deeper.");
    };

    probeForEndpoint();
  }, [params.id]);

  const toggleSave = async () => {
    if (!workingEndpoint) {
      alert("Still searching for the correct API endpoint...");
      return;
    }

    try {
      if (saved) {
        await fetchApi(`${workingEndpoint}/${params.id}`, { method: 'DELETE' });
        setSaved(false);
      } else {
        // We will try sending BOTH 'id' and 'listing_id' just in case the payload is also documented wrong
        await fetchApi(workingEndpoint, { 
          method: 'POST', 
          body: JSON.stringify({ id: params.id, listing_id: params.id }) 
        });
        setSaved(true);
      }
    } catch (err) { 
      console.error("Save toggle failed on discovered endpoint", err); 
    }
  };

  if (loading) return null;
  if (!listing) return <div className="p-8 text-red-500">Record not found.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="text-cyan-500 hover:text-cyan-400 font-semibold mb-2 flex items-center gap-2">← Return to Nexus Feed</button>
      
      <div className="bg-[#0a0a0a] p-10 rounded-2xl border border-gray-800 shadow-[0_0_30px_rgba(6,182,212,0.05)] relative overflow-hidden">
        
        {/* Verification Banner */}
        <div className={`absolute top-0 left-0 w-full py-1.5 text-center text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 ${listing.is_verified ? 'bg-green-500/20 text-green-400 border-b border-green-500/30' : 'bg-orange-500/20 text-orange-400 border-b border-orange-500/30'}`}>
          {listing.is_verified ? <><CheckCircle size={14}/> Verified Record</> : <><ShieldAlert size={14}/> Unverified Record</>}
        </div>

        <button 
          onClick={toggleSave} 
          disabled={!workingEndpoint}
          className={`absolute top-10 right-10 px-6 py-2.5 rounded-lg font-bold transition-all shadow-lg ${saved ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500 shadow-cyan-500/20' : 'bg-gray-900 text-gray-400 border border-gray-700 hover:border-cyan-500 hover:text-white disabled:opacity-50'}`}
        >
          {!workingEndpoint ? 'Probing API...' : saved ? '★ Bookmarked' : '☆ Bookmark'}
        </button>

        <div className="mt-8 mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-blue-900/40 text-blue-400 border border-blue-800/50 px-3 py-1 rounded text-sm font-bold uppercase">{listing.property_type}</span>
            {listing.project_id && <span className="bg-purple-900/40 text-purple-400 border border-purple-800/50 px-3 py-1 rounded text-sm font-bold">Project: {listing.project_id}</span>}
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">{listing.apartment_name || 'Independent Property'}</h1>
          <p className="text-cyan-400 text-xl capitalize font-medium">{listing.locality}</p>
        </div>

        {/* Primary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-gray-900/50 rounded-xl border border-gray-800 mb-10">
          <div><p className="text-gray-500 text-sm mb-1 uppercase">Asking Price</p><p className="text-2xl font-bold text-green-400">₹{listing.price.toLocaleString()}</p></div>
          <div><p className="text-gray-500 text-sm mb-1 uppercase">Configuration</p><p className="text-2xl font-bold text-white">{listing.bedroom} BHK</p></div>
          <div><p className="text-gray-500 text-sm mb-1 uppercase">Carpet Area</p><p className="text-2xl font-bold text-white">{listing.carpet_area} <span className="text-sm font-normal text-gray-400">sqft</span></p></div>
          <div><p className="text-gray-500 text-sm mb-1 uppercase">Super Built-up</p><p className="text-2xl font-bold text-gray-300">{listing.super_built_up_area || '-'} <span className="text-sm font-normal text-gray-500">sqft</span></p></div>
        </div>

        {/* Detailed Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
          <div>
            <h3 className="text-lg font-bold text-gray-200 mb-4 border-b border-gray-800 pb-2">Infrastructure & Layout</h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex justify-between border-b border-gray-800/50 pb-2"><span className="text-gray-500">Bathrooms</span> <span className="font-semibold">{listing.bathroom}</span></li>
              <li className="flex justify-between border-b border-gray-800/50 pb-2"><span className="text-gray-500">Balconies</span> <span className="font-semibold">{listing.balcony}</span></li>
              <li className="flex justify-between border-b border-gray-800/50 pb-2"><span className="text-gray-500">Floor Level</span> <span className="font-semibold">{listing.floor} of {listing.total_floors}</span></li>
              <li className="flex justify-between border-b border-gray-800/50 pb-2"><span className="text-gray-500">Facing</span> <span className="font-semibold capitalize">{listing.facing_direction}</span></li>
              <li className="flex justify-between border-b border-gray-800/50 pb-2"><span className="text-gray-500">Covered Parking</span> <span className="font-semibold">{listing.covered_parking}</span></li>
              <li className="flex justify-between pb-2"><span className="text-gray-500">Furnishing</span> <span className="font-semibold capitalize text-cyan-400">{listing.furnishing}</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-200 mb-4 border-b border-gray-800 pb-2">Metadata & Source</h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex justify-between border-b border-gray-800/50 pb-2"><span className="text-gray-500">Listing ID</span> <span className="font-mono text-sm">{listing.listing_id}</span></li>
              <li className="flex justify-between border-b border-gray-800/50 pb-2"><span className="text-gray-500">Source Website</span> <span className="font-semibold capitalize">{listing.website}</span></li>
              <li className="flex justify-between border-b border-gray-800/50 pb-2"><span className="text-gray-500">Coordinates</span> <span className="font-mono text-xs">{listing.latitude}, {listing.longitude}</span></li>
              <li className="flex justify-between border-b border-gray-800/50 pb-2"><span className="text-gray-500">Status</span> <span className={`font-bold ${listing.is_live ? 'text-green-400' : 'text-red-400'}`}>{listing.is_live ? 'Active' : 'Archived'}</span></li>
              <li className="flex justify-between pb-2"><span className="text-gray-500">Posted At</span> <span className="font-semibold">{new Date(listing.posted_at).toLocaleDateString()}</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mb-10">
          <h3 className="text-lg font-bold text-gray-200 mb-4">Remarks</h3>
          <p className="text-gray-400 leading-relaxed bg-gray-900/30 p-6 rounded-xl border border-gray-800/50 italic">"{listing.description}"</p>
        </div>

        <div className="flex items-center justify-between bg-cyan-950/20 border border-cyan-900/50 p-6 rounded-xl">
          <div>
            <p className="text-sm text-cyan-500/70 uppercase tracking-widest font-bold mb-1">Point of Contact</p>
            <p className="text-xl font-bold text-cyan-100">{listing.posted_by_name} <span className="text-sm font-normal text-gray-400 capitalize">({listing.posted_by})</span></p>
          </div>
          <div className="text-right">
            <a href={`tel:${listing.posted_by_contact}`} className="inline-block bg-cyan-500 text-gray-950 font-extrabold px-6 py-3 rounded-lg hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              {listing.posted_by_contact}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}