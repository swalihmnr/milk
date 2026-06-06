import React, { useState, useEffect } from 'react';
import { Search, Loader2, Shield, RefreshCw } from 'lucide-react';
import { api } from '../../../lib/api';

export default function UserManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    // Search filter
    const term = searchQuery.toLowerCase();
    const name = user.name?.toLowerCase() || '';
    const email = user.email?.toLowerCase() || '';
    const phone = user.phone?.toLowerCase() || '';
    const matchesSearch = name.includes(term) || email.includes(term) || phone.includes(term);

    // Role filter
    const matchesRole = roleFilter === 'all' || user.roles?.includes(roleFilter);

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">User Accounts</h1>
          <p className="text-gray-500 text-sm mt-1">Review accounts and roles across the entire DairyOS platform.</p>
        </div>
        <button 
          onClick={fetchUsers} 
          disabled={loading}
          className="h-10 w-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 active:scale-95 transition-all shadow-sm"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, color: 'text-slate-900' },
          { label: 'Farmers', value: users.filter(u => u.roles?.includes('farmer')).length, color: 'text-blue-600' },
          { label: 'Delivery Agents', value: users.filter(u => u.roles?.includes('delivery_boy')).length, color: 'text-purple-600' },
          { label: 'Customers', value: users.filter(u => u.roles?.includes('customer')).length, color: 'text-emerald-600' },
        ].map((s, idx) => (
          <div key={idx} className="bg-white border border-gray-150 p-5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">{s.label}</span>
            <span className={`text-2xl font-black ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name, phone, or email..." 
            className="w-full h-12 bg-white border border-gray-250 rounded-2xl pl-12 pr-4 shadow-sm hover:shadow focus:border-[#0052cc] focus:ring-2 focus:ring-[#0052cc]/10 outline-none transition-all font-semibold text-sm placeholder:text-gray-400 text-gray-800"
          />
        </div>
        <select 
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-12 bg-white border border-gray-250 rounded-2xl px-4 shadow-sm font-semibold text-sm text-gray-700 outline-none focus:border-[#0052cc] min-w-[160px]"
        >
          <option value="all">All Roles</option>
          <option value="admin">Platform Admin</option>
          <option value="farmer">Farmer</option>
          <option value="delivery_boy">Delivery Boy</option>
          <option value="customer">Customer</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#0052cc]" />
          </div>
        ) : error ? (
          <div className="text-center py-10 text-rose-500 font-bold">{error}</div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Phone</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Roles</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/30 transition-colors">
                    <td className="py-5 px-6 font-bold text-gray-950">
                      {user.name}
                    </td>
                    <td className="py-5 px-6 font-semibold text-gray-800">
                      {user.phone}
                    </td>
                    <td className="py-5 px-6 text-gray-600">
                      {user.email || '-'}
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((role: string) => {
                          let badgeStyle = 'bg-gray-50 text-gray-700 border-gray-200';
                          if (role === 'admin') badgeStyle = 'bg-red-50 text-rose-700 border-rose-100';
                          if (role === 'farmer') badgeStyle = 'bg-blue-50 text-blue-700 border-blue-100';
                          if (role === 'delivery_boy') badgeStyle = 'bg-purple-50 text-purple-700 border-purple-100';
                          if (role === 'customer') badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-100';

                          return (
                            <span 
                              key={role} 
                              className={`inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${badgeStyle}`}
                            >
                              <Shield className="h-2.5 w-2.5" /> {role}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <span className={`inline-block h-2.5 w-2.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-gray-350'}`}></span>
                      <span className="ml-1.5 font-bold text-xs text-gray-700 capitalize">{user.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 font-bold">No user accounts found.</div>
        )}
      </div>
    </div>
  );
}
