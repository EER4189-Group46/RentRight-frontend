import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  MapPin,
  Tag,
  Star,
  ShieldCheck,
  Building2,
  User,
  Calendar,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  DollarSign,
  Send,
  ArrowRight
} from 'lucide-react';

export default function ItemDetailsPage({ itemId, onBack, onNavigate }) {
  const { user, token, isAuthenticated } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Rental Request form state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [requestError, setRequestError] = useState('');

  useEffect(() => {
    const fetchItemDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/items/${itemId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setItem(data.data);
        } else {
          setError(data.message || 'Failed to load item details');
        }
      } catch (err) {
        setError(err.message || 'Network error loading item');
      } finally {
        setLoading(false);
      }
    };

    if (itemId) {
      fetchItemDetails();
    }
  }, [itemId]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
        <p className="text-sm">Loading item details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{error || 'Item Not Found'}</h2>
        <p className="text-xs text-slate-500">The requested rental listing could not be found or has been removed.</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Browse
        </button>
      </div>
    );
  }

  const images =
    item.images && item.images.length > 0
      ? item.images
      : ['https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80'];

  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  };

  const rentalDays = calculateDays();
  const estimatedTotal = rentalDays * parseFloat(item.price_per_day);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      if (onNavigate) onNavigate('login');
      return;
    }

    if (!startDate || !endDate) {
      setRequestError('Please select both start and end rental dates.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setRequestError('End date cannot be earlier than start date.');
      return;
    }

    setSubmitting(true);
    setRequestError('');

    try {
      const res = await fetch('/api/rental-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          item_id: item.id,
          start_date: startDate,
          end_date: endDate,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to submit rental request');
      }

      setRequestSent(true);
    } catch (err) {
      setRequestError(err.message || 'Error submitting rental request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Back Button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Search Results
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Photo Gallery & Item Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Photo Gallery */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
            <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-100">
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/800x600?text=RentRight+Item';
                }}
              />

              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-slate-800 shadow-sm border border-slate-200">
                  {item.category_name}
                </span>
              </div>

              <div className="absolute top-4 right-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                    item.status === 'available'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {item.status === 'available' ? 'Available for Rent' : 'Unavailable'}
                </span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                      selectedImageIndex === idx
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Description Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <Tag className="w-4 h-4" />
                <span>{item.category_name}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{item.name}</h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{item.location}</span>
                <span>•</span>
                <span>Listed {new Date(item.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Description & Specifications
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {item.description || 'No detailed specifications provided for this listing.'}
              </p>
            </div>

            {/* Ratings & Reviews Breakdown */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  Rating & Reviews
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {item.review_count} verified review{item.review_count === 1 ? '' : 's'}
                </span>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-3xl font-black text-slate-900">
                  {item.avg_rating > 0 ? Number(item.avg_rating).toFixed(1) : 'New'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(Number(item.avg_rating))
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    {item.review_count > 0
                      ? `Based on ${item.review_count} verified rental completion${item.review_count === 1 ? '' : 's'}`
                      : 'No ratings yet. Be the first renter to review!'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Booking Card & Provider Info */}
        <div className="space-y-6">
          {/* Booking / Request Action Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-lg space-y-5 sticky top-24">
            <div className="space-y-1 pb-4 border-b border-slate-100">
              <span className="text-xs text-slate-400 font-medium">Daily Rental Rate</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-emerald-700">
                  Rs. {parseFloat(item.price_per_day).toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 font-medium">/ day</span>
              </div>
            </div>

            {/* Request Booking Form */}
            {requestSent ? (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-base text-emerald-900">Request Sent to Provider!</h4>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Your booking request for <strong>{rentalDays} days (Rs. {estimatedTotal.toLocaleString()})</strong> has been submitted. Once accepted by the provider, you can complete the simulated payment.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => onNavigate && onNavigate('my-requests')}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    View My Requests <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setRequestSent(false)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 underline"
                  >
                    Send another request
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendRequest} className="space-y-4">
                {requestError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{requestError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {startDate && endDate && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-semibold text-slate-800">{rentalDays} day{rentalDays > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200/60 pt-1 mt-1">
                      <span>Estimated Total:</span>
                      <span className="text-emerald-700">Rs. {estimatedTotal.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || item.status !== 'available'}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {!isAuthenticated
                      ? 'Sign In to Request Item'
                      : submitting
                      ? 'Submitting Request...'
                      : item.status !== 'available'
                      ? 'Currently Unavailable'
                      : 'Send Rental Request'}
                  </span>
                </button>
              </form>
            )}

            <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Protected by RentRight Security & Verification</span>
            </div>
          </div>

          {/* Provider Profile Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Item Provider</h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-lg font-black shadow-md">
                {item.provider_name ? item.provider_name.charAt(0).toUpperCase() : 'P'}
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm">{item.provider_name || 'Verified Provider'}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {item.provider_type === 'business' ? 'Rental Business' : 'Individual Owner'}
                  </span>
                </div>
              </div>
            </div>

            {item.business_name && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-400 font-medium">Business: </span>
                <span className="font-semibold text-slate-800">{item.business_name}</span>
              </div>
            )}

            <div className="space-y-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Member since{' '}
                  {item.provider_member_since
                    ? new Date(item.provider_member_since).toLocaleDateString()
                    : '2026'}
                </span>
              </div>

              {item.provider_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.provider_phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
