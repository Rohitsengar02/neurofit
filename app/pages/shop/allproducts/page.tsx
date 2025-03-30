'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  addDoc, 
  deleteDoc, 
  doc, 
  where 
} from 'firebase/firestore';
import { auth, db } from '@/app/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FiFilter, 
  FiHeart, 
  FiGrid, 
  FiList, 
  FiSliders, 
  FiX 
} from 'react-icons/fi';
import { HiHeart } from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import { useMediaQuery } from '../../../hooks/use-media-query';
import { Slider } from '../../../components/ui/slider';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Checkbox } from '../../../components/ui/checkbox';

interface Product {
  id: string;
  name: string;
  price: number;
  discountedPrice: number;
  mainImage: string;
  category: string;
  brand: string;
  rating: number;
  inStock: boolean;
  description?: string;
  createdAt: Date;
}

interface FilterState {
  priceRange: [number, number];
  categories: string[];
  brands: string[];
  sortBy: 'price_asc' | 'price_desc' | 'rating' | 'newest';
  inStock: boolean;
  viewMode: 'grid' | 'list';
}

export default function AllProductsShop() {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [maxPrice, setMaxPrice] = useState(1000); // Default max price

  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 1000], // Will be updated when products load
    categories: [],
    brands: [],
    sortBy: 'newest',
    inStock: false,
    viewMode: 'grid'
  });

  // Get unique categories and brands from products
  const categories = Array.from(new Set(products.map(p => p.category)));
  const brands = Array.from(new Set(products.map(p => p.brand)));

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const highestPrice = Math.max(...products.map(p => p.price));
      setMaxPrice(highestPrice);
      // Update the price range filter with the new max price
      setFilters(prev => ({
        ...prev,
        priceRange: [0, highestPrice]
      }));
    }
  }, [products]);

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const productsRef = collection(db, 'products');
      const q = query(productsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Price filter
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && 
      product.price <= filters.priceRange[1]
    );

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product => 
        filters.categories.includes(product.category)
      );
    }

    // Brand filter
    if (filters.brands.length > 0) {
      filtered = filtered.filter(product => 
        filters.brands.includes(product.brand)
      );
    }

    // In stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => product.inStock);
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // Already sorted by createdAt in query
        break;
    }

    setFilteredProducts(filtered);
  };

  const fetchWishlist = async () => {
    if (!user) return;
    try {
      const wishlistRef = collection(db, 'users', user.uid, 'wishlist');
      const snapshot = await getDocs(wishlistRef);
      const wishlistIds = snapshot.docs.map(doc => doc.data().productId);
      setWishlist(wishlistIds);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please sign in to add items to wishlist');
      return;
    }

    try {
      const wishlistRef = collection(db, 'users', user.uid, 'wishlist');
      const q = query(wishlistRef, where('productId', '==', productId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Add to wishlist
        const product = products.find(p => p.id === productId);
        if (!product) return;

        await addDoc(wishlistRef, {
          productId,
          name: product.name,
          mainImage: product.mainImage,
          price: product.price,
          discountedPrice: product.discountedPrice,
          createdAt: new Date()
        });
        setWishlist(prev => [...prev, productId]);
        toast.success('Added to wishlist');
      } else {
        // Remove from wishlist
        const docToDelete = snapshot.docs[0];
        await deleteDoc(doc(db, 'users', user.uid, 'wishlist', docToDelete.id));
        setWishlist(prev => prev.filter(id => id !== productId));
        toast.success('Removed from wishlist');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const toggleFilter = (type: 'categories' | 'brands', value: string): void => {
    setFilters(prev => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Controls Row */}
      <div className="flex flex-wrap items-center gap-3 mb-6 sticky top-0 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm z-10">
        <Button
          onClick={() => setIsSidebarOpen(true)}
          variant="outline"
          size="sm"
          className="md:hidden flex items-center gap-2"
        >
          <FiFilter className="w-4 h-4" />
          Filters
        </Button>

        <div className="flex items-center gap-2 order-last md:order-none md:ml-auto">
          <select
            value={filters.sortBy}
            onChange={e =>
              setFilters(prev => ({
                ...prev,
                sortBy: e.target.value as FilterState['sortBy']
              }))
            }
            className="px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Rating</option>
          </select>

          <div className="flex gap-1">
            <Button
              variant={filters.viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() =>
                setFilters(prev => ({ ...prev, viewMode: 'grid' }))
              }
              className="w-8 h-8"
            >
              <FiGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={filters.viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() =>
                setFilters(prev => ({ ...prev, viewMode: 'list' }))
              }
              className="w-8 h-8"
            >
              <FiList className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto order-last">
          {filters.categories.map(category => (
            <Badge
              key={category}
              variant="secondary"
              className="cursor-pointer text-xs"
              onClick={() => toggleFilter('categories', category)}
            >
              {category} ×
            </Badge>
          ))}
          {filters.brands.map(brand => (
            <Badge
              key={brand}
              variant="secondary"
              className="cursor-pointer text-xs"
              onClick={() => toggleFilter('brands', brand)}
            >
              {brand} ×
            </Badge>
          ))}
          {filters.inStock && (
            <Badge
              variant="secondary"
              className="cursor-pointer text-xs"
              onClick={() =>
                setFilters(prev => ({ ...prev, inStock: false }))
              }
            >
              In Stock ×
            </Badge>
          )}
        </div>
      </div>

      <div className="flex gap-6 relative">
        {/* Filters Sidebar */}
        <AnimatePresence>
          {(isSidebarOpen || !isMobile) && (
            <motion.aside
              initial={isMobile ? { x: -300, opacity: 0 } : false}
              animate={isMobile ? { x: 0, opacity: 1 } : {}}
              exit={isMobile ? { x: -300, opacity: 0 } : {}}
              className={`${
                isMobile
                  ? 'fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-900 shadow-xl overflow-y-auto'
                  : 'sticky top-24 w-64 h-[calc(100vh-6rem)] hidden md:block'
              }`}
            >
              <div className="p-4">
                {isMobile && (
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Filters</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <FiX className="w-5 h-5" />
                    </Button>
                  </div>
                )}

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Price Range</h3>
                  <Slider
                    defaultValue={filters.priceRange}
                    max={maxPrice}
                    step={10}
                    onValueChange={(value: [number, number]) =>
                      setFilters(prev => ({ ...prev, priceRange: value }))
                    }
                  />
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>₹{filters.priceRange[0]}</span>
                    <span>₹{filters.priceRange[1]}</span>
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Categories</h3>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <label key={category} className="flex items-center gap-2">
                        <Checkbox
                          checked={filters.categories.includes(category)}
                          onCheckedChange={(checked: boolean) =>
                            toggleFilter('categories', category)
                          }
                        />
                        <span className="text-sm">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Brands</h3>
                  <div className="space-y-2">
                    {brands.map(brand => (
                      <label key={brand} className="flex items-center gap-2">
                        <Checkbox
                          checked={filters.brands.includes(brand)}
                          onCheckedChange={(checked: boolean) =>
                            toggleFilter('brands', brand)
                          }
                        />
                        <span className="text-sm">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* In Stock */}
                <div className="mb-6">
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={filters.inStock}
                      onCheckedChange={(checked: boolean) =>
                        setFilters(prev => ({ ...prev, inStock: checked }))
                      }
                    />
                    <span className="text-sm">In Stock Only</span>
                  </label>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Overlay for mobile */}
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black z-40"
          />
        )}

        {/* Products Grid */}
        <div className="flex-1">
          <div
            className={
              filters.viewMode === 'grid'
                ? 'grid grid-cols-2 gap-3 sm:gap-6'
                : 'space-y-4'
            }
          >
            {isLoading ? (
              // Loading skeleton
              <>
                {[...Array(8)].map((_, index) => (
                  <div
                    key={index}
                    className={
                      filters.viewMode === 'grid'
                        ? 'bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden'
                        : 'flex gap-4 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden p-4'
                    }
                  >
                    <div
                      className={
                        filters.viewMode === 'grid'
                          ? 'relative pt-[100%] bg-gray-200 dark:bg-gray-700 animate-pulse'
                          : 'relative w-40 h-40 bg-gray-200 dark:bg-gray-700 animate-pulse'
                      }
                    />
                    <div className="p-4 flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2 w-3/4" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </>
            ) : filteredProducts.length === 0 ? (
              // Empty state
              <div className="col-span-2 py-12 text-center">
                <FiSliders className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      priceRange: [0, maxPrice],
                      categories: [],
                      brands: [],
                      sortBy: 'newest',
                      inStock: false,
                      viewMode: filters.viewMode
                    });
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              // Product grid/list
              filteredProducts.map(product => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={
                    filters.viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer'
                      : 'flex gap-4 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden p-4 hover:shadow-lg transition-shadow cursor-pointer'
                  }
                  onClick={() => router.push(`/pages/shop/product/${product.id}`)}
                >
                  <div
                    className={
                      filters.viewMode === 'grid'
                        ? 'relative pt-[100%]'
                        : 'relative w-24 h-24 sm:w-40 sm:h-40 flex-shrink-0'
                    }
                  >
                    <Image
                      src={product.mainImage}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3 sm:p-4 flex flex-col flex-1">
                    <h3 className="font-medium text-sm sm:text-base line-clamp-2">{product.name}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex flex-col">
                        {product.discountedPrice < product.price ? (
                          <>
                            <span className="text-base sm:text-lg font-bold text-green-500">
                              ₹{product.discountedPrice}
                            </span>
                            <span className="text-xs sm:text-sm line-through text-gray-500">
                              ₹{product.price}
                            </span>
                          </>
                        ) : (
                          <span className="text-base sm:text-lg font-bold">
                            ${product.price}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent navigation when clicking the wishlist button
                          toggleWishlist(product.id);
                        }}
                        className="w-8 h-8 sm:w-10 sm:h-10"
                      >
                        {wishlist.includes(product.id) ? (
                          <HiHeart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                        ) : (
                          <FiHeart className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
