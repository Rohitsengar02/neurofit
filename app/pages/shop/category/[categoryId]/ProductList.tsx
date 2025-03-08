'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FiFilter, FiStar, FiDollarSign, FiTag, FiTruck, FiGrid, FiList, FiChevronDown } from 'react-icons/fi';

interface Product {
  id: string;
  name: string;
  mainImage: string;
  discountedPrice: number;
  category: string;
  rating?: number;
  brand?: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
}

interface FilterState {
  priceRange: [number, number];
  rating: number;
  brand: string[];
  sortBy: string;
  availability: string[];
}

interface ProductListProps {
  categoryId: string;
}

const filterOptions = {
  sortBy: ['Price: Low to High', 'Price: High to Low', 'Rating', 'Newest First'],
  availability: ['In Stock', 'Fast Delivery', 'Express Shipping'],
  brands: ['Brand A', 'Brand B', 'Brand C', 'Brand D'],
};

const ProductList = ({ categoryId }: ProductListProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 10000],
    rating: 0,
    brand: [],
    sortBy: '',
    availability: [],
  });
  const router = useRouter();

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        const categoryDoc = await getDocs(collection(db, 'productCategories'));
        const categoryData = categoryDoc.docs.find(doc => doc.id === categoryId);

        if (categoryData) {
          setCategory({
            id: categoryData.id,
            name: categoryData.data().name,
            description: categoryData.data().description || '',
            imageUrl: categoryData.data().imageUrl || '',
          });

          const productsQuery = query(
            collection(db, 'products'),
            where('category', '==', categoryData.data().name)
          );
          
          const querySnapshot = await getDocs(productsQuery);
          const productsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Product[];
          
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [categoryId]);

  const handleProductClick = (productId: string) => {
    router.push(`/pages/shop/product/${productId}`);
  };

  const openFilter = (filter: string) => {
    setSelectedFilter(filter);
    setIsFilterOpen(true);
  };

  const closeFilter = () => {
    setIsFilterOpen(false);
    setSelectedFilter(null);
  };

  const applyFilters = () => {
    // Apply filters logic here
    closeFilter();
  };

  const renderFilterContent = () => {
    switch (selectedFilter) {
      case 'Price':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>₹{filters.priceRange[0]}</span>
              <span>₹{filters.priceRange[1]}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              className="w-full"
              value={filters.priceRange[1]}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                priceRange: [prev.priceRange[0], parseInt(e.target.value)]
              }))}
            />
          </div>
        );
      case 'Rating':
        return (
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                className={`flex items-center space-x-2 w-full p-2 rounded ${
                  filters.rating === rating ? 'bg-blue-100' : 'hover:bg-gray-100'
                }`}
                onClick={() => setFilters(prev => ({ ...prev, rating }))}
              >
                <div className="flex text-yellow-400">
                  {Array.from({ length: rating }).map((_, i) => (
                    <FiStar key={i} className="fill-current" />
                  ))}
                </div>
                <span>& Up</span>
              </button>
            ))}
          </div>
        );
      case 'Brand':
        return (
          <div className="space-y-2">
            {filterOptions.brands.map((brand) => (
              <label key={brand} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.brand.includes(brand)}
                  onChange={(e) => {
                    setFilters(prev => ({
                      ...prev,
                      brand: e.target.checked
                        ? [...prev.brand, brand]
                        : prev.brand.filter(b => b !== brand)
                    }));
                  }}
                  className="rounded text-blue-600"
                />
                <span>{brand}</span>
              </label>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mb-8"></div>
        <div className="flex space-x-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg overflow-hidden">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Category Banner */}
      {category && (
        <motion.div 
          className="relative h-64 mb-8 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Background Image with Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${category.imageUrl || '/default-category-bg.jpg'})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-purple-600/80 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full container mx-auto px-4 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                {category.name}
              </h1>
              <p className="text-xl text-white/90 max-w-2xl">
                {category.description}
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}

      <div className="container mx-auto px-4">
        {/* Filter Options */}
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide py-4 mb-6">
          {[
            { name: 'Sort By', icon: <FiGrid /> },
            { name: 'Price', icon: <FiDollarSign /> },
            { name: 'Rating', icon: <FiStar /> },
            { name: 'Brand', icon: <FiTag /> },
            { name: 'Shipping', icon: <FiTruck /> },
          ].map(({ name, icon }) => (
            <motion.button
              key={name}
              onClick={() => openFilter(name)}
              className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {icon}
              <span>{name}</span>
              <FiChevronDown className="ml-1" />
            </motion.button>
          ))}
        </div>

        {/* Filter Popup */}
        <Transition appear show={isFilterOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={closeFilter}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center space-x-2"
                    >
                      <FiFilter className="w-5 h-5" />
                      <span>Apply {selectedFilter} Filter</span>
                    </Dialog.Title>

                    <div className="mt-4">
                      {renderFilterContent()}
                    </div>

                    <div className="mt-6 flex space-x-3">
                      <button
                        type="button"
                        className="flex-1 justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={applyFilters}
                      >
                        Apply
                      </button>
                      <button
                        type="button"
                        className="flex-1 justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        onClick={closeFilter}
                      >
                        Cancel
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Product Grid */}
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg cursor-pointer transform transition-all duration-300"
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleProductClick(product.id)}
            >
              <div className="relative aspect-square">
                <Image
                  src={product.mainImage}
                  alt={product.name}
                  fill
                  className="object-cover transform transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-1 line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-brown-600 dark:text-brown-400 font-medium">
                    ₹{product.discountedPrice.toLocaleString()}
                  </p>
                  {product.rating && (
                    <div className="flex items-center text-yellow-400">
                      <FiStar className="fill-current w-4 h-4" />
                      <span className="ml-1 text-sm">{product.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {products.length === 0 && !loading && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No products found in this category.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
