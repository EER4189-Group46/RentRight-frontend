import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ItemModal from '../components/ItemModal';
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  MapPin,
  Tag,
  Search,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Building2,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function MyItemsPage({ onNavigate, onSelectItem }) {
  const { user, token, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingStatusId, setTogglingStatusId] = useState(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success) {
          setCategories(data.data || []);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch provider items
  const fetchMyItems = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/items/mine', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.data || []);
      } else {
        setError(data.message || 'Failed to load items');
      }
    } catch (err) {
      setError(err.message || 'Network error while fetching items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'provider') {
      fetchMyItems();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, token]);

  const handleOpenAddModal = () => {
    setItemToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setItemToEdit(item);
    setModalOpen(true);
  };

  const handleItemSaved = (savedItem, isEdit) => {
    if (isEdit) {
      setItems((prev) => prev.map((item) => (item.id === savedItem.id ? { ...item, ...savedItem } : item)));
      setActionSuccess(`"${savedItem.name}" was updated successfully.`);
    } else {
      setItems((prev) => [savedItem, ...prev]);
      setActionSuccess(`"${savedItem.name}" was added to your listings.`);
    }
    setTimeout(() => setActionSuccess(''), 4000);
  };

  // Quick toggle availability status (available <-> unavailable)
  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 'available' ? 'unavailable' : 'available';
    setTogglingStatusId(item.id);
    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to update item status');
      }

      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i))
      );
      setActionSuccess(`Listing "${item.name}" marked as ${newStatus === 'available' ? 'Available' : 'Unavailable'}.`);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to toggle status.');
    } finally {
      setTogglingStatusId(null);
    }
  };

  const handleDeleteItem = async (itemId) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete item');
      }

      setItems((prev) => prev.filter((item) => item.id !== itemId));
      setActionSuccess('Item was removed from your listings.');
      setDeleteConfirmId(null);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to delete item.');
    } finally {
      setDeleting(false);
    }
  };

  // Auth & Role check guards
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Provider Access Required</h2>
        <p className="text-sm text-slate-500">Please sign in as an Item Provider to view and manage rental listings.</p>
        <button
          onClick={() => onNavigate && onNavigate('login')}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (user?.role !== 'provider') {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
          <Building2 className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Item Provider Account Required</h2>
        <p className="text-sm text-slate-500">
          Your current account role is <span className="font-bold text-slate-800 capitalize">{user?.role}</span>. Only Item Providers can list and manage inventory.
        </p>
        <button
          onClick={() => onNavigate && onNavigate('register')}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition"
        >
          Register as an Item Provider
        </button>
      </div>
    );
  }

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'all' || String(item.category_id) === String(selectedCategory);
    const matchesStatus =
      statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const availableCount = items.filter((i) => i.status === 'available').length;
  const unavailableCount = items.filter((i) => i.status !== 'available').length;
  const totalPendingRequests = items.reduce((sum, i) => sum + (i.pending_requests || 0), 0);

  return (
    <div className="space-y-8">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Rental Inventory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your rental listings, availability status, pricing, and incoming customer requests
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate && onNavigate('requests')}
            className="inline-flex items-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm rounded-2xl shadow-sm transition"
          >
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Incoming Requests</span>
            {totalPendingRequests > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500 text-white font-black animate-pulse">
                {totalPendingRequests}
              </span>
            )}
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-2xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add New Item
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Listings</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{items.length}</h3>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active & Listed</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{availableCount}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Requests</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{totalPendingRequests}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Alerts */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-sm text-emerald-800 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or location..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white text-slate-700"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="available">🟢 Available</option>
            <option value="unavailable">🔴 Unavailable</option>
            <option value="maintenance">🟡 Maintenance</option>
          </select>

          <button
            onClick={fetchMyItems}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Refresh items"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Items List / Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
          <p className="text-sm">Loading your inventory...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">No items found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {searchTerm || selectedCategory !== 'all' || statusFilter !== 'all'
                ? 'No items match your active search filters.'
                : "You haven't listed any rental equipment yet. Add your first item to start receiving customer requests."}
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Your First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const hasImages = item.images && item.images.length > 0;
            const primaryImage = hasImages
              ? item.images[0]
              : 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80';

            const isAvailable = item.status === 'available';
            const isToggling = togglingStatusId === item.id;
            const pendingReqs = item.pending_requests || 0;
            const totalReqs = item.total_requests || 0;

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition group"
              >
                <div>
                  {/* Image & Status Badge */}
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={primaryImage}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/400x300?text=No+Image';
                      }}
                    />

                    {/* Category Tag */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 backdrop-blur-md text-slate-800 shadow-sm border border-slate-200/50">
                        {item.category_name || 'Item'}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                          isAvailable
                            ? 'bg-emerald-500 text-white'
                            : item.status === 'maintenance'
                            ? 'bg-amber-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {isAvailable ? 'Available' : item.status === 'maintenance' ? 'Maintenance' : 'Unavailable'}
                      </span>
                    </div>

                    {/* Pending Requests Callout */}
                    {pendingReqs > 0 && (
                      <div className="absolute bottom-2 left-2 bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm shadow-md flex items-center gap-1 animate-pulse">
                        <Clock className="w-3 h-3" />
                        <span>{pendingReqs} pending request{pendingReqs > 1 ? 's' : ''}!</span>
                      </div>
                    )}

                    {hasImages && item.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-sm">
                        +{item.images.length - 1} photos
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-3">
                    <div className="space-y-1">
                      <h3
                        onClick={() => onSelectItem && onSelectItem(item.id)}
                        className="font-bold text-slate-900 text-base line-clamp-1 hover:text-emerald-700 cursor-pointer transition"
                      >
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {item.description || 'No additional description provided.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>

                    {/* Pricing Info */}
                    <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-slate-400">Daily: </span>
                        <span className="text-lg font-black text-emerald-700">
                          Rs. {parseFloat(item.price_per_day).toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400"> / day</span>
                      </div>

                      {item.deposit_amount && (
                        <div className="text-right text-[11px] text-slate-500">
                          Deposit: <strong className="text-slate-700">Rs. {parseFloat(item.deposit_amount).toLocaleString()}</strong>
                        </div>
                      )}
                    </div>

                    {/* Rental Request Activity Stats */}
                    <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Total Requests: <strong>{totalReqs}</strong></span>
                      </div>

                      <button
                        onClick={() => onNavigate && onNavigate('requests')}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
                      >
                        View <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Quick Toggle Status */}
                  <button
                    onClick={() => handleToggleStatus(item)}
                    disabled={isToggling}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition shadow-sm ${
                      isAvailable
                        ? 'bg-white hover:bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                    title={isAvailable ? 'Temporarily pause requests for this item' : 'Activate item to receive rental requests'}
                  >
                    {isToggling ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : isAvailable ? (
                      <>
                        <ToggleRight className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-3.5 h-3.5 text-slate-400" />
                        <span>Inactive</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" /> Edit Listing
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-100"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Delete Rental Listing?</h3>
              <p className="text-xs text-slate-500">
                This item will be permanently removed from the RentRight platform and cannot be recovered.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => handleDeleteItem(deleteConfirmId)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold rounded-xl transition shadow-sm disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Item Modal */}
      <ItemModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleItemSaved}
        itemToEdit={itemToEdit}
        categories={categories}
      />
    </div>
  );
}
