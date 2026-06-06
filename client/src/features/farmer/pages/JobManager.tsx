import React, { useState, useEffect } from 'react';
import { Plus, Briefcase, CheckCircle2, XCircle, Clock, ShieldCheck, MapPin } from 'lucide-react';
import { api } from '../../../lib/api';

interface JobApplication {
  _id: string;
  driverId: {
    _id: string;
    name: string;
    phone: string;
  };
  status: 'pending' | 'verified_by_admin' | 'accepted' | 'rejected';
  appliedAt: string;
}

interface Job {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'open' | 'closed' | 'filled' | 'rejected';
  expiresAt: string;
  applications?: JobApplication[];
}

export default function JobManager() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', description: '' });
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs');
      setJobs(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    try {
      await api.post('/jobs', newJob);
      setShowCreateModal(false);
      setNewJob({ title: '', description: '' });
      fetchJobs();
    } catch (err: any) {
      console.error("Job Creation Error:", err);
      const exactError = err.response?.data?.message || err.message || JSON.stringify(err);
      setModalError(`Error: ${exactError}`);
    }
  };

  const fetchApplications = async (jobId: string) => {
    setActiveJobId(jobId);
    setLoadingApps(true);
    try {
      const res = await api.get(`/jobs/${jobId}/applications`);
      setApplications(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleApplicationAction = async (appId: string, action: 'accept' | 'reject') => {
    try {
      await api.patch(`/jobs/${activeJobId}/applications/${appId}/${action}`);
      fetchApplications(activeJobId!); // Refresh applications
      if (action === 'accept') {
        fetchJobs(); // Job status might have changed to filled
      }
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to ${action} application`);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Delivery Jobs</h1>
          <p className="text-sm text-slate-500">Post delivery opportunities and hire drivers.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Post a Job
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jobs List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-semibold text-slate-700 mb-2">Your Postings</h2>
          {loading ? (
            <div className="text-center py-10 text-slate-400">Loading...</div>
          ) : jobs.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-slate-500">
              No jobs posted yet.
            </div>
          ) : (
            jobs.map(job => (
              <div 
                key={job._id}
                onClick={() => fetchApplications(job._id)}
                className={`bg-white border rounded-2xl p-4 cursor-pointer transition-all ${activeJobId === job._id ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300 hover:shadow-sm'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800">{job.title}</h3>
                  {job.status === 'pending' && <span className="bg-amber-100 text-amber-700 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-lg font-black whitespace-nowrap">Under Review</span>}
                  {job.status === 'rejected' && <span className="bg-red-100 text-red-700 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-lg font-black whitespace-nowrap">Request Declined</span>}
                  {job.status === 'open' && <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-lg font-black whitespace-nowrap">Active Posting</span>}
                  {job.status === 'filled' && <span className="bg-blue-100 text-blue-700 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-lg font-black whitespace-nowrap">Position Filled</span>}
                  {job.status === 'closed' && <span className="bg-slate-100 text-slate-600 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-lg font-black whitespace-nowrap">Posting Closed</span>}
                </div>
                <p className="text-sm text-slate-500 line-clamp-2">{job.description}</p>
              </div>
            ))
          )}
        </div>

        {/* Applications List */}
        <div className="lg:col-span-2">
          {activeJobId ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 min-h-[400px]">
              <h2 className="font-semibold text-slate-700 mb-4">Driver Applications</h2>
              {jobs.find(j => j._id === activeJobId)?.status === 'pending' ? (
                <div className="text-center py-20 flex flex-col items-center">
                  <ShieldCheck className="h-12 w-12 text-amber-300 mb-3" />
                  <p className="text-slate-500 font-medium">Job Pending Approval</p>
                  <p className="text-sm text-slate-400 mt-1 max-w-sm">Your job request has been sent to the Super Admin. Once approved, it will be visible to drivers and applications will appear here.</p>
                </div>
              ) : jobs.find(j => j._id === activeJobId)?.status === 'rejected' ? (
                <div className="text-center py-20 flex flex-col items-center">
                  <XCircle className="h-12 w-12 text-rose-300 mb-3" />
                  <p className="text-slate-500 font-medium">Job Request Rejected</p>
                  <p className="text-sm text-slate-400 mt-1 max-w-sm">The Super Admin has declined this job posting request.</p>
                </div>
              ) : loadingApps ? (
                <div className="text-center py-10 text-slate-400">Loading applications...</div>
              ) : applications.filter(a => a.status !== 'pending').length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center">
                  <ShieldCheck className="h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium">No verified applications yet.</p>
                  <p className="text-sm text-slate-400 mt-1 max-w-sm">When drivers apply, the Super Admin will verify them first. Once verified, they will appear here for your final approval.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.filter(a => a.status !== 'pending').map(app => (
                    <div key={app._id} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between bg-slate-50/50">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-800">{app.driverId.name}</h4>
                          {app.status === 'verified_by_admin' && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                              <ShieldCheck className="w-3 h-3" /> Admin Verified
                            </span>
                          )}
                          {app.status === 'accepted' && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Hired
                            </span>
                          )}
                          {app.status === 'rejected' && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3" /> Rejected
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{app.driverId.phone}</p>
                      </div>
                      
                      {app.status === 'verified_by_admin' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleApplicationAction(app._id, 'reject')}
                            className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                          >
                            Reject
                          </button>
                          <button 
                            onClick={() => handleApplicationAction(app._id, 'accept')}
                            className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                          >
                            Hire Driver
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 h-full flex items-center justify-center text-slate-400">
              Select a job to view applications.
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Post Delivery Job</h3>
            
            {modalError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={newJob.title}
                  onChange={e => setNewJob({...newJob, title: e.target.value})}
                  placeholder="e.g. Morning Shift Driver Needed"
                  className="w-full border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  value={newJob.description}
                  onChange={e => setNewJob({...newJob, description: e.target.value})}
                  placeholder="Describe the route, schedule, and pay..."
                  className="w-full border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md"
                >
                  Post Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
