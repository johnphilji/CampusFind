import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  MapPin,
  Calendar,
  Layers,
  ArrowUpDown,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ItemCard } from '../components/cards/ItemCard';
import { CAMPUS_CATEGORIES, CAMPUS_LOCATIONS } from '../data/mockData';

export const ExplorePage: React.FC = () => {
  const { items } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'All';
  const typeParam = (searchParams.get('type') as 'all' | 'lost' | 'found') || 'all';
  const locationParam = searchParams.get('location') || 'All';

  const [search, setSearch] = useState(queryParam);
  const [selectedType, setSelectedType] = useState<'all' | 'lost' | 'found'>(typeParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedLocation, setSelectedLocation] = useState(locationParam);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Sync state if search params change
  React.useEffect(() => {
    if (queryParam) setSearch(queryParam);
    if (categoryParam) setSelectedCategory(categoryParam);
    if (typeParam) setSelectedType(typeParam);
    if (locationParam) setSelectedLocation(locationParam);
  }, [queryParam, categoryParam, typeParam, locationParam]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search matching
      const matchesSearch =
        !search.trim() ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase()) ||
        item.referenceNumber.toLowerCase().includes(search.toLowerCase());

      // Type matching
      const matchesType = selectedType === 'all' || item.type === selectedType;

      // Category matching
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

      // Location matching
      const matchesLocation =
        selectedLocation === 'All' ||
        item.location.toLowerCase().includes(selectedLocation.toLowerCase());

      return matchesSearch && matchesType && matchesCategory && matchesLocation;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [items, search, selectedType, selectedCategory, selectedLocation, sortBy]);

  const clearAllFilters = () => {
    setSearch('');
    setSelectedType('all');
    setSelectedCategory('All');
    setSelectedLocation('All');
    setSearchParams({});
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedType !== 'all' ||
    selectedCategory !== 'All' ||
    selectedLocation !== 'All';

  return (
    <div className="pb-24 md:pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
            Explore Campus Listings
          </h1>
          <p className="text-xs sm:text-sm text-[#70798B]">
            Browse all verified lost and found records across campus departments
          </p>
        </div>

        {/* Lost / Found Segmented Control */}
        <div className="inline-flex p-1 bg-slate-200/80 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setSelectedType('all')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
              selectedType === 'all'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Items ({items.length})
          </button>
          <button
            onClick={() => setSelectedType('lost')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
              selectedType === 'lost'
                ? 'bg-rose-50 text-rose-700 shadow-xs border border-rose-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lost ({items.filter(i => i.type === 'lost').length})
          </button>
          <button
            onClick={() => setSelectedType('found')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
              selectedType === 'found'
                ? 'bg-blue-50 text-blue-900 shadow-xs border border-blue-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Found ({items.filter(i => i.type === 'found').length})
          </button>
        </div>
      </div>

      {/* Search Input Bar + Filter Triggers */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by keyword, brand, location, or CF reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#70798B] hover:text-[#172033]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mobile Filter Sheet Button */}
        <button
          onClick={() => setIsFilterSheetOpen(true)}
          className={`md:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border ${
            hasActiveFilters
              ? 'bg-[#E8EEFF] text-[#243B8A] border-[#3559C7]/30'
              : 'bg-white text-[#70798B] border-[#E7EAF1]'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-[#243B8A]" />
          )}
        </button>

        {/* Sort selector */}
        <div className="hidden sm:flex items-center gap-2 bg-white border border-[#E7EAF1] rounded-xl px-3 py-2 text-xs text-[#70798B]">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#3559C7]" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent font-medium text-[#172033] focus:outline-none cursor-pointer"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
          </select>
        </div>
      </div>

      {/* Desktop Horizontal Filter Badges */}
      <div className="hidden md:flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-[#70798B] mr-1">Categories:</span>
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-3 py-1 rounded-full font-medium transition-all ${
            selectedCategory === 'All'
              ? 'bg-[#243B8A] text-white shadow-xs'
              : 'bg-white text-[#70798B] hover:text-[#172033] border border-[#E7EAF1]'
          }`}
        >
          All Categories
        </button>
        {CAMPUS_CATEGORIES.map(c => (
          <button
            key={c.name}
            onClick={() => setSelectedCategory(c.name)}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              selectedCategory === c.name
                ? 'bg-[#243B8A] text-white shadow-xs'
                : 'bg-white text-[#70798B] hover:text-[#172033] border border-[#E7EAF1]'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Campus Location Filter Dropdown (Desktop / Tablet) */}
      <div className="hidden md:flex items-center gap-3 text-xs">
        <span className="font-semibold text-[#70798B]">Location Filter:</span>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedLocation('All')}
            className={`px-2.5 py-1 rounded-lg ${
              selectedLocation === 'All'
                ? 'bg-[#E8EEFF] text-[#243B8A] font-semibold'
                : 'text-[#70798B] hover:bg-slate-100'
            }`}
          >
            All Campus
          </button>
          {CAMPUS_LOCATIONS.slice(0, 6).map(loc => (
            <button
              key={loc}
              onClick={() => setSelectedLocation(loc)}
              className={`px-2.5 py-1 rounded-lg ${
                selectedLocation === loc
                  ? 'bg-[#E8EEFF] text-[#243B8A] font-semibold'
                  : 'text-[#70798B] hover:bg-slate-100'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filter Pills Bar */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap text-xs bg-slate-50 p-2.5 rounded-xl border border-[#E7EAF1]">
          <span className="text-[#70798B] font-medium">Applied Filters:</span>
          {selectedType !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-white border border-[#E7EAF1] px-2 py-0.5 rounded-md font-semibold text-[#172033]">
              Type: {selectedType.toUpperCase()}
              <button onClick={() => setSelectedType('all')}><X className="w-3 h-3 text-[#70798B]" /></button>
            </span>
          )}
          {selectedCategory !== 'All' && (
            <span className="inline-flex items-center gap-1 bg-white border border-[#E7EAF1] px-2 py-0.5 rounded-md font-semibold text-[#172033]">
              Category: {selectedCategory}
              <button onClick={() => setSelectedCategory('All')}><X className="w-3 h-3 text-[#70798B]" /></button>
            </span>
          )}
          {selectedLocation !== 'All' && (
            <span className="inline-flex items-center gap-1 bg-white border border-[#E7EAF1] px-2 py-0.5 rounded-md font-semibold text-[#172033]">
              Location: {selectedLocation}
              <button onClick={() => setSelectedLocation('All')}><X className="w-3 h-3 text-[#70798B]" /></button>
            </span>
          )}
          {search && (
            <span className="inline-flex items-center gap-1 bg-white border border-[#E7EAF1] px-2 py-0.5 rounded-md font-semibold text-[#172033]">
              Keyword: "{search}"
              <button onClick={() => setSearch('')}><X className="w-3 h-3 text-[#70798B]" /></button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-[#D64545] font-semibold ml-auto hover:underline"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#70798B]">
        <span>
          Showing <strong className="text-[#172033]">{filteredItems.length}</strong> items
        </span>
      </div>

      {/* Grid of Results */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-[#E7EAF1] p-10 text-center card-shadow max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#E8EEFF] text-[#243B8A] flex items-center justify-center mx-auto">
            <FolderOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#172033]">No items matched your filters</h3>
          <p className="text-xs text-[#70798B] leading-relaxed">
            Try adjusting your search terms or clearing category and location filters to see more results.
          </p>
          <div className="pt-2">
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 rounded-xl bg-[#243B8A] text-white text-xs font-semibold shadow-xs hover:bg-[#3559C7] transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}

      {/* Mobile Filters Bottom Sheet */}
      {isFilterSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-xs md:hidden animate-in fade-in duration-200">
          <div className="w-full bg-white rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto bottom-nav-shadow">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF1]">
              <h3 className="font-bold text-[#172033]">Filter Items</h3>
              <button
                onClick={() => setIsFilterSheetOpen(false)}
                className="p-1 rounded-lg text-[#70798B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#172033] uppercase">Category</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`p-2 text-xs rounded-xl border text-left font-medium ${
                    selectedCategory === 'All'
                      ? 'bg-[#E8EEFF] text-[#243B8A] border-[#3559C7]'
                      : 'border-[#E7EAF1] text-[#70798B]'
                  }`}
                >
                  All Categories
                </button>
                {CAMPUS_CATEGORIES.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`p-2 text-xs rounded-xl border text-left font-medium truncate ${
                      selectedCategory === cat.name
                        ? 'bg-[#E8EEFF] text-[#243B8A] border-[#3559C7]'
                        : 'border-[#E7EAF1] text-[#70798B]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#172033] uppercase">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E7EAF1] text-xs font-medium text-[#172033]"
              >
                <option value="All">All Campus Zones</option>
                {CAMPUS_LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Apply & Reset Buttons */}
            <div className="pt-3 flex gap-2">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2.5 rounded-xl border border-[#E7EAF1] text-xs font-semibold text-[#70798B]"
              >
                Reset
              </button>
              <button
                onClick={() => setIsFilterSheetOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#243B8A] text-white text-xs font-semibold shadow-xs"
              >
                Show Results ({filteredItems.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
