import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import { ProductItem } from '../../types';
import { MultipleImagesField } from './MultipleImagesField';
import { Plus, Trash2, Search, Star, Package, UploadCloud, CheckCircle } from 'lucide-react';

export function AdminProducts() {
  const { draftContent, saveProducts, publishDraft, isPublishing, hasDraftChanges } = useCMS();
  const products = draftContent.products;
  const categories = draftContent.categories;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(products[0]?.id || null);

  const filteredProducts = products.filter((p) => {
    const title = p.name || p.title || '';
    const desc = p.description || '';
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'all' || p.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const activeEditingProduct = products.find((p) => p.id === editingId) || filteredProducts[0];

  const handleUpdateProduct = (id: string, updates: Partial<ProductItem>) => {
    const updated = products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    saveProducts(updated);
  };

  const handleAddProduct = () => {
    const defaultCat = categories[0]?.slug || categories[0]?.name || 'Living Room';
    const newProd: ProductItem = {
      id: `prod-${Date.now()}`,
      name: 'New Bespoke Piece',
      title: 'New Bespoke Piece',
      category: defaultCat,
      price: 'Price on request',
      image: '',
      primaryImage: '',
      images: [],
      description: 'Handcrafted with selected hardwood, premium hardware, and tailor-made joinery.',
      dimensions: 'Custom dimensions available',
      material: 'Natural Walnut, Brass',
      materials: 'Natural Walnut, Brass',
      leadTime: '3-4 Weeks',
      featured: true,
      inStock: true,
      available: true,
      features: ['Solid hardwood', 'Master artisan joinery'],
      order: products.length + 1,
    };
    saveProducts([newProd, ...products]);
    setEditingId(newProd.id);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const updated = products.filter((p) => p.id !== id);
      saveProducts(updated);
      if (editingId === id) {
        setEditingId(updated[0]?.id || null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#b89753] block">
            Furniture Collection
          </span>
          <h2 className="text-2xl font-serif text-[#1a1a1a]">Products & Catalogue</h2>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Manage catalogue items, high-res photography angles, and custom specifications.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleAddProduct}
            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-4 py-2.5 rounded-full text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
          <button
            type="button"
            onClick={async () => {
              await publishDraft();
            }}
            disabled={isPublishing}
            className="bg-[#b89753] hover:bg-[#a38446] disabled:opacity-50 text-white px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
          >
            {isPublishing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Publishing...</span>
              </>
            ) : hasDraftChanges ? (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Publish Changes Live</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-300" />
                <span>Published Live</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, description or timber..."
            className="w-full bg-white border border-neutral-200 rounded-full pl-10 pr-4 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
              filterCategory === 'all'
                ? 'bg-[#1a1a1a] text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            All ({products.length})
          </button>
          {categories.map((c) => {
            const catVal = c.slug || c.name || c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilterCategory(catVal)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                  filterCategory === catVal
                    ? 'bg-[#1a1a1a] text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Product Cards List */}
        <div className="lg:col-span-5 space-y-3 max-h-[750px] overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200 text-neutral-400 text-xs">
              No products found matching your search.
            </div>
          ) : (
            filteredProducts.map((prod) => {
              const isSelected = prod.id === activeEditingProduct?.id;
              const prodTitle = prod.name || prod.title || 'Untitled Piece';
              const prodImg = prod.primaryImage || prod.image || prod.images?.[0] || '';
              return (
                <div
                  key={prod.id}
                  onClick={() => setEditingId(prod.id)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 bg-white ${
                    isSelected
                      ? 'border-[#b89753] ring-4 ring-[#b89753]/15 shadow-sm'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200 relative flex items-center justify-center">
                      {prodImg ? (
                        <img src={prodImg} alt={prodTitle} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[9px] uppercase font-semibold text-neutral-400">No Image</span>
                      )}
                      {prod.featured && (
                        <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-[#b89753] text-white flex items-center justify-center shadow-xs">
                          <Star className="w-2.5 h-2.5 fill-current" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-[#1a1a1a] truncate">{prodTitle}</h4>
                      <p className="text-[11px] text-[#b89753] font-medium">{prod.formattedPrice || prod.price}</p>
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wider">
                        {categories.find((c) => (c.slug || c.name) === prod.category)?.name || prod.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleUpdateProduct(prod.id, { featured: !prod.featured })}
                      title={prod.featured ? 'Featured on homepage' : 'Mark as featured'}
                      className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                        prod.featured ? 'text-[#b89753] bg-amber-50' : 'text-neutral-300 hover:text-neutral-500'
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detailed Edit Panel */}
        <div className="lg:col-span-7">
          {activeEditingProduct ? (
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#b89753]" />
                  <h3 className="text-base font-semibold text-[#1a1a1a]">
                    Edit: {activeEditingProduct.name || activeEditingProduct.title}
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-neutral-600">
                    <input
                      type="checkbox"
                      checked={activeEditingProduct.featured || false}
                      onChange={(e) => handleUpdateProduct(activeEditingProduct.id, { featured: e.target.checked })}
                      className="rounded text-[#b89753] focus:ring-[#b89753]"
                    />
                    <span>Featured Piece</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-neutral-600">
                    <input
                      type="checkbox"
                      checked={activeEditingProduct.inStock !== false && activeEditingProduct.available !== false}
                      onChange={(e) =>
                        handleUpdateProduct(activeEditingProduct.id, {
                          inStock: e.target.checked,
                          available: e.target.checked,
                        })
                      }
                      className="rounded text-[#b89753] focus:ring-[#b89753]"
                    />
                    <span>In Stock</span>
                  </label>
                </div>
              </div>

              {/* Multiple Photos Gallery Management */}
              <MultipleImagesField
                label="Product Imagery (Multi-Angle Gallery)"
                images={
                  (activeEditingProduct.images && activeEditingProduct.images.length > 0
                    ? activeEditingProduct.images.filter((img): img is string => Boolean(img))
                    : (activeEditingProduct.primaryImage || activeEditingProduct.image)
                    ? [activeEditingProduct.primaryImage || activeEditingProduct.image || '']
                    : []
                  ).filter((img): img is string => Boolean(img))
                }
                primaryImage={activeEditingProduct.primaryImage || activeEditingProduct.image || ''}
                onChange={(newImages, newPrimary) =>
                  handleUpdateProduct(activeEditingProduct.id, {
                    images: newImages,
                    primaryImage: newPrimary,
                    image: newPrimary,
                  })
                }
                category="Products"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={activeEditingProduct.name || activeEditingProduct.title || ''}
                    onChange={(e) =>
                      handleUpdateProduct(activeEditingProduct.id, {
                        name: e.target.value,
                        title: e.target.value,
                      })
                    }
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
                    Category
                  </label>
                  <select
                    value={activeEditingProduct.category}
                    onChange={(e) => handleUpdateProduct(activeEditingProduct.id, { category: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
                  >
                    {categories.map((c) => {
                      const catVal = c.slug || c.name || c.id;
                      return (
                        <option key={c.id} value={catVal}>
                          {c.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
                    Price / Label
                  </label>
                  <input
                    type="text"
                    value={String(activeEditingProduct.price || '')}
                    onChange={(e) => handleUpdateProduct(activeEditingProduct.id, { price: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
                    placeholder="e.g. ₦1,250,000"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
                    Materials
                  </label>
                  <input
                    type="text"
                    value={activeEditingProduct.materials || activeEditingProduct.material || ''}
                    onChange={(e) =>
                      handleUpdateProduct(activeEditingProduct.id, {
                        materials: e.target.value,
                        material: e.target.value,
                      })
                    }
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
                    placeholder="e.g. Walnut & Leather"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
                    Lead Time
                  </label>
                  <input
                    type="text"
                    value={activeEditingProduct.leadTime || ''}
                    onChange={(e) => handleUpdateProduct(activeEditingProduct.id, { leadTime: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
                    placeholder="e.g. 2-3 Weeks"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
                  Dimensions / Spatial Specs
                </label>
                <input
                  type="text"
                  value={activeEditingProduct.dimensions || ''}
                  onChange={(e) => handleUpdateProduct(activeEditingProduct.id, { dimensions: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
                  placeholder="e.g. 280cm (W) x 105cm (D) x 78cm (H)"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
                  Description & Artisan Story
                </label>
                <textarea
                  rows={4}
                  value={activeEditingProduct.description}
                  onChange={(e) => handleUpdateProduct(activeEditingProduct.id, { description: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753] resize-none"
                  placeholder="Detailed architectural craftsmanship notes..."
                />
              </div>
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center text-neutral-400 text-xs">
              Select a product from the list to edit its details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
