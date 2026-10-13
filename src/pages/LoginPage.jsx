import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2, KeyRound, X } from 'lucide-react';

export default function LoginPage({ onNavigate }) {
  const { login, forgotPassword, resetPassword } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1 = request token, 2 = submit new password
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      setSuccess(true);
      setTimeout(() => {
        if (onNavigate) onNavigate('profile');
      }, 700);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError('Please enter your email.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');

    try {
      const res = await forgotPassword(forgotEmail);
      if (res.data?.devToken) {
        setResetToken(res.data.devToken);
      }
      setForgotSuccess(res.message || 'Reset instructions sent. Please check console/email.');
      setResetStep(2);
    } catch (err) {
      setForgotError(err.message || 'Failed to request reset token.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handlePerformReset = async (e) => {
    e.preventDefault();
    if (!resetToken || !newPassword) {
      setForgotError('Please fill in both the token and your new password.');
      return;
    }
    if (newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters long.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');

    try {
      const res = await resetPassword(resetToken, newPassword);
      setForgotSuccess(res.message || 'Password successfully updated! You can now log in.');
      setTimeout(() => {
        setShowForgotModal(false);
        setResetStep(1);
        setForgotEmail('');
        setResetToken('');
        setNewPassword('');
        setForgotSuccess('');
      }, 1500);
    } catch (err) {
      setForgotError(err.message || 'Failed to reset password.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-md mx-auto w-full">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <LogIn className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-sm text-slate-500">Log in to your RentRight account</p>
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
              <span>Login successful! Redirecting...</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
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
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>Logging in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('register')}
              className="font-semibold text-emerald-600 hover:text-emerald-700 underline ml-1"
            >
              Create an Account
            </button>
          </div>
        </div>
      </div>

      {/* Forgot / Reset Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {resetStep === 1 ? 'Reset Password' : 'Enter New Password'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {resetStep === 1 ? 'Request a reset token' : 'Step 2: Set your new password'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setResetStep(1);
                  setForgotError('');
                  setForgotSuccess('');
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {resetStep === 1 ? (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Your Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setResetStep(2)}
                    className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 font-medium"
                  >
                    I already have a token
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
                  >
                    {forgotLoading ? 'Sending...' : 'Send Reset Token'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePerformReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Reset Token
                  </label>
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Paste token received"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    New Password (min 6 characters)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div className="flex gap-2 justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setResetStep(1)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Back to email
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
                  >
                    {forgotLoading ? 'Resetting...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
