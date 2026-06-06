import React, { useEffect, useState } from 'react';
import { Truck, MapPin, Clock, CheckCircle2, XCircle, AlertCircle, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';
import toast from 'react-hot-toast';

export default function JobApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/jobs/applications/me');
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (appId: string) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    
    try {
      await api.delete(`/jobs/applications/${appId}`);
      toast.success('Application withdrawn successfully');
      setApplications(prev => prev.filter(app => app._id !== appId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to withdraw application');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" /> Hired!
          </span>
        );
      case 'verified_by_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
            <XCircle className="h-3.5 w-3.5" /> Rejected
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
            <Clock className="h-3.5 w-3.5" /> Pending Review
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-screen bg-slate-50">
        <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold text-sm">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-24 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-slate-200 sticky top-0 z-10 flex items-center gap-4">
        <button onClick={() => navigate('/my-app/profile')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-slate-700" />
        </button>
        <div>
          <h1 className="font-black text-lg text-slate-900 tracking-tight">Driver Applications</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your Gig History</p>
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-4">
        {applications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center flex flex-col items-center shadow-sm">
            <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-4">
              <Truck className="h-8 w-8" />
            </div>
            <h3 className="font-black text-slate-900 mb-2">No Applications Yet</h3>
            <p className="text-slate-500 text-sm font-medium max-w-sm mb-6">
              You haven't applied for any delivery gigs yet. Start earning by picking up local delivery jobs!
            </p>
            <button 
              onClick={() => navigate('/delivery-app/jobs')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-6 py-3 rounded-xl shadow-md transition-all active:scale-95"
            >
              Browse Delivery Jobs
            </button>
          </div>
        ) : (
          applications.map(app => (
            <div key={app._id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              {/* Top Accent line based on status */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${app.status === 'accepted' ? 'bg-emerald-500' : app.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'}`} />
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-black text-slate-900 text-lg tracking-tight mb-1">
                    {app.jobId?.title || 'Delivery Job'}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Farm: {app.jobId?.farmerId?.farmName || app.jobId?.farmerId?.name || 'Unknown Farm'}</span>
                  </div>
                </div>
                {getStatusBadge(app.status)}
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4">
                <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                  {app.jobId?.description || 'No description available for this job.'}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Applied on {new Date(app.createdAt).toLocaleDateString()}
                </div>
                
                {(app.status === 'pending' || app.status === 'verified_by_admin') && (
                  <button 
                    onClick={() => handleWithdraw(app._id)}
                    className="flex items-center gap-1.5 text-xs font-black text-rose-500 hover:text-rose-700 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Withdraw
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
