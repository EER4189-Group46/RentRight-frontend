import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import MyItemsPage from './pages/MyItemsPage';
import BrowsePage from './pages/BrowsePage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import RentalRequestsPage from './pages/RentalRequestsPage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import EarningsPage from './pages/EarningsPage';
import {
  Package,
  Search,
  LogIn,
  UserPlus,
  CreditCard,
  DollarSign,
  Calendar,
  Sparkles
} from 'lucide-react';

function Navigation({ activeTab, setActiveTab, setSelectedItemId }) {
  const { user, token, isAuthenticated } = useAuth();
  const isProvider = user?.role === 'provider';
  const isRenter = user?.role === 'renter';
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && isProvider && token) {
      const checkPending = async () => {
        try {
          const res = await fetch('/api/rental-requests/provider', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            const pending = data.data.filter((r) => r.status === 'pending').length;
            setPendingRequestsCount(pending);
          }
        } catch {
          // ignore background notification failure
        }
      };
      checkPending();
      const interval = setInterval(checkPending, 30000);
      return () => clearInterval(interval);
    } else {
      setPendingRequestsCount(0);
    }
  }, [isAuthenticated, isProvider, token, activeTab]);

  const handleNav = (tab) => {
    setSelectedItemId(null);
    setActiveTab(tab);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => handleNav('browse')}
          className="flex items-center space-x-3 text-left focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm font-bold text-xl">
            R
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              Rent<span className="text-emerald-600">Right</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded-full border border-emerald-200">
              Sri Lanka
            </span>
          </div>
        </button>

        {/* Nav Links */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => handleNav('browse')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'browse'
                ? 'bg-slate-100 text-slate-900 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Search className="w-4 h-4 text-emerald-600" />
            <span>Browse</span>
          </button>

          {/* Provider Specific Tabs */}
          {isAuthenticated && isProvider && (
            <>
              <button
                onClick={() => handleNav('my-items')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  activeTab === 'my-items'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Package className="w-4 h-4 text-emerald-600" />
                <span>My Listings</span>
              </button>

              <button
                onClick={() => handleNav('requests')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  activeTab === 'requests'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Requests</span>
                {pendingRequestsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNav('earnings')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  activeTab === 'earnings'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Earnings</span>
              </button>
            </>
          )}

          {/* Renter Specific Tabs */}
          {isAuthenticated && !isProvider && (
            <>
              <button
                onClick={() => handleNav('requests')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  activeTab === 'requests'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>My Requests</span>
              </button>

              <button
                onClick={() => handleNav('payments')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  activeTab === 'payments'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Payments</span>
              </button>
            </>
          )}

          {/* Auth State */}
          {isAuthenticated ? (
            <button
              onClick={() => handleNav('profile')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 'profile'
                  ? 'bg-slate-100 text-slate-900 ring-1 ring-slate-300 font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="max-w-[100px] truncate hidden md:inline">{user?.name}</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                {user?.role}
              </span>
            </button>
          ) : (
            <>
              <button
                onClick={() => handleNav('login')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  activeTab === 'login'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => handleNav('register')}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('browse'); // 'browse', 'item-details', 'my-items', 'requests', 'payments', 'earnings', 'login', 'register', 'profile'
  const [selectedItemId, setSelectedItemId] = useState(null);

  const handleSelectItem = (itemId) => {
    setSelectedItemId(itemId);
    setActiveTab('item-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToBrowse = () => {
    setSelectedItemId(null);
    setActiveTab('browse');
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setSelectedItemId={setSelectedItemId}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          {(activeTab === 'browse' || activeTab === 'home') && (
            <BrowsePage
              onSelectItem={handleSelectItem}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'item-details' && (
            <ItemDetailsPage
              itemId={selectedItemId}
              onBack={handleBackToBrowse}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'my-items' && (
            <MyItemsPage
              onNavigate={setActiveTab}
              onSelectItem={handleSelectItem}
            />
          )}
          {(activeTab === 'requests' || activeTab === 'my-requests') && (
            <RentalRequestsPage
              onNavigate={setActiveTab}
              onSelectItem={handleSelectItem}
              initialView={activeTab === 'my-requests' ? 'mine' : undefined}
            />
          )}
          {activeTab === 'payments' && <PaymentHistoryPage onNavigate={setActiveTab} />}
          {activeTab === 'earnings' && <EarningsPage onNavigate={setActiveTab} />}
          {activeTab === 'login' && <LoginPage onNavigate={setActiveTab} />}
          {activeTab === 'register' && <RegisterPage onNavigate={setActiveTab} />}
          {activeTab === 'profile' && <ProfilePage onNavigate={setActiveTab} />}
        </main>

        <footer className="bg-white border-t border-slate-200 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-1">
            <p>© {new Date().getFullYear()} RentRight Sri Lanka. Multi-Category Item Rental Platform.</p>
            <p className="text-[11px] text-slate-400">
              Academic Project Scope • Simulated Payment Gateway Flow
            </p>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
