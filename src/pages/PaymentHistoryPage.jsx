import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  Receipt,
  Calendar,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  MapPin,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export default function PaymentHistoryPage({ onNavigate }) {
  const { user, token, isAuthenticated } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPayments = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/payments/mine', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setPayments(data.data || []);
      } else {
        setError(data.message || 'Failed to load payments');
      }
    } catch (err) {
      setError(err.message || 'Network error loading payment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPayments();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
        <p className="text-sm text-slate-500">Please log in to view your rental payment history and receipts.</p>
        <button
          onClick={() => onNavigate && onNavigate('login')}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition"
        >
          Sign In
        </button>
      </div>
    );
  }

  const totalSpent = payments.reduce((acc, p) => acc + parseFloat(p.amount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Payment History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review completed rental transactions, payment receipts, and booking dates
          </p>
        </div>

        <button
          onClick={fetchPayments}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Notice Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-emerald-800">
        <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
        <div>
          <span className="font-bold">Student Project Demo:</span> All transactions shown below are generated via the RentRight simulated payment flow.
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Spent</p>
            <h3 className="text-2xl font-black text-emerald-700 mt-1">
              Rs. {totalSpent.toLocaleString()}
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completed Payments</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{payments.length}</h3>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <Receipt className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Payments List */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
          <p className="text-sm">Loading transactions...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Receipt className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No payment history yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Once you submit rental requests and complete payments, your digital receipts will appear here.
            </p>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('browse')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition"
          >
            Browse Available Items
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.payment_id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-200 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-slate-500">
                    #PAY-{payment.payment_id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{payment.item_name}</h3>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(payment.start_date).toLocaleDateString()} – {new Date(payment.end_date).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>Provider: <strong className="text-slate-700">{payment.provider_name}</strong></span>
                  <span>•</span>
                  <span>Paid on {new Date(payment.paid_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <span className="text-xs text-slate-400">Total Paid</span>
                <span className="text-xl font-black text-emerald-700">
                  Rs. {parseFloat(payment.amount).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
