import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  Shield,
  Building2,
  Calendar,
  Save,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Edit3,
  X
} from 'lucide-react';

export default function ProfilePage({ onNavigate }) {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    provider_type: 'individual',
    business_name: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sync formData with current user state
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        provider_type: user.provider_type || 'individual',
        business_name: user.business_name || '',
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Please Sign In</h2>
        <p className="text-sm text-slate-500">You must be logged in to view and manage your profile.</p>
        <button
          onClick={() => onNavigate && onNavigate('login')}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        provider_type: user.role === 'provider' ? formData.provider_type : undefined,
        business_name: user.role === 'provider' && formData.provider_type === 'business' ? formData.business_name : null,
      });
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    if (onNavigate) onNavigate('home');
  };

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-2xl font-black shadow-md">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {user.role}
                </span>
              </div>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}

            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl transition border border-red-200"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-sm text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* View Mode vs Edit Mode */}
        {!isEditing ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </div>
              <p className="text-sm font-medium text-slate-800">{user.email}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Phone className="w-3.5 h-3.5" /> Phone Number
              </div>
              <p className="text-sm font-medium text-slate-800">{user.phone || 'Not provided'}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Shield className="w-3.5 h-3.5" /> Account Role
              </div>
              <p className="text-sm font-medium text-slate-800 capitalize">{user.role}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Calendar className="w-3.5 h-3.5" /> Member Since
              </div>
              <p className="text-sm font-medium text-slate-800">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active'}
              </p>
            </div>

            {user.role === 'provider' && (
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 sm:col-span-2 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  <Building2 className="w-4 h-4 text-emerald-600" /> Item Provider Information
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-500 text-xs">Provider Type: </span>
                    <span className="font-semibold text-slate-800 capitalize">{user.provider_type || 'Individual'}</span>
                  </div>
                  {user.provider_type === 'business' && (
                    <div>
                      <span className="text-slate-500 text-xs">Business Name: </span>
                      <span className="font-semibold text-slate-800">{user.business_name || 'N/A'}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="07X XXX XXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>

            {user.role === 'provider' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Item Provider Settings
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
                      Business Name
                    </label>
                    <input
                      type="text"
                      name="business_name"
                      value={formData.business_name}
                      onChange={handleChange}
                      placeholder="e.g. Acme Rentals"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition shadow-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
