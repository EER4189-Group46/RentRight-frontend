import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Calendar,
  DollarSign,
  ShieldCheck,
  Building2,
  Sparkles,
  QrCode
} from 'lucide-react';


export default function MakePaymentModal({ isOpen, onClose, request, onPaymentSuccess }) {
  const { token } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  if (!isOpen || !request) return null;

  const start = new Date(request.start_date);
  const end = new Date(request.end_date);
  const diffTime = Math.abs(end - start);
  const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const pricePerDay = parseFloat(request.price_per_day);
  const totalAmount = durationDays * pricePerDay;

  const handleSimulatePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rental_request_id: request.id,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Payment processing failed');
      }

      setPaymentData(data.data);
      setSuccess(true);

      setTimeout(() => {
        if (onPaymentSuccess) onPaymentSuccess(data.data);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error occurred during simulated payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Make Rental Payment</h3>
              <p className="text-xs text-slate-500">Secure simulated checkout for RentRight Sri Lanka</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Banner */}
        <div className="bg-amber-50 border-y border-amber-200/60 px-6 py-2.5 flex items-center gap-2 text-xs text-amber-800">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong></strong> This is a simulated payment gateway. No real money will be charged.
          </span>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Payment Successful!</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Payment receipt <span className="font-mono font-bold text-slate-700">#PAY-{paymentData?.id || request.id}</span> generated and rental confirmed.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSimulatePayment} className="space-y-5">
              {/* Order Summary Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{request.item_name}</h4>
                    <p className="text-xs text-slate-500">Provider: {request.provider_name}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Accepted
                  </span>
                </div>

                <div className="border-t border-slate-200/60 pt-2.5 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Rental Duration:</span>
                    <span className="font-semibold text-slate-800">{durationDays} day{durationDays > 1 ? 's' : ''} ({new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Rate:</span>
                    <span>Rs. {pricePerDay.toLocaleString()} / day</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-slate-900 border-t border-slate-200/80 pt-2 mt-2">
                    <span>Total Payment Amount:</span>
                    <span className="text-emerald-700">Rs. {totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Simulated Payment Methods */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Select Simulated Payment Method
                </label>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                      paymentMethod === 'card'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-[11px]">Visa / Master</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qr')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                      paymentMethod === 'qr'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-[11px]">LankaQR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                      paymentMethod === 'bank'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-[11px]">Bank Transfer</span>
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {loading ? 'Simulating Transaction...' : `Pay Rs. ${totalAmount.toLocaleString()} Now`}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
