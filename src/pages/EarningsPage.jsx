import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  DollarSign,
  TrendingUp,
  Package,
  Calendar,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Building2,
  User,
  ArrowRight
} from 'lucide-react';

export default function EarningsPage({ onNavigate }) {
  const { user, token, isAuthenticated } = useAuth();
  const [earningsData, setEarningsData] = useState({
    total_earnings: 0,
    completed_rentals_count: 0,
    avg_booking_value: 0,
    payments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEarnings = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/payments/earnings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setEarningsData(data.data);
      } else {
        setError(data.message || 'Failed to load provider earnings');
      }
    } catch (err) {
      setError(err.message || 'Network error loading earnings data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'provider') {
      fetchEarnings();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, token]);

  if (!isAuthenticated || user?.role !== 'provider') {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
          <Building2 className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Item Provider Access Only</h2>
        <p className="text-sm text-slate-500">Please sign in as an Item Provider to view earnings and revenue reports.</p>
        <button
          onClick={() => onNavigate && onNavigate('login')}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Earnings & Revenue Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track rental earnings, booking values, and completed payouts from your listed items
          </p>
        </div>

        <button
          onClick={fetchEarnings}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Notice Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-amber-900">
        <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <span className="font-bold">Student Project Demo:</span> Revenue and payments are calculated automatically through the simulated rental payment flow.
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Net Earnings</p>
            <h3 className="text-2xl font-black text-emerald-700 mt-1">
              Rs. {earningsData.total_earnings.toLocaleString()}
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completed Rentals</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{earningsData.completed_rentals_count}</h3>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Avg Booking Value</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              Rs. {earningsData.avg_booking_value.toLocaleString()}
            </h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Completed Payouts Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Completed Rental Payments</h3>
          <span className="text-xs font-medium text-slate-400">
            {earningsData.payments.length} transaction{earningsData.payments.length === 1 ? '' : 's'}
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
            <p className="text-sm">Loading earnings history...</p>
          </div>
        ) : earningsData.payments.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <DollarSign className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-sm">No completed earnings yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When renters request your items and complete their payment, revenue payouts will be credited here.
              </p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('my-items')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition"
            >
              Manage My Listings
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {earningsData.payments.map((p) => (
              <div key={p.payment_id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{p.item_name}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Paid
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Renter: <strong className="text-slate-700">{p.renter_name}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(p.start_date).toLocaleDateString()} - {new Date(p.end_date).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>Received {new Date(p.paid_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Payout</span>
                    <div className="text-lg font-black text-emerald-700">
                      +Rs. {parseFloat(p.amount).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
