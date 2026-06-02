import { useState, useEffect } from 'react';
import { api } from '../lib/api';

// Generic fetch hook
export function useFetch<T>(url: string, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(url);
        if (isMounted) {
          setData(response.data.data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || 'An error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ...dependencies]);

  return { data, loading, error, setData };
}

// Specific API hooks
export function useProducts(params?: { popular?: boolean; category?: string; vendorId?: string }) {
  const query = new URLSearchParams(params as any).toString();
  const url = `/products${query ? `?${query}` : ''}`;
  return useFetch<any[]>(url);
}

export function useCategories() {
  return useFetch<any[]>('/products/categories');
}

export function useAdminStats() {
  return useFetch<any>('/dashboard/admin');
}

export function useVendorStats(vendorId: string) {
  // Only fetch if vendorId is provided
  const url = vendorId ? `/dashboard/vendor/${vendorId}` : '';
  const { data, loading, error } = useFetch<any>(url, [url]);
  
  // If no URL, return mock loading state
  if (!url) return { data: null, loading: false, error: 'No vendor ID' };
  return { data, loading, error };
}

export function useVendors() {
  return useFetch<any[]>('/vendors');
}
