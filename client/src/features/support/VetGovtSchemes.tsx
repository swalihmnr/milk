import React, { useState } from 'react';
import { Award, FileText, IndianRupee, ShieldCheck, Search, PlusCircle, CheckCircle2, X, Clock, Users, Building, FileCheck } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock Data - Vet Incentives
const INCENTIVES = {
  tagging: { label: 'Ear Tagging (Pashu Aadhaar)', amount: 2.50 },
  ai: { label: 'Artificial Insemination (AI)', amount: 50.00 },
  calf: { label: 'Successful Calf Delivery', amount: 100.00 },
  vaccine: { label: 'FMD Vaccination', amount: 5.00 },
};

const mockCertificates = [
  { id: 'CERT-001', date: 'Oct 24, 2023', type: 'ai', cowTag: 'TAG-1045', farmer: 'Arjun Sunrise Farm', status: 'paid', amount: 50 },
  { id: 'CERT-002', date: 'Oct 23, 2023', type: 'tagging', cowTag: 'TAG-1088', farmer: 'Bhoomi Dairy', status: 'pending', amount: 2.50 },
  { id: 'CERT-003', date: 'Oct 20, 2023', type: 'calf', cowTag: 'TAG-0822', farmer: 'Green Meadows Inc', status: 'paid', amount: 100 },
  { id: 'CERT-004', date: 'Oct 19, 2023', type: 'vaccine', cowTag: 'TAG-0901', farmer: 'Suresh Patel', status: 'pending', amount: 5 },
];

// Mock Data - Farmer Subsidies
const mockFarmerApplications = [
  { id: 'APP-992', farmer: 'Arjun Sunrise Farm', scheme: 'DEDS (Dairy Entrepreneurship Dev Scheme)', description: '25% Capital Subsidy for 10 new Holstein Cows', status: 'pending_vet_check', requestedOn: 'Oct 25, 2023' },
  { id: 'APP-993', farmer: 'Bhoomi Dairy', scheme: 'AHIDF (Animal Husbandry Infra Fund)', description: '3% Interest Subvention for Milking Machine', status: 'pending_vet_check', requestedOn: 'Oct 24, 2023' },
  { id: 'APP-994', farmer: 'Suresh Patel', scheme: 'DEDS (Dairy Entrepreneurship Dev Scheme)', description: '33% Subsidy for Shed Construction', status: 'approved', requestedOn: 'Oct 15, 2023' },
];

export default function VetGovtSchemes() {
  const [activeTab, setActiveTab] = useState<'vet' | 'farmer'>('vet');
  
  // Vet Incentives State
  const [certificates, setCertificates] = useState(mockCertificates);
  const [showForm, setShowForm] = useState(false);
  const [serviceType, setServiceType] = useState<keyof typeof INCENTIVES>('ai');
  const [cowTag, setCowTag] = useState('');
  const [farmerName, setFarmerName] = useState('');
  const [batchId, setBatchId] = useState('');

  // Farmer Subsidies State
  const [applications, setApplications] = useState(mockFarmerApplications);

  // Vet KPIs
  const totalEarnings = certificates.reduce((acc, curr) => acc + curr.amount, 0);
  const pendingAmount = certificates.filter(c => c.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);
  const paidAmount = certificates.filter(c => c.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);

  // Handlers
  const handleGenerateCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cowTag || !farmerName) {
      toast.error('Please fill all required fields');
      return;
    }

    const newCert = {
      id: `CERT-00${certificates.length + 1}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      type: serviceType,
      cowTag,
      farmer: farmerName,
      status: 'pending',
      amount: INCENTIVES[serviceType].amount,
    };

    setCertificates([newCert, ...certificates]);
    setShowForm(false);
    toast.success('Certificate Generated Successfully!');
    setCowTag('');
    setFarmerName('');
    setBatchId('');
  };

  const handleApproveFarmerSubsidy = (appId: string) => {
    setApplications(prev => prev.map(app => 
      app.id === appId ? { ...app, status: 'approved' } : app
    ));
    toast.success('Health Certificate Issued to Farmer!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Government Schemes (INAPH)</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your INAPH medical incentives and verify farm health for Farmer subsidies.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-200/50 p-1 rounded-xl w-full sm:w-fit">
        <button
          onClick={() => setActiveTab('vet')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'vet' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Award className="h-4 w-4" /> Doctor Incentives (INAPH)
        </button>
        <button
          onClick={() => setActiveTab('farmer')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'farmer' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="h-4 w-4" /> Farmer Subsidies
        </button>
      </div>

      {activeTab === 'vet' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg shadow-teal-500/20 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10">
                <IndianRupee className="h-32 w-32" />
              </div>
              <div className="relative z-10">
                <p className="text-teal-100 text-xs font-bold uppercase tracking-widest mb-1">Total Incentives Accrued</p>
                <h3 className="text-3xl font-black">₹{totalEarnings.toFixed(2)}</h3>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-teal-50">
                  <ShieldCheck className="h-4 w-4" /> INAPH Verified
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Pending Clearance</p>
                <h3 className="text-2xl font-black text-amber-600">₹{pendingAmount.toFixed(2)}</h3>
              </div>
              <p className="text-xs font-medium text-slate-400 mt-4">Awaiting Govt Disbursement</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Successfully Paid</p>
                <h3 className="text-2xl font-black text-slate-900">₹{paidAmount.toFixed(2)}</h3>
              </div>
              <p className="text-xs font-medium text-slate-400 mt-4">Transferred to Bank Account</p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Official Certifications</h2>
                  <p className="text-xs font-medium text-slate-500">Record interventions to claim subsidies</p>
                </div>
              </div>
              <button 
                onClick={() => setShowForm(!showForm)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl shadow-sm shadow-teal-500/20 transition-all"
              >
                {showForm ? <X className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                {showForm ? 'Cancel' : 'Generate Certificate'}
              </button>
            </div>

            {/* Generate Certificate Form */}
            {showForm && (
              <div className="p-6 bg-slate-50 border-b border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300">
                <form onSubmit={handleGenerateCertificate} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-teal-600" /> New Certification Entry
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Service Type</label>
                      <select 
                        className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none font-medium text-slate-700 bg-white"
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value as any)}
                      >
                        {Object.entries(INCENTIVES).map(([key, val]) => (
                          <option key={key} value={key}>{val.label} (₹{val.amount} Incentive)</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Cow Tag No. (Pashu Aadhaar)</label>
                      <input 
                        type="text" 
                        placeholder="e.g., TAG-123456" 
                        className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none font-medium"
                        value={cowTag}
                        onChange={e => setCowTag(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Farmer / Farm Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Sunrise Dairy Farm" 
                        className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none font-medium"
                        value={farmerName}
                        onChange={e => setFarmerName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Semen Straw / Vaccine Batch ID</label>
                      <input 
                        type="text" 
                        placeholder="Optional details" 
                        className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none font-medium"
                        value={batchId}
                        onChange={e => setBatchId(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      type="submit"
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-md transition-all"
                    >
                      Sign & Issue Certificate
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Certificates Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Certificate ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Farmer & Cow</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service Type</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Incentive</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {certificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-xs font-black text-slate-900">{cert.id}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium">{cert.date}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900">{cert.farmer}</p>
                        <p className="text-xs text-slate-500 font-medium">{cert.cowTag}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                          {INCENTIVES[cert.type as keyof typeof INCENTIVES].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-teal-600">
                        ₹{cert.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {cert.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                            <Clock className="h-3.5 w-3.5" /> Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'farmer' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Bank/Govt Subsidy Applications</h2>
                  <p className="text-xs font-medium text-slate-500">Farmers requesting Health Certificates to apply for grants (DEDS, AHIDF).</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">App ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Farmer</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scheme Details</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-xs font-black text-slate-900">{app.id}</span>
                        <div className="text-[10px] text-slate-400 mt-1">{app.requestedOn}</div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900">{app.farmer}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-indigo-700">{app.scheme}</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">{app.description}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {app.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                            <FileCheck className="h-4 w-4" /> Certificate Issued
                          </span>
                        ) : (
                          <button 
                            onClick={() => handleApproveFarmerSubsidy(app.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" /> Verify & Issue Certificate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {applications.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm font-medium text-slate-400">
                        No pending farmer applications.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
