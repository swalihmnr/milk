import React, { useState, useMemo } from 'react';
import { Download, Wallet, AlertTriangle, CheckCircle2, Clock, XCircle, Loader2, FileText, TrendingUp, Users, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFetch } from '../../hooks/useApi';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  billingMonth: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'paid' | 'unpaid' | 'partial';
  dueDate: string;
  createdAt: string;
  customerId?: { name: string; phone: string; address: string; };
}

const PAGE_SIZE = 8;

const statusConfig = {
  paid:    { label: 'Paid',    bg: 'bg-green-100',  text: 'text-green-700',  icon: CheckCircle2 },
  unpaid:  { label: 'Unpaid',  bg: 'bg-red-100',    text: 'text-red-600',    icon: AlertTriangle },
  partial: { label: 'Partial', bg: 'bg-orange-100', text: 'text-orange-600', icon: Clock },
};

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function BillingDashboard() {
  const { data: invoices, loading, error } = useFetch<Invoice[]>('/invoices');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'partial'>('all');
  const [page, setPage] = useState(1);

  // ── Stats derived from real data ─────────────────────────────────────────
  const stats = useMemo(() => {
    if (!invoices) return { total: 0, pending: 0, collected: 0, unpaidCount: 0 };
    return {
      total: invoices.reduce((s, i) => s + i.totalAmount, 0),
      pending: invoices.reduce((s, i) => s + i.pendingAmount, 0),
      collected: invoices.reduce((s, i) => s + i.paidAmount, 0),
      unpaidCount: invoices.filter(i => i.status !== 'paid').length,
    };
  }, [invoices]);

  // ── Filtered + paginated ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return (invoices || []).filter(inv => {
      const matchSearch = search === '' ||
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        inv.customerId?.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (f: typeof statusFilter) => {
    setStatusFilter(f);
    setPage(1);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Billing & Payments</h1>
          <p className="text-gray-500 font-medium mt-1 text-sm">Manage invoices and track collections</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2 h-10 rounded-2xl font-bold border-gray-200 w-fit">
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse">
              <div className="h-3 w-20 bg-gray-100 rounded mb-3" />
              <div className="h-7 w-28 bg-gray-100 rounded" />
            </div>
          ))
        ) : (
          <>
            <div className="bg-gradient-to-br from-[#0052cc] to-[#0073e6] rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20 col-span-2 lg:col-span-1">
              <p className="text-xs font-black text-blue-200 uppercase tracking-widest mb-1">Total Billed</p>
              <p className="text-2xl font-black">{fmt(stats.total)}</p>
              <p className="text-xs text-blue-200 mt-1">{invoices?.length ?? 0} invoices</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Collected</p>
              <p className="text-2xl font-black text-green-600">{fmt(stats.collected)}</p>
              <p className="text-xs text-gray-400 mt-1">{invoices?.filter(i => i.status === 'paid').length ?? 0} paid</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Pending Dues</p>
              <p className="text-2xl font-black text-red-500">{fmt(stats.pending)}</p>
              <p className="text-xs text-gray-400 mt-1">{stats.unpaidCount} invoices</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Collection Rate</p>
              <p className="text-2xl font-black text-[#0052cc]">
                {stats.total > 0 ? `${Math.round((stats.collected / stats.total) * 100)}%` : '—'}
              </p>
              <p className="text-xs text-gray-400 mt-1">of total billed</p>
            </div>
          </>
        )}
      </div>

      {/* ── Invoices Table Card ── */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search invoice or customer..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[#0052cc] focus:ring-4 focus:ring-[#0052cc]/10 transition-all"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            {(['all', 'paid', 'unpaid', 'partial'] as const).map(s => (
              <button
                key={s}
                onClick={() => handleFilterChange(s)}
                className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  statusFilter === s
                    ? 'bg-[#0052cc] text-white shadow-md shadow-blue-500/20'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="font-medium">Loading invoices...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-16">
            <XCircle className="h-10 w-10 text-red-300 mx-auto mb-3" />
            <p className="font-bold text-red-500">Failed to load invoices</p>
            <p className="text-sm text-gray-400 mt-1">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <FileText className="h-10 w-10 text-[#0052cc] opacity-40" />
            </div>
            <h3 className="font-black text-gray-900 text-lg mb-2">
              {invoices?.length === 0 ? 'No Invoices Yet' : 'No Results Found'}
            </h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              {invoices?.length === 0
                ? 'Invoices will appear here once you start billing customers.'
                : 'Try adjusting your search or filter.'}
            </p>
          </div>
        )}

        {/* Table – desktop */}
        {!loading && !error && paginated.length > 0 && (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Invoice', 'Customer', 'Month', 'Total', 'Paid', 'Pending', 'Status', 'Due Date'].map(h => (
                      <th key={h} className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map(inv => {
                    const cfg = statusConfig[inv.status];
                    const Icon = cfg.icon;
                    return (
                      <tr key={inv._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4 font-black text-gray-900 whitespace-nowrap">{inv.invoiceNumber}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900 whitespace-nowrap">{inv.customerId?.name || '—'}</p>
                          <p className="text-xs text-gray-400">{inv.customerId?.phone}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{inv.billingMonth}</td>
                        <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">{fmt(inv.totalAmount)}</td>
                        <td className="px-6 py-4 font-bold text-green-600 whitespace-nowrap">{fmt(inv.paidAmount)}</td>
                        <td className="px-6 py-4 font-bold text-red-500 whitespace-nowrap">{fmt(inv.pendingAmount)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black ${cfg.bg} ${cfg.text}`}>
                            <Icon className="h-3 w-3" /> {cfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{fmtDate(inv.dueDate)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Card list – mobile */}
            <div className="md:hidden divide-y divide-gray-50">
              {paginated.map(inv => {
                const cfg = statusConfig[inv.status];
                const Icon = cfg.icon;
                return (
                  <div key={inv._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-black text-gray-900 text-sm">{inv.invoiceNumber}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{inv.customerId?.name || '—'} • {inv.billingMonth}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black shrink-0 ${cfg.bg} ${cfg.text}`}>
                        <Icon className="h-3 w-3" /> {cfg.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-gray-50 rounded-xl p-2.5">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total</p>
                        <p className="text-sm font-black text-gray-900 mt-0.5">{fmt(inv.totalAmount)}</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-2.5">
                        <p className="text-[10px] font-black text-green-500 uppercase tracking-wider">Paid</p>
                        <p className="text-sm font-black text-green-700 mt-0.5">{fmt(inv.paidAmount)}</p>
                      </div>
                      <div className="bg-red-50 rounded-xl p-2.5">
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-wider">Due</p>
                        <p className="text-sm font-black text-red-600 mt-0.5">{fmt(inv.pendingAmount)}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">Due: {fmtDate(inv.dueDate)}</p>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/40">
              <p className="text-xs text-gray-400 font-medium">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 w-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-black text-gray-700 px-2">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 w-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
