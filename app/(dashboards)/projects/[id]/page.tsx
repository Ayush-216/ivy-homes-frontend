'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Building2, MapPin, IndianRupee, Loader2, Calendar, CheckCircle } from 'lucide-react';

export default function ProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi(`/v1/projects/${params.id}`)
      .then(setProject)
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

  if (!project) return <div className="p-8 text-red-500 text-center">Project record not found.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="text-cyan-500 hover:text-cyan-400 font-semibold mb-2 flex items-center gap-2">
        ← Return to Projects
      </button>
      
      <div className="bg-[#0a0a0a] p-10 rounded-2xl border border-gray-800 shadow-[0_0_30px_rgba(6,182,212,0.05)] relative overflow-hidden">
        
        <div className="mt-4 mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-purple-900/40 text-purple-400 border border-purple-800/50 px-3 py-1 rounded text-sm font-bold uppercase">
              {project.project_status}
            </span>
            <span className="bg-blue-900/40 text-blue-400 border border-blue-800/50 px-3 py-1 rounded text-sm font-bold">
              ID: {project.project_id}
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">{project.apartment_name}</h1>
          <p className="text-cyan-400 text-xl capitalize font-medium flex items-center gap-2">
            <MapPin size={20} /> {project.locality}
          </p>
        </div>

        {/* Primary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-gray-900/50 rounded-xl border border-gray-800 mb-10">
          <div className="col-span-2">
            <p className="text-gray-500 text-sm mb-1 uppercase">Price Range</p>
            <p className="text-2xl font-bold text-green-400 flex items-center gap-1">
              <IndianRupee size={24} />
              {(project.price_min * 10000000).toLocaleString()} - {(project.price_max * 10000000).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1 uppercase">Area Range</p>
            <p className="text-2xl font-bold text-white">{project.min_area_sqft} - {project.max_area_sqft} <span className="text-sm font-normal text-gray-400">sqft</span></p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1 uppercase">Active Listings</p>
            <p className="text-2xl font-bold text-white">{project.total_listings}</p>
          </div>
        </div>

        {/* Detailed Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
          <div>
            <h3 className="text-lg font-bold text-gray-200 mb-4 border-b border-gray-800 pb-2 flex items-center gap-2">
              <Building2 size={20} className="text-cyan-500" /> Infrastructure
            </h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex justify-between border-b border-gray-800/50 pb-2"><span className="text-gray-500">Developer</span> <span className="font-semibold text-white">{project.developer_name}</span></li>
              <li className="flex justify-between border-b border-gray-800/50 pb-2"><span className="text-gray-500">Total Units</span> <span className="font-semibold">{project.total_units}</span></li>
              <li className="flex justify-between border-b border-gray-800/50 pb-2"><span className="text-gray-500">Total Towers</span> <span className="font-semibold">{project.total_towers}</span></li>
              <li className="flex justify-between pb-2"><span className="text-gray-500">Total Floors</span> <span className="font-semibold">{project.total_floors}</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-200 mb-4 border-b border-gray-800 pb-2 flex items-center gap-2">
              <Calendar size={20} className="text-cyan-500" /> Timelines & Legal
            </h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex justify-between border-b border-gray-800/50 pb-2"><span className="text-gray-500">Launch Date</span> <span className="font-semibold">{project.launch_date}</span></li>
              <li className="flex justify-between border-b border-gray-800/50 pb-2"><span className="text-gray-500">Possession</span> <span className="font-semibold">{project.possession_date}</span></li>
              <li className="flex justify-between border-b border-gray-800/50 pb-2"><span className="text-gray-500">RERA ID</span> <span className="font-mono text-sm">{project.rera_number}</span></li>
              <li className="flex justify-between pb-2"><span className="text-gray-500">Coordinates</span> <span className="font-mono text-xs">{project.latitude}, {project.longitude}</span></li>
            </ul>
          </div>
        </div>

        {/* Amenities */}
        {project.amenities && project.amenities.length > 0 && (
          <div className="border-t border-gray-800 pt-8">
            <h3 className="text-lg font-bold text-gray-200 mb-4">Project Amenities</h3>
            <div className="flex flex-wrap gap-3">
              {project.amenities.map((amenity: string, idx: number) => (
                <span key={idx} className="bg-gray-900 border border-gray-800 px-4 py-2 rounded-full text-sm text-gray-300 capitalize flex items-center gap-2">
                  <CheckCircle size={14} className="text-cyan-500" /> {amenity}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}