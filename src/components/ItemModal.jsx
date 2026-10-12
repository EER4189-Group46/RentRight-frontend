import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  DollarSign,
  MapPin,
  Tag,
  AlertCircle,
  CheckCircle2,
  Package
} from 'lucide-react';

export default function ItemModal({ isOpen, onClose, onSaved, itemToEdit, categories }) {
  const { token } = useAuth();
  const isEditMode = !!itemToEdit;

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    price_per_day: '',
    location: '',
    status: 'available',
  });

  const [images, setImages] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Populate form data on open or when itemToEdit changes
  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        name: itemToEdit.name || '',
        category_id: itemToEdit.category_id ? String(itemToEdit.category_id) : '',
        description: itemToEdit.description || '',
        price_per_day: itemToEdit.price_per_day ? String(itemToEdit.price_per_day) : '',
        location: itemToEdit.location || '',
        status: itemToEdit.status || 'available',
      });
      setImages(itemToEdit.images && itemToEdit.images.length > 0 ? itemToEdit.images : ['']);
    } else {
      setFormData({
        name: '',
        category_id: categories && categories.length > 0 ? String(categories[0].id) : '',
        description: '',
        price_per_day: '',
        location: '',
        status: 'available',
      });
      setImages(['']);
    }
    setError('');
  }, [itemToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleImageChange = (index, value) => {
    const updated = [...images];
    updated[index] = value;
    setImages(updated);
  };

  const addImageField = () => {
    if (images.length < 5) {
      setImages([...images, '']);
    }
  };

  const removeImageField = (index) => {
    if (images.length === 1) {
      setImages(['']);
    } else {
      setImages(images.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.category_id || !formData.price_per_day || !formData.location.trim()) {
      setError('Please fill in all required fields (Name, Category, Price, and Location).');
      return;
    }

    const price = parseFloat(formData.price_per_day);
    if (isNaN(price) || price < 0) {
      setError('Please provide a valid positive price.');
      return;
    }

    setLoading(true);
    setError('');

    const cleanImages = images.filter((img) => img && img.trim().length > 0);

    const payload = {
      name: formData.name.trim(),
      category_id: parseInt(formData.category_id, 10),
      description: formData.description.trim() || null,
      price_per_day: price,
      location: formData.location.trim(),
      status: formData.status,
      images: cleanImages,
    };

    try {
      const url = isEditMode ? `/api/items/${itemToEdit.id}` : '/api/items';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to save item');
      }

      onSaved(data.data, isEditMode);
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred while saving the item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isEditMode ? 'Edit Rental Item' : 'Add New Rental Item'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditMode ? 'Update your listing details and pricing' : 'List a new item for rent in Sri Lanka'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-sm text-red-700">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Item Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Item Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Bosch Professional Rotary Hammer Drill"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                name="category_id"
                required
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
              >
                <option value="" disabled>Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Daily Rental Rate (LKR / Day) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-slate-400">
                  Rs.
                </span>
                <input
                  type="number"
                  name="price_per_day"
                  required
                  min="0"
                  step="50"
                  value={formData.price_per_day}
                  onChange={handleChange}
                  placeholder="2500"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Location & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Location (City / District) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Colombo 03 / Nugegoda"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Availability Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
              >
                <option value="available">🟢 Available for Rent</option>
                <option value="unavailable">🔴 Unavailable / Under Maintenance</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Description & Rental Terms
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe condition, specifications, deposit requirements, included accessories..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          {/* Images Section */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Item Image URLs
                </label>
                <p className="text-[11px] text-slate-400">Provide direct image URLs for photo gallery (up to 5 images)</p>
              </div>

              {images.length < 5 && (
                <button
                  type="button"
                  onClick={addImageField}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add URL
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {images.map((imgUrl, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      value={imgUrl}
                      onChange={(e) => handleImageChange(idx, e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                    />
                  </div>

                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(idx)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Thumbnail Previews */}
            {images.some((url) => url && url.trim().length > 0) && (
              <div className="flex gap-2 pt-2 overflow-x-auto">
                {images
                  .filter((url) => url && url.trim().length > 0)
                  .map((url, i) => (
                    <div
                      key={i}
                      className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shrink-0 relative group"
                    >
                      <img
                        src={url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/100x100?text=Invalid+Image';
                        }}
                      />
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving Listing...' : isEditMode ? 'Save Changes' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
