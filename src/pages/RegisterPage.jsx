import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Lock, Mail, User, Phone, Building2, ShoppingBag, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function RegisterPage({ onNavigate }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'renter', // 'renter' or 'provider'
    provider_type: 'individual', // 'individual' or 'business'
    business_name: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields (Name, Email, Password).');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.role === 'provider' && formData.provider_type === 'business' && !formData.business_name.trim()) {
      setError('Please provide your Business Name.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || null,
        role: formData.role,
        provider_type: formData.role === 'provider' ? formData.provider_type : undefined,
        business_name: formData.role === 'provider' && formData.provider_type === 'business' ? formData.business_name : null,
      });

      setSuccess(true);
      setTimeout(() => {
        if (onNavigate) onNavigate('profile');
      }, 700);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto w-full">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Create Your Account</h2>
          <p className="text-sm text-slate-500">Join Sri Lanka's leading item rental network</p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-sm text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Registration successful! Welcome to RentRight.</span>
          </div>
        )}

        {/* Role Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
            I want to join as:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'renter' })}
              className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition ${
                formData.role === 'renter'
                  ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${formData.role === 'renter' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm">Renter</div>
                <div className="text-xs text-slate-500 mt-0.5">I want to rent equipment & items</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'provider' })}
              className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition ${
                formData.role === 'provider'
                  ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${formData.role === 'provider' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm">Item Provider</div>
                <div className="text-xs text-slate-500 mt-0.5">I want to list items for rent</div>
              </div>
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Kasun Perera"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="07X XXX XXXX"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="kasun@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Password (min. 6 chars) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition"
              />
            </div>
          </div>

          {/* Additional fields if Item Provider */}
          {formData.role === 'provider' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 mt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Provider Details
              </div>

              <div className="flex gap-4 text-xs font-medium text-slate-700">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="provider_type"
                    value="individual"
                    checked={formData.provider_type === 'individual'}
                    onChange={handleChange}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  Individual Owner
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="provider_type"
                    value="business"
                    checked={formData.provider_type === 'business'}
                    onChange={handleChange}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  Rental Business
                </label>
              </div>

              {formData.provider_type === 'business' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    name="business_name"
                    value={formData.business_name}
                    onChange={handleChange}
                    placeholder="e.g. Lanka Equipment Rentals Pvt Ltd"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white"
                  />
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('login')}
            className="font-semibold text-emerald-600 hover:text-emerald-700 underline ml-1"
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
}
