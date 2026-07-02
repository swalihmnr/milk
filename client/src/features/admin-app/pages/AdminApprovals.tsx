import React, { useState, useEffect } from 'react';
import { Loader2, ShieldAlert, X, Check, MapPin, Briefcase, Clock, History } from 'lucide-react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';

function FilterToggle({ filter, setFilter, labels }: { filter: 'pending' | 'history', setFilter: (val: 'pending' | 'history') => void, labels: { pending: string, history: string } }) {
  return (
    <div className="flex bg-gray-100 p-1 rounded-xl w-fit mb-4">
      <button
        onClick={() => setFilter('pending')}
        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${filter === 'pending' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
      >
        <Clock className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
        {labels.pending}
      </button>
      <button
        onClick={() => setFilter('history')}
        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${filter === 'history' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
      >
        <History className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
        {labels.history}
      </button>
    </div>
  );
}

function FarmerJobRequests() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'history'>('pending');

  const fetchJobs = async () => {
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

  const handleApprove = async (jobId: string) => {
    try {
      await api.patch(`/jobs/${jobId}/approve`);
      fetchJobs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve job');
    }
  };

  const handleReject = async (jobId: string) => {
    try {
      await api.patch(`/jobs/${jobId}/admin-reject`);
      fetchJobs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject job');
    }
  };

  const displayJobs = jobs.filter(j => filter === 'pending' ? j.status === 'pending' : j.status !== 'pending');

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#0052cc]" /></div>;

  return (
    <div className="mt-4">
      <FilterToggle filter={filter} setFilter={setFilter} labels={{ pending: 'Needs Approval', history: 'Processed History' }} />
      
      {displayJobs.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center shadow-sm">
          <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {filter === 'pending' ? 'No pending job requests' : 'No processed jobs yet'}
          </h3>
          <p className="text-gray-500 font-medium">
            {filter === 'pending' ? 'There are currently no new delivery job requests from farmers.' : 'History is empty.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayJobs.map(job => (
            <div key={job._id} className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm hover:shadow transition-all">
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-black text-gray-900 text-lg">
                    {job.title}
                  </p>
                  {filter === 'history' && (
                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-lg ${
                      job.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {job.status === 'open' ? 'Request Approved' : 
                       job.status === 'rejected' ? 'Request Declined' : 
                       job.status === 'filled' ? 'Position Filled' : 
                       job.status === 'closed' ? 'Posting Closed' : job.status}
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2">
                  <p className="text-sm text-gray-600">
                    Requested by: <span className="font-bold text-gray-900">{job.farmerId?.farmName || job.farmerId?.name || 'Unknown Farmer'}</span>
                  </p>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <p className="text-sm text-gray-600">
                    Expires: {new Date(job.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm text-gray-500 mt-2 max-w-xl">{job.description}</p>
              </div>
              {filter === 'pending' && (
                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleReject(job._id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-black rounded-xl transition-colors active:scale-95"
                  >
                    <X className="h-4 w-4" /> Reject
                  </button>
                  <button
                    onClick={() => handleApprove(job._id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#0052cc] hover:bg-[#0052cc]/90 text-white text-sm font-black rounded-xl shadow-sm transition-colors active:scale-95"
                  >
                    <Check className="h-4 w-4" /> Approve Job
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DriverJobApplications() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'history'>('pending');

  const fetchApps = async () => {
    try {
      const res = await api.get('/jobs/applications/all');
      setApps(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleVerify = async (jobId: string, appId: string) => {
    try {
      await api.patch(`/jobs/${jobId}/applications/${appId}/verify`);
      fetchApps();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to verify');
    }
  };

  const handleReject = async (jobId: string, appId: string) => {
    try {
      await api.patch(`/jobs/${jobId}/applications/${appId}/reject`);
      fetchApps();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject');
    }
  };

  const displayApps = apps.filter(a => filter === 'pending' ? a.status === 'pending' : a.status !== 'pending');

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#0052cc]" /></div>;

  return (
    <div className="mt-4">
      <FilterToggle filter={filter} setFilter={setFilter} labels={{ pending: 'Needs Verification', history: 'Processed History' }} />

      {displayApps.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center shadow-sm">
          <ShieldAlert className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {filter === 'pending' ? 'No pending driver proposals' : 'No processed history'}
          </h3>
          <p className="text-gray-500 font-medium">
            {filter === 'pending' ? 'There are currently no new driver job applications to review.' : 'History is empty.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayApps.map(app => (
            <div key={app._id} className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm hover:shadow transition-all">
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-black text-gray-900 text-lg flex items-center gap-2">
                    {app.driverId?.name} 
                    <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">{app.driverId?.phone}</span>
                  </p>
                  {filter === 'history' && (
                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-lg ${
                      app.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {app.status.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2">
                  <p className="text-sm text-gray-600">
                    Applying for: <span className="font-bold text-gray-900">{app.jobId?.title}</span>
                  </p>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    <span className="font-bold text-gray-900">{app.jobId?.farmerId?.farmName || app.jobId?.farmerId?.name}</span>
                  </p>
                </div>
              </div>
              {filter === 'pending' && (
                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleReject(app.jobId?._id, app._id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-black rounded-xl transition-colors active:scale-95"
                  >
                    <X className="h-4 w-4" /> Reject
                  </button>
                  <button
                    onClick={() => handleVerify(app.jobId?._id, app._id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#0052cc] hover:bg-[#0052cc]/90 text-white text-sm font-black rounded-xl shadow-sm transition-colors active:scale-95"
                  >
                    <Check className="h-4 w-4" /> Verify KYC & Approve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VendorApprovals() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'history'>('pending');

  const fetchVendors = async () => {
    try {
      const res = await api.get('/admin/vendors');
      setVendors(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'suspended') => {
    try {
      await api.patch(`/admin/vendors/${id}/status`, { approvalStatus: newStatus });
      fetchVendors();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update vendor status');
    }
  };

  const displayVendors = vendors.filter(v => filter === 'pending' ? v.approvalStatus === 'pending' : v.approvalStatus !== 'pending');

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#0052cc]" /></div>;

  return (
    <div className="mt-4">
      <FilterToggle filter={filter} setFilter={setFilter} labels={{ pending: 'Needs Approval', history: 'Processed History' }} />

      {displayVendors.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center shadow-sm">
          <ShieldAlert className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {filter === 'pending' ? 'No pending vendor registrations' : 'No processed history'}
          </h3>
          <p className="text-gray-500 font-medium">
            {filter === 'pending' ? 'There are currently no new farmers waiting for approval.' : 'History is empty.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayVendors.map(vendor => (
            <div key={vendor._id} className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm hover:shadow transition-all">
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-black text-gray-900 text-lg flex items-center gap-2">
                    {vendor.companyName}
                  </p>
                  {filter === 'history' && (
                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-lg ${
                      vendor.approvalStatus === 'suspended' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {vendor.approvalStatus}
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2">
                  <p className="text-sm text-gray-600">
                    Farmer: <span className="font-bold text-gray-900">{vendor.userId?.name}</span>
                  </p>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <p className="text-sm text-gray-600">
                    GST: {vendor.gstNumber || 'N/A'}
                  </p>
                </div>
              </div>
              {filter === 'pending' ? (
                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleStatusUpdate(vendor._id, 'suspended')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-black rounded-xl transition-colors active:scale-95"
                  >
                    <X className="h-4 w-4" /> Reject
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(vendor._id, 'approved')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#0052cc] hover:bg-[#0052cc]/90 text-white text-sm font-black rounded-xl shadow-sm transition-colors active:scale-95"
                  >
                    <Check className="h-4 w-4" /> Approve Vendor
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleStatusUpdate(vendor._id, vendor.approvalStatus === 'suspended' ? 'approved' : 'suspended')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-black rounded-xl transition-colors active:scale-95"
                  >
                    {vendor.approvalStatus === 'suspended' ? 'Re-Approve' : 'Suspend'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DeliveryBoyApprovals() {
  const [deliveryBoys, setDeliveryBoys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'history'>('pending');

  const fetchDeliveryBoys = async () => {
    try {
      const res = await api.get('/admin/delivery-boys');
      setDeliveryBoys(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryBoys();
  }, []);

  const handleVerifyUpdate = async (id: string, isVerified: boolean) => {
    try {
      await api.patch(`/admin/delivery-boys/${id}/verify`, { isVerified });
      fetchDeliveryBoys();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update delivery boy verification');
    }
  };

  const displayBoys = deliveryBoys.filter(b => filter === 'pending' ? !b.isVerified : b.isVerified);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#0052cc]" /></div>;

  return (
    <div className="mt-4">
      <FilterToggle filter={filter} setFilter={setFilter} labels={{ pending: 'Needs Verification', history: 'Verified Delivery Boys' }} />

      {displayBoys.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center shadow-sm">
          <ShieldAlert className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {filter === 'pending' ? 'No pending delivery boys' : 'No verified delivery boys yet'}
          </h3>
          <p className="text-gray-500 font-medium">
            {filter === 'pending' ? 'There are currently no new delivery boys waiting for verification.' : 'Verification history is empty.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayBoys.map(boy => (
            <div key={boy._id} className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm hover:shadow transition-all">
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-black text-gray-900 text-lg flex items-center gap-2">
                    {boy.userId?.name || 'Unknown User'}
                    <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">{boy.userId?.phone}</span>
                  </p>
                  {filter === 'history' && (
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700">
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2">
                  <p className="text-sm text-gray-600">
                    Vehicle: <span className="font-bold text-gray-900">{boy.vehicleType}</span>
                  </p>
                  {boy.licenseNumber && (
                    <>
                      <span className="hidden sm:inline text-gray-300">•</span>
                      <p className="text-sm text-gray-600">
                        License: <span className="font-bold text-gray-955">{boy.licenseNumber}</span>
                      </p>
                    </>
                  )}
                  {boy.vendorId && (
                    <>
                      <span className="hidden sm:inline text-gray-300">•</span>
                      <p className="text-sm text-gray-600">
                        Assigned Farmer: <span className="font-bold text-gray-900">{boy.vendorId?.farmName || boy.vendorId?.name}</span>
                      </p>
                    </>
                  )}
                </div>
              </div>
              {filter === 'pending' ? (
                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleVerifyUpdate(boy._id, true)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#0052cc] hover:bg-[#0052cc]/90 text-white text-sm font-black rounded-xl shadow-sm transition-colors active:scale-95"
                  >
                    <Check className="h-4 w-4" /> Verify Account
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleVerifyUpdate(boy._id, false)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-black rounded-xl transition-colors active:scale-95"
                  >
                    Revoke Verification
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminApprovals() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState<'farmer-jobs' | 'driver-apps' | 'vendors' | 'delivery-boys'>('farmer-jobs');

  if (!isAdmin) return null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Approval Management</h1>
        <p className="text-gray-500 text-sm mt-1">Review and approve platform requests before they go live.</p>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('farmer-jobs')}
          className={`pb-3 px-2 text-sm font-black tracking-wide transition-colors border-b-2 ${activeTab === 'farmer-jobs' ? 'border-[#0052cc] text-[#0052cc]' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
        >
          Farmer Job Requests
        </button>
        <button
          onClick={() => setActiveTab('driver-apps')}
          className={`pb-3 px-2 text-sm font-black tracking-wide transition-colors border-b-2 ${activeTab === 'driver-apps' ? 'border-[#0052cc] text-[#0052cc]' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
        >
          Driver Applications
        </button>
        <button
          onClick={() => setActiveTab('vendors')}
          className={`pb-3 px-2 text-sm font-black tracking-wide transition-colors border-b-2 ${activeTab === 'vendors' ? 'border-[#0052cc] text-[#0052cc]' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
        >
          Vendor Registrations
        </button>
        <button
          onClick={() => setActiveTab('delivery-boys')}
          className={`pb-3 px-2 text-sm font-black tracking-wide transition-colors border-b-2 ${activeTab === 'delivery-boys' ? 'border-[#0052cc] text-[#0052cc]' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
        >
          Delivery Boys
        </button>
      </div>

      {activeTab === 'farmer-jobs' && <FarmerJobRequests />}
      {activeTab === 'driver-apps' && <DriverJobApplications />}
      {activeTab === 'vendors' && <VendorApprovals />}
      {activeTab === 'delivery-boys' && <DeliveryBoyApprovals />}
    </div>
  );
}
