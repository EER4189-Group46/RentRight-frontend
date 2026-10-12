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
  Building2
} from 'lucide-react';

export default function MyItemsPage({ onNavigate }) {
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

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
      setItems((prev) => prev.map((item) => (item.id === savedItem.id ? savedItem : item)));
      setActionSuccess(`"${savedItem.name}" was updated successfully.`);
    } else {
      setItems((prev) => [savedItem, ...prev]);
      setActionSuccess(`"${savedItem.name}" was added to your listings.`);
    }
    setTimeout(() => setActionSuccess(''), 4000);
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
    return matchesSearch && matchesCategory;
  });

  const availableCount = items.filter((i) => i.status === 'available').length;
  const unavailableCount = items.filter((i) => i.status === 'unavailable').length;

  return (
    <div className="space-y-8">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Rental Inventory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your rental listings, availability, and pricing in Sri Lanka
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-2xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Add New Item
        </button>
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
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active / Available</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{availableCount}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Unavailable / In Use</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{unavailableCount}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertCircle className="w-5 h-5" />
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

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white text-slate-700"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
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
              {searchTerm || selectedCategory !== 'all'
                ? 'No items match your search filters.'
                : "You haven't listed any rental equipment yet. Add your first item to start earning."}
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
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-slate-800 shadow-sm border border-slate-200/50">
                        {item.category_name || 'Item'}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                          item.status === 'available'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {item.status === 'available' ? 'Available' : 'Unavailable'}
                      </span>
                    </div>

                    {hasImages && item.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-sm">
                        +{item.images.length - 1} photos
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-3">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-base line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {item.description || 'No additional description provided.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>

                    <div className="pt-2 flex items-baseline justify-between border-t border-slate-100">
                      <div>
                        <span className="text-xs text-slate-400">Rate: </span>
                        <span className="text-lg font-black text-emerald-700">
                          Rs. {parseFloat(item.price_per_day).toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400"> / day</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" /> Edit Item
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
