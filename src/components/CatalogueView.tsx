import React, { useState } from 'react';
import { useCMS } from '../context/CMSContext';
import { ProductItem } from '../types';
import { Search, SlidersHorizontal, ArrowUpRight, Star } from 'lucide-react';
import { PopOut } from './PopOut';
import { Card3D, Card3DLayer } from './Card3D';

interface CatalogueViewProps {
  onSelectProduct: (product: ProductItem) => void;
  initialCategory?: string;
}

export function CatalogueView({ onSelectProduct, initialCategory = 'all' }: CatalogueViewProps) {
  const { activeContent } = useCMS();
  const products = activeContent.products || [];
  const categories = activeContent.categories || [];

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'name'>('featured');

  const filtered = products.filter((p) => {
    const title = p.name || p.title || '';
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'featured') {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    }
    const nameA = a.name || a.title || '';
    const nameB = b.name || b.title || '';
    return nameA.localeCompare(nameB);
  });

  return (
    <div className="pt-28 pb-32 bg-[#121212] min-h-screen text-[#e5e2db]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Page Header */}
        <PopOut direction="pop-up" className="mb-12">
          <span className="text-xs uppercase tracking-[0.3em] text-[#c5a059] block mb-3 font-medium">
            The Complete Portfolio
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-light text-[#e5e2db] mb-4">
            Curated Bespoke Catalogue
          </h1>
          <p className="text-[#b0aca3] text-sm sm:text-base font-light max-w-2xl leading-relaxed">
            Every piece is tailored to order with selected solid timbers, architectural joinery, and customized dimensions.
          </p>
        </PopOut>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-8 border-b border-white/10 mb-12">
          {/* Categories Pill List */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-5 py-2 rounded-full text-xs uppercase tracking-[0.15em] font-medium whitespace-nowrap cursor-pointer transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#c5a059] text-[#121212] shadow-md'
                  : 'bg-white/5 text-[#b0aca3] hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              All Pieces ({products.length})
            </button>
            {categories.map((c) => {
              const catKey = c.slug || c.name || c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(catKey)}
                  className={`px-5 py-2 rounded-full text-xs uppercase tracking-[0.15em] font-medium whitespace-nowrap cursor-pointer transition-all ${
                    selectedCategory === catKey
                      ? 'bg-[#c5a059] text-[#121212] shadow-md'
                      : 'bg-white/5 text-[#b0aca3] hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>

          {/* Search & Sort Input */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-4 py-2 text-xs text-[#e5e2db] placeholder-white/40 focus:outline-none focus:border-[#c5a059]"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-[#e5e2db] focus:outline-none focus:border-[#c5a059] cursor-pointer"
            >
              <option value="featured" className="bg-[#1a1a1a]">Sort: Featured</option>
              <option value="name" className="bg-[#1a1a1a]">Sort: Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        {sorted.length === 0 ? (
          <div className="text-center py-24 bg-white/[0.02] border border-white/10 rounded-3xl">
            <p className="text-lg font-serif text-[#e5e2db] mb-2">No furniture pieces found</p>
            <p className="text-xs text-[#b0aca3]">Try clearing search or choosing another category.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-6 text-xs uppercase tracking-[0.2em] text-[#c5a059] border border-[#c5a059]/40 px-6 py-2.5 rounded-full hover:bg-[#c5a059] hover:text-[#121212] transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sorted.map((item, idx) => (
              <PopOut
                key={item.id}
                direction={idx % 2 === 0 ? 'pop-up' : 'late-pop'}
                delay={(idx % 6) * 0.07}
                className="h-full"
              >
                <Card3D
                  depth={7}
                  scaleOnHover={1.03}
                  elevateZ={22}
                  className="h-full rounded-3xl"
                  onClick={() => onSelectProduct(item)}
                >
                  <div className="group bg-[#181818] border border-white/10 hover:border-[#c5a059]/50 rounded-3xl p-4 transition-colors duration-500 cursor-pointer flex flex-col justify-between shadow-xl h-full">
                    <div>
                      {/* Image container with 3D Depth Layer */}
                      <Card3DLayer depth={15}>
                        <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-neutral-900 border border-white/5 mb-4 shadow-md">
                          <img
                            src={item.primaryImage || item.image || (item.images && item.images[0]) || ''}
                            alt={item.title || item.name || 'Furniture Piece'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            loading="lazy"
                          />
                          {item.featured && (
                            <div className="absolute top-3 left-3 bg-[#c5a059] text-[#121212] text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-lg z-10">
                              Featured
                            </div>
                          )}
                          {item.images && item.images.length > 1 && (
                            <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-full border border-white/10 z-10">
                              +{item.images.length} views
                            </div>
                          )}
                        </div>
                      </Card3DLayer>

                      {/* Content with 3D Depth Layer */}
                      <Card3DLayer depth={30}>
                        <div className="space-y-2 px-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-[0.2em] text-[#c5a059] font-medium">
                              {categories.find((c) => c.slug === item.category)?.name || item.category}
                            </span>
                            <span className="text-xs text-[#c5a059] font-serif font-medium">{item.price}</span>
                          </div>
                          <h3 className="text-xl font-serif text-[#e5e2db] group-hover:text-[#c5a059] transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-[#b0aca3] text-xs font-light line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </Card3DLayer>
                    </div>

                    {/* Bottom Action with High Z Depth */}
                    <Card3DLayer depth={45}>
                      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs px-1">
                        <span className="text-white/40 uppercase tracking-widest text-[10px] group-hover:text-white/70 transition-colors">
                          View Specs & Finishes
                        </span>
                        <div className="w-8 h-8 rounded-full border border-white/20 group-hover:border-[#c5a059] group-hover:bg-[#c5a059] group-hover:text-[#121212] flex items-center justify-center transition-all text-white/60 shadow-sm">
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </div>
                    </Card3DLayer>
                  </div>
                </Card3D>
              </PopOut>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
