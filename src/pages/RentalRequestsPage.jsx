import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MakePaymentModal from '../components/MakePaymentModal';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Building2,
  User,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Send
} from 'lucide-react';

export default function RentalRequestsPage({ onNavigate }) {
  const { user, token, isAuthenticated } = useAuth();
  const isProvider = user?.role === 'provider';

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Payment modal state
  const [selectedRequestForPayment, setSelectedRequestForPayment] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const fetchRequests = async () => {
    if (!token) return;
    setLoading(true);
    setError('');

    const endpoint = isProvider ? '/api/rental-requests/provider' : '/api/rental-requests/mine';

    try {
      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setRequests(data.data || []);
      } else {
        setError(data.message || 'Failed to load requests');
      }
    } catch (err) {
      setError(err.message || 'Network error loading requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRequests();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isProvider, token]);

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      const res = await fetch(`/api/rental-requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to update request status');
      }

      setActionSuccess(`Rental request has been marked as '${newStatus}'.`);
      fetchRequests();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    }
  };

  const handleOpenPayment = (req) => {
    setSelectedRequestForPayment(req);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentModalOpen(false);
    setActionSuccess('Payment completed successfully! Rental booking confirmed.');
    fetchRequests();
    setTimeout(() => setActionSuccess(''), 4000);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
        <p className="text-sm text-slate-500">Please log in to manage your rental requests and bookings.</p>
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isProvider ? 'Incoming Rental Requests' : 'My Rental Requests & Bookings'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isProvider
              ? 'Review and accept rental requests from customers for your equipment'
              : 'Track request status, complete payments on accepted bookings, and view receipts'}
          </p>
        </div>

        <button
          onClick={fetchRequests}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Action Alerts */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-sm text-emerald-800 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Requests List */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
          <p className="text-sm">Loading rental requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              {isProvider ? 'No incoming rental requests' : 'No rental requests placed yet'}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {isProvider
                ? 'When customers send requests for your items, they will appear here for approval.'
                : 'Browse available equipment and send your first rental request.'}
            </p>
          </div>
          {!isProvider && (
            <button
              onClick={() => onNavigate && onNavigate('browse')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition"
            >
              Explore Items
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const isAccepted = req.status === 'accepted';
            const isPending = req.status === 'pending';
            const isRejected = req.status === 'rejected';
            const isPaid = req.payment_status === 'completed' || !!req.payment_id;

            const start = new Date(req.start_date);
            const end = new Date(req.end_date);
            const diffTime = Math.abs(end - start);
            const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            const estimatedAmount = days * parseFloat(req.price_per_day);

            return (
              <div
                key={req.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-emerald-200 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      #REQ-{req.id}
                    </span>

                    {/* Status Badges */}
                    {isPending && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" /> Pending Approval
                      </span>
                    )}

                    {isAccepted && !isPaid && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Request Accepted (Awaiting Payment)
                      </span>
                    )}

                    {isPaid && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" /> Paid & Confirmed
                      </span>
                    )}

                    {isRejected && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-red-600" /> Rejected
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{req.item_name}</h3>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(req.start_date).toLocaleDateString()} – {new Date(req.end_date).toLocaleDateString()} ({days} day{days > 1 ? 's' : ''})
                    </span>
                    <span>•</span>
                    {isProvider ? (
                      <span>Renter: <strong className="text-slate-800">{req.renter_name}</strong> ({req.renter_phone || req.renter_email})</span>
                    ) : (
                      <span>Provider: <strong className="text-slate-800">{req.provider_name}</strong></span>
                    )}
                    <span>•</span>
                    <span>Rate: Rs. {parseFloat(req.price_per_day).toLocaleString()}/day</span>
                  </div>
                </div>

                {/* Right / Actions Side */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-slate-400 font-medium">Total Amount</span>
                    <div className="text-xl font-black text-emerald-700">
                      Rs. {estimatedAmount.toLocaleString()}
                    </div>
                  </div>

                  {/* Provider Actions: Accept / Reject */}
                  {isProvider && isPending && (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'accepted')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                      >
                        Accept Request
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'rejected')}
                        className="px-4 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 font-bold text-xs rounded-xl transition"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {/* Renter Actions: Make Payment */}
                  {!isProvider && isAccepted && !isPaid && (
                    <button
                      onClick={() => handleOpenPayment(req)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition animate-pulse"
                    >
                      <CreditCard className="w-4 h-4" />
                      Make Payment Now
                    </button>
                  )}

                  {!isProvider && isPaid && (
                    <div className="text-xs font-bold text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                      <CheckCircle2 className="w-4 h-4" />
                      Receipt #PAY-{req.payment_id}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Simulated Payment Modal */}
      <MakePaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        request={selectedRequestForPayment}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
