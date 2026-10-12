import { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Tag,
  Star,
  RefreshCw,
  Package,
  ArrowUpDown,
  X,
  ArrowRight,
  Filter
} from 'lucide-react';

export default function BrowsePage({ onSelectItem, initialCategory, onNavigate }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters State
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [location, setLocation] = useState('');
  const [sort, setSort] = useState('newest');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

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

  // Fetch filtered items
  const fetchItems = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (keyword.trim()) params.append('keyword', keyword.trim());
      if (selectedCategory) params.append('category_id', selectedCategory);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      if (location.trim()) params.append('location', location.trim());
      if (sort) params.append('sort', sort);

      const res = await fetch(`/api/items?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setItems(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch items');
      }
    } catch (err) {
      setError(err.message || 'Network error loading items');
    } finally {
      setLoading(false);
    }
  };

  // Debounced/triggered fetch on filter change
  useEffect(() => {
    fetchItems();
  }, [selectedCategory, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleResetFilters = () => {
    setKeyword('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setLocation('');
    setSort('newest');
    // fetch will trigger via useEffect for category/sort reset
    setTimeout(() => {
      fetch('/api/items')
        .then((r) => r.json())
        .then((d) => setItems(d.data || []));
    }, 50);
  };

  const activeFilterCount = [
    keyword,
    selectedCategory,
    minPrice,
    maxPrice,
    location,
  ].filter(Boolean).length;

  return (
    <div className="space-y-8">
      {/* Top Search & Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl space-y-6">
        <div className="max-w-2xl space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Discover & Rent Items in Sri Lanka
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base">
            Find construction tools, cameras, camping gear, transport, and event equipment near you.
          </p>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="bg-white p-2 rounded-2xl shadow-lg flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="What are you looking to rent? (e.g. Drill, Camera, Tent, Generator)"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none"
            />
          </div>

          <div className="relative w-full sm:w-60 border-t sm:border-t-0 sm:border-l border-slate-100 flex items-center">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (e.g. Colombo)"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Categories Horizontal Scroll / Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            selectedCategory === ''
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
          }`}
        >
          All Categories
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(String(cat.id))}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              String(selectedCategory) === String(cat.id)
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Main Grid & Filters Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Filter className="w-4 h-4 text-emerald-600" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Price Per Day (LKR)
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-[10px] font-bold text-slate-400">Rs.</span>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min"
                    className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <span className="text-slate-400 text-xs">-</span>
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-[10px] font-bold text-slate-400">Rs.</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none text-slate-700"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Apply Filters Button */}
            <button
              onClick={fetchItems}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              Apply Filters
            </button>
          </div>
        </aside>

        {/* Items Grid Content */}
        <section className="lg:col-span-3 space-y-4">
          {/* Results Header & Sort Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-700">
              Showing <span className="font-bold text-slate-900">{items.length}</span> available rental items
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Items Grid */}
          {loading ? (
            <div className="py-20 text-center text-slate-500 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
              <p className="text-sm">Searching available items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">No items match your criteria</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Try adjusting your search terms, expanding the price range, or clearing filters.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => {
                const primaryImage =
                  item.images && item.images.length > 0
                    ? item.images[0]
                    : 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80';

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectItem && onSelectItem(item.id)}
                    className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-300 transition duration-200 cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                        <img
                          src={primaryImage}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/400x300?text=RentRight';
                          }}
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-slate-800 shadow-sm border border-slate-200/50">
                            {item.category_name || 'Item'}
                          </span>
                        </div>

                        {item.images && item.images.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-sm">
                            +{item.images.length - 1} photos
                          </div>
                        )}
                      </div>

                      {/* Info Body */}
                      <div className="p-5 space-y-2.5">
                        <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-emerald-700 transition">
                          {item.name}
                        </h3>

                        <p className="text-xs text-slate-500 line-clamp-2">
                          {item.description || 'No detailed description provided.'}
                        </p>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing & CTA Footer */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400">Rate: </span>
                        <span className="text-base font-black text-emerald-700">
                          Rs. {parseFloat(item.price_per_day).toLocaleString()}
                        </span>
                        <span className="text-[11px] text-slate-400">/day</span>
                      </div>

                      <span className="text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition inline-flex items-center gap-1">
                        View Details <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
