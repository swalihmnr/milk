import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Briefcase, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';

interface Job {
  _id: string;
  farmerId: {
    _id: string;
    name: string;
    farmName?: string;
    phone: string;
  };
  title: string;
  description: string;
  expiresAt: string;
  location: {
    coordinates: [number, number]; // [lon, lat]
  };
  createdAt: string;
}

export default function JobBoard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());

  const fetchNearbyJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/jobs/nearby');
      setJobs(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch nearby jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyJobs();
  }, []);

  const handleApply = async (jobId: string) => {
    setApplyingTo(jobId);
    try {
      await api.post(`/jobs/${jobId}/apply`);
      setAppliedJobs(new Set([...appliedJobs, jobId]));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to apply for job');
    } finally {
      setApplyingTo(null);
    }
  };

  // Helper to format distance (assuming we have user's location, we'd calculate it. For now, just show coordinates)
  const formatLocation = (lon: number, lat: number) => {
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  };

  if (!user?.lat || !user?.lon) {
    return (
      <div className="bg-slate-900 min-h-screen text-white p-5 flex flex-col items-center justify-center">
        <MapPin className="h-12 w-12 text-slate-600 mb-4" />
        <h2 className="text-xl font-bold mb-2">Location Required</h2>
        <p className="text-slate-400 text-center max-w-sm mb-6">
          To find delivery jobs near you, please update your profile with your location coordinates.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 min-h-screen text-white flex flex-col pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-800 border-b border-slate-700 px-5 py-4 flex items-center justify-between shadow-md">
        <div>
          <h1 className="font-black text-xl tracking-tight">Job Board</h1>
          <p className="text-slate-400 text-xs mt-0.5">Find delivery opportunities near you</p>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-4">
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-center text-red-400 font-bold text-sm">
            {error}
          </div>
        ) : jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => {
              const isApplied = appliedJobs.has(job._id);
              return (
                <div 
                  key={job._id} 
                  className="bg-slate-800 border border-slate-700/60 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300"
                >
                  <div className="mb-4">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-1">
                      New Opportunity
                    </span>
                    <h3 className="font-extrabold text-lg text-white">
                      {job.title}
                    </h3>
                    <p className="text-slate-300 text-sm mt-2 font-medium">
                      {job.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-4 pb-4 border-b border-slate-700/50">
                    <Briefcase className="h-4 w-4 shrink-0 text-slate-500" />
                    <span className="font-semibold text-slate-300">{job.farmerId.farmName || job.farmerId.name}</span>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col text-xs text-slate-400">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Location</span>
                      <span className="font-semibold text-slate-300 mt-0.5">
                        {formatLocation(job.location.coordinates[0], job.location.coordinates[1])}
                      </span>
                    </div>

                    <button 
                      onClick={() => handleApply(job._id)}
                      disabled={isApplied || applyingTo === job._id}
                      className={`h-10 px-5 text-xs font-black rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md ${
                        isApplied 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-amber-500/10'
                      }`}
                    >
                      {applyingTo === job._id ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Applying...</>
                      ) : isApplied ? (
                        <><CheckCircle2 className="h-4 w-4" /> Applied</>
                      ) : (
                        <><Navigation className="h-3.5 w-3.5 fill-slate-900" /> Apply Now</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-800/40 rounded-3xl border border-slate-800/80 p-5 flex flex-col items-center">
            <MapPin className="h-12 w-12 text-slate-600 mb-3" />
            <p className="text-slate-400 font-bold text-sm">No jobs available near your location right now.</p>
            <p className="text-slate-500 text-xs mt-2">Check back later for new opportunities!</p>
          </div>
        )}
      </div>
    </div>
  );
}
