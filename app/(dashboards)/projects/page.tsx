'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';
import { IndianRupee, MapPin, Building2, Loader2 } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  // Restore state from session storage on mount
  useEffect(() => {
    const savedState = sessionStorage.getItem('nexus_projects_state_v1');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      setProjects(parsed.projects);
      setPage(parsed.page);
      setTotalPages(parsed.totalPages);
      setInitialLoad(false);
      setLoading(false);
    } else {
      loadProjects(1);
    }
  }, []);

  // Save state to session storage whenever it changes
  useEffect(() => {
    if (!initialLoad) {
      sessionStorage.setItem('nexus_projects_state_v1', JSON.stringify({
        projects, page, totalPages
      }));
    }
  }, [projects, page, totalPages, initialLoad]);

  const loadProjects = async (targetPage: number) => {
    setLoading(true);
    try {
      const offset = (targetPage - 1) * 50;
      const data = await fetchApi(`/v1/projects?offset=${offset}&limit=50`);
      setProjects(data.results || data.data || []);
      setPage(targetPage);
      setTotalPages(Math.ceil((data.total || 300) / 50)); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const getPaginationGroup = () => {
    let pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages = [1, 2, 3, 4, '...', totalPages - 1, totalPages];
      } else if (page >= totalPages - 2) {
        pages = [1, 2, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, '...', page - 1, page, page + 1, '...', totalPages];
      }
    }
    return pages;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
        <Building2 className="text-cyan-400" /> New Projects
      </h1>
      
      <section className="relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950/50 backdrop-blur-sm z-10 rounded-2xl">
            <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Link href={`/projects/${project.project_id}`} key={project.project_id}>
              <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800 hover:border-cyan-500/50 hover:bg-gray-900 transition-all cursor-pointer group h-full flex flex-col shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-100 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_5px_rgba(6,182,212,0.8)] transition-all">
                    {project.apartment_name}
                  </h3>
                  <span className="bg-purple-900/30 text-purple-400 border border-purple-800/50 text-xs px-2.5 py-1 rounded-md font-semibold shrink-0 uppercase tracking-wider">
                    {project.project_status}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-6 capitalize flex items-center gap-1.5">
                  <MapPin size={14} className="text-gray-500" /> {project.locality}
                </p>
                <div className="space-y-2 mb-6 flex-1">
                  <p className="text-sm text-gray-400">Developer: <span className="text-gray-200">{project.developer_name}</span></p>
                  <p className="text-sm text-gray-400">Total Units: <span className="text-gray-200">{project.total_units}</span></p>
                </div>
                <div className="border-t border-gray-800/50 pt-4 mt-auto">
                  <p className="text-xs text-gray-500 mb-1">Price Range</p>
                  <p className="font-bold text-green-400 text-lg flex items-center gap-1 drop-shadow-[0_0_3px_rgba(74,222,128,0.4)]">
                    <IndianRupee size={16} />
                    {(project.price_min * 10000000).toLocaleString()} - {(project.price_max * 10000000).toLocaleString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-2 pb-10">
          <button 
            disabled={page === 1}
            onClick={() => loadProjects(page - 1)}
            className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-cyan-500 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            Prev
          </button>
          
          <div className="flex items-center gap-1">
            {getPaginationGroup().map((item, index) => (
              <button
                key={index}
                disabled={item === '...'}
                onClick={() => typeof item === 'number' && loadProjects(item)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-all ${
                  item === page 
                    ? 'bg-cyan-500 text-gray-950 shadow-[0_0_15px_rgba(6,182,212,0.6)] font-bold' 
                    : item === '...' 
                      ? 'text-gray-600 cursor-default' 
                      : 'bg-gray-900 border border-gray-800 text-gray-400 hover:border-cyan-500 hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <button 
            disabled={page === totalPages}
            onClick={() => loadProjects(page + 1)}
            className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-cyan-500 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}