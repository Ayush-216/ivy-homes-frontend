'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Key, MapPin, IndianRupee, Loader2 } from 'lucide-react';

export default function RentalDetail() {
  const params = useParams();
  const router = useRouter();
  const [rental, setRental] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi(`/v1/rentals/${params.id}`)
      .then(setRental)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
      </div>
    );
  }

  if (!rental) return <div className="p-8 text-red-500 text-center">Rental record not found.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="text-cyan-500 hover:text-cyan-400 font-semibold mb-2 flex items-center gap-2">
        ← Return to Rentals
      </button>
      
      <div className="bg-[#0a0a0a] p-10 rounded-2xl border border-gray-800 shadow-[0_0_30px_rgba(6,182,212,0.05)] relative overflow-hidden">
        
        <div className="mt-4 mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-green-900/40 text-green-400 border border-green-800/50 px-3 py-1 rounded text-sm font-bold uppercase">
              {rental.property_type}
            </span>
            <span className="bg-blue-900/40 text-blue-400 border border-blue-800/50 px-3 py-1 rounded text-sm font-bold">
              ID: {rental.listing_id}
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">{rental.title}</h1>
          <p className="text-cyan-400 text-xl capitalize font-medium flex items-center gap-2">
            <MapPin size={20} /> {rental.locality}
            {rental.apartment_name && <span className="text-gray-500 text-sm ml-2">({rental.apartment_name})</span>}
          </p>
        </div>

        {/* Primary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-gray-900/50 rounded-xl border border-gray-800 mb-10">
          <div>
            <p className="text-gray-500 text-sm mb-1 uppercase">Monthly Rent</p>
            <p className="text-2xl font-bold text-green-400 flex items-center gap-1">
              <IndianRupee size={20} />{rental.price?.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1 uppercase">Deposit</p>
            <p className="text-2xl font-bold text-gray-300 flex items-center gap-1">
              <IndianRupee size={20} />{rental.deposit?.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1 uppercase">Configuration</p>
            <p className="text-2xl font-bold text-white">{rental.bedroom} BHK</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1 uppercase">Carpet Area</p>
            <p className="text-2xl font-bold text-white">{rental.carpet_area} <span className="text-sm font-normal text-gray-400">sqft</span></p>
          </div>
        </div>

        {/* Detailed Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
          <div>
            <h3 className="text-lg font-bold text-gray-200 mb-4 border-b border-gray-800 pb-2 flex items-center gap-2">
              <Key size={20} className="text-cyan-500" /> Rental Details
            </h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex justify-between border-b border-gray-800/50 pb-2"><span className="text-gray-500">Furnishing</span> <span className="font-semibold capitalize text-cyan-400">{rental.furnishing}</span></li>
              <li className="flex justify-between border-b border-gray-800/50 pb-2"><span className="text-gray-500">Bathrooms</span> <span className="font-semibold">{rental.bathroom}</span></li>
              <li className="flex justify-between border-b border-gray-800/50 pb-2"><span className="text-gray-500">Floor Level</span> <span className="font-semibold">{rental.floor} of {rental.total_floors}</span></li>
              <li className="flex justify-between pb-2"><span className="text-gray-500">Facing</span> <span className="font-semibold capitalize">{rental.facing_direction}</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-200 mb-4 border-b border-gray-800 pb-2">Source & Metadata</h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex justify-between border-b border-gray-800/50 pb-2"><span className="text-gray-500">Posted By</span> <span className="font-semibold capitalize">{rental.posted_by}</span></li>
              <li className="flex justify-between border-b border-gray-800/50 pb-2"><span className="text-gray-500">Source</span> <span className="font-semibold capitalize">{rental.website}</span></li>
              <li className="flex justify-between border-b border-gray-800/50 pb-2"><span className="text-gray-500">Coordinates</span> <span className="font-mono text-xs">{rental.latitude}, {rental.longitude}</span></li>
              <li className="flex justify-between pb-2"><span className="text-gray-500">Posted At</span> <span className="font-semibold">{new Date(rental.posted_at).toLocaleDateString()}</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mb-10">
          <h3 className="text-lg font-bold text-gray-200 mb-4">Description</h3>
          <p className="text-gray-400 leading-relaxed bg-gray-900/30 p-6 rounded-xl border border-gray-800/50 italic">"{rental.description}"</p>
        </div>

        <div className="flex items-center justify-between bg-cyan-950/20 border border-cyan-900/50 p-6 rounded-xl">
          <div>
            <p className="text-sm text-cyan-500/70 uppercase tracking-widest font-bold mb-1">Point of Contact</p>
            <p className="text-xl font-bold text-cyan-100">{rental.posted_by_name} <span className="text-sm font-normal text-gray-400 capitalize">({rental.posted_by})</span></p>
          </div>
          <div className="text-right">
            <a href={`tel:${rental.posted_by_contact}`} className="inline-block bg-cyan-500 text-gray-950 font-extrabold px-6 py-3 rounded-lg hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              {rental.posted_by_contact}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}