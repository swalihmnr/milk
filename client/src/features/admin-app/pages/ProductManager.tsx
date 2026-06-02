import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Milk, Loader2 } from 'lucide-react';
import { useProducts, useCategories } from '../../../hooks/useApi';

export default function ProductManager() {
  const [activeTab, setActiveTab] = useState('products');
  const { data: products, loading: prodLoading } = useProducts();
  const { data: categories, loading: catLoading } = useCategories();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Product Management</h1>
          <p className="text-gray-500 text-sm mt-1">Add, edit, and categorize your dairy catalog.</p>
        </div>
        <button className="bg-[#0052cc] text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-blue-800 transition-colors w-full md:w-auto">
          <Plus className="h-5 w-5" /> Add New Product
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('products')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'products' ? 'border-[#0052cc] text-[#0052cc]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          All Products
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'categories' ? 'border-[#0052cc] text-[#0052cc]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Categories
        </button>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#0052cc] transition-colors" />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full h-10 bg-gray-50 border border-transparent rounded-lg pl-10 pr-4 focus:bg-white focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] outline-none transition-all font-medium placeholder:text-gray-400 text-sm"
          />
        </div>
        <button className="h-10 px-4 bg-gray-50 rounded-lg flex items-center justify-center gap-2 text-gray-600 font-bold text-sm border border-gray-200 hover:bg-gray-100 transition-colors">
          <Filter className="h-4 w-4" /> Filter
        </button>
      </div>

      {/* Products Table */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Stock</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {prodLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-[#0052cc] mx-auto" />
                    </td>
                  </tr>
                ) : products && products.length > 0 ? (
                  products.map((product: any) => (
                    <tr key={product._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                            {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : <Milk className="h-6 w-6 text-blue-200" />}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{product.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-600">{product.categoryId?.name || 'Uncategorized'}</td>
                      <td className="py-4 px-6 font-black text-gray-900">₹{product.price}</td>
                      <td className="py-4 px-6 font-bold text-gray-900">{product.stockQuantity}</td>
                      <td className="py-4 px-6">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="h-8 w-8 bg-gray-50 text-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-100 hover:text-[#0052cc] transition-colors border border-gray-200">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="h-8 w-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 font-medium">
                      No products found. Add your first product!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">
          <p className="font-bold">Categories list coming soon.</p>
        </div>
      )}
    </div>
  );
}
