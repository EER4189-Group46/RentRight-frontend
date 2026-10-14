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
  Send,
  Inbox,
  SendHorizontal,
  ExternalLink,
  Phone,
  Mail,
  Check,
  CheckCheck,
  Filter
} from 'lucide-react';

export default function RentalRequestsPage({ onNavigate, onSelectItem, initialView }) {
  const { user, token, isAuthenticated } = useAuth();
  const isProvider = user?.role === 'provider';

  // Toggle between provider incoming requests and renter's own requests
  const [viewMode, setViewMode] = useState(initialView || (isProvider ? 'provider' : 'mine'));
  const [statusFilter, setStatusFilter] = useState('all');

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Payment modal state
  const [selectedRequestForPayment, setSelectedRequestForPayment] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const fetchRequests = async () => {
    if (!token) return;
    setLoading(true);
    setError('');

    const endpoint = viewMode === 'provider'
      ? '/api/rental-requests/provider'
      : '/api/rental-requests/mine';

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
  }, [isAuthenticated, viewMode, token]);

  const handleUpdateStatus = async (requestId, newStatus) => {
    setUpdatingId(requestId);
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

      const statusLabels = {
        accepted: 'accepted and customer notified to complete payment',
        rejected: 'rejected',
        completed: 'marked as completed',
      };

      setActionSuccess(`Rental request #REQ-${requestId} has been ${statusLabels[newStatus] || newStatus}.`);
      fetchRequests();
      setTimeout(() => setActionSuccess(''), 4500);
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setUpdatingId(null);
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
    setTimeout(() => setActionSuccess(''), 4500);
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

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return req.status === 'pending';
    if (statusFilter === 'accepted') return req.status === 'accepted' && !req.payment_id;
    if (statusFilter === 'paid') return !!req.payment_id || req.payment_status === 'completed';
    if (statusFilter === 'completed') return req.status === 'completed';
    if (statusFilter === 'rejected') return req.status === 'rejected';
    return true;
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-8">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>
              {viewMode === 'provider'
                ? 'Incoming Customer Requests'
                : 'My Rental Requests & Bookings'}
            </span>
            {viewMode === 'provider' && pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white animate-pulse">
                {pendingCount} Pending
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {viewMode === 'provider'
              ? 'Receive, review, and accept rental requests from renters for your inventory in Sri Lanka'
              : 'Track request status, complete payments on accepted bookings, and view receipts'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Provider Mode Switcher Tabs */}
          {isProvider && (
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200">
              <button
                onClick={() => { setViewMode('provider'); setStatusFilter('all'); }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  viewMode === 'provider'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>Incoming</span>
                {pendingCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                )}
              </button>
              <button
                onClick={() => { setViewMode('mine'); setStatusFilter('all'); }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  viewMode === 'mine'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <SendHorizontal className="w-3.5 h-3.5" />
                <span>My Bookings</span>
              </button>
            </div>
          )}

          <button
            onClick={fetchRequests}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
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

      {/* Filter Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-sm flex items-center gap-1 overflow-x-auto">
        <span className="text-xs font-bold text-slate-400 px-3 flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {[
          { id: 'all', label: `All (${requests.length})` },
          { id: 'pending', label: `Pending Approval (${requests.filter(r => r.status === 'pending').length})` },
          { id: 'accepted', label: `Accepted (${requests.filter(r => r.status === 'accepted' && !r.payment_id).length})` },
          { id: 'paid', label: `Paid & Active (${requests.filter(r => !!r.payment_id || r.payment_status === 'completed').length})` },
          { id: 'completed', label: `Completed (${requests.filter(r => r.status === 'completed').length})` },
          { id: 'rejected', label: `Rejected (${requests.filter(r => r.status === 'rejected').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === tab.id
                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
          <p className="text-sm">Loading rental requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              {viewMode === 'provider'
                ? 'No incoming rental requests'
                : 'No rental requests placed yet'}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {viewMode === 'provider'
                ? statusFilter !== 'all'
                  ? 'No requests match the selected status filter.'
                  : 'When customers request to rent your equipment listings, their bookings will appear here for your review and approval.'
                : 'Browse available equipment and send your first rental booking request.'}
            </p>
          </div>
          {viewMode === 'mine' && (
            <button
              onClick={() => onNavigate && onNavigate('browse')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition shadow-sm"
            >
              Explore Available Items
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const isPending = req.status === 'pending';
            const isAccepted = req.status === 'accepted';
            const isRejected = req.status === 'rejected';
            const isCompleted = req.status === 'completed';
            const isPaid = req.payment_status === 'completed' || !!req.payment_id;
            const isUpdating = updatingId === req.id;

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
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
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

                    {isPaid && !isCompleted && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" /> Paid & Confirmed Active
                      </span>
                    )}

                    {isCompleted && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                        <CheckCheck className="w-3 h-3 text-purple-600" /> Rental Completed
                      </span>
                    )}

                    {isRejected && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-red-600" /> Rejected
                      </span>
                    )}
                  </div>

                  <div>
                    <h3
                      onClick={() => onSelectItem && req.item_id && onSelectItem(req.item_id)}
                      className="text-lg font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition inline-flex items-center gap-1.5 group"
                    >
                      <span>{req.item_name}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition text-emerald-600" />
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(req.start_date).toLocaleDateString()} – {new Date(req.end_date).toLocaleDateString()} ({days} day{days > 1 ? 's' : ''})
                    </span>
                    <span>•</span>
                    {viewMode === 'provider' ? (
                      <div className="flex items-center gap-2 text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Renter: <strong className="text-slate-900">{req.renter_name}</strong></span>
                        {req.renter_phone && (
                          <span className="text-slate-500 flex items-center gap-0.5">
                            <Phone className="w-3 h-3 text-emerald-600" /> {req.renter_phone}
                          </span>
                        )}
                        {req.renter_email && (
                          <span className="text-slate-500 flex items-center gap-0.5">
                            <Mail className="w-3 h-3 text-emerald-600" /> {req.renter_email}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span>Provider: <strong className="text-slate-800">{req.provider_name}</strong></span>
                    )}
                    <span>•</span>
                    <span>Rate: Rs. {parseFloat(req.price_per_day).toLocaleString()}/day</span>
                  </div>
                </div>

                {/* Right / Actions Side */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-slate-400 font-medium">Total Amount</span>
                    <div className="text-xl font-black text-emerald-700">
                      Rs. {estimatedAmount.toLocaleString()}
                    </div>
                  </div>

                  {/* Provider Actions in Incoming Mode */}
                  {viewMode === 'provider' && (
                    <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'accepted')}
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isUpdating ? 'Updating...' : 'Accept Request'}</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'rejected')}
                            disabled={isUpdating}
                            className="px-4 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 font-bold text-xs rounded-xl transition disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {/* If Paid / Active, provider can complete the rental when returned */}
                      {isPaid && !isCompleted && (
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'completed')}
                          disabled={isUpdating}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
                          title="Mark item as returned and rental completed"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark Completed</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Renter Actions in My Bookings Mode: Make Payment */}
                  {viewMode === 'mine' && isAccepted && !isPaid && (
                    <button
                      onClick={() => handleOpenPayment(req)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition animate-pulse"
                    >
                      <CreditCard className="w-4 h-4" />
                      Make Payment Now
                    </button>
                  )}

                  {isPaid && (
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
