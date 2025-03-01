'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import Image from 'next/image';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  mainImage: string;
}

interface ShopSection {
  id: string;
  title: string;
  description: string;
  order: number;
  displayType: 'scroll' | 'grid';
  products: Product[];
}

const FeaturedProducts = () => {
  const [sections, setSections] = useState<ShopSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const sectionsQuery = query(collection(db, 'shopSections'), orderBy('order'));
        const sectionsSnapshot = await getDocs(sectionsQuery);
        
        const sectionsPromises = sectionsSnapshot.docs.map(async (sectionDoc) => {
          const sectionData = sectionDoc.data();
          const productIds = sectionData.productIds || [];
          
          const productsPromises = productIds.map(async (productId: string) => {
            const productDoc = await getDoc(doc(db, 'products', productId));
            if (productDoc.exists()) {
              const data = productDoc.data();
              return {
                id: productDoc.id,
                name: data.name,
                price: data.price,
                mainImage: data.mainImage
              } as Product;
            }
            return null;
          });
          
          const products = (await Promise.all(productsPromises)).filter((p): p is Product => p !== null);
          
          return {
            id: sectionDoc.id,
            title: sectionData.title,
            description: sectionData.description,
            order: sectionData.order,
            displayType: sectionData.displayType,
            products
          } as ShopSection;
        });
        
        const loadedSections = await Promise.all(sectionsPromises);
        setSections(loadedSections);
        setLoading(false);
      } catch (err) {
        setError('Failed to load products');
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  const ProductCard = ({ product }: { product: Product }) => (
    <Link href={`/pages/shop/product/${product.id}`}>
      <motion.div
        className="group cursor-pointer"
        whileHover={{ y: -5 }}
      >
        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
          {product.mainImage && (
            <Image
              src={product.mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              priority
            />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>
        <div className="mt-3 space-y-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            ₹{product.price}
          </p>
        </div>
      </motion.div>
    </Link>
  );

  const ScrollableSection = ({ section }: { section: ShopSection }) => (
    <div className="relative group">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex space-x-4 p-4">
          {section.products.map((product) => (
            <div key={product.id} className="flex-none w-[240px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
      
      <button 
        className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
        onClick={(e) => {
          const container = e.currentTarget.parentElement?.querySelector('.overflow-x-auto');
          if (container) container.scrollLeft -= 300;
        }}
      >
        <FaArrowLeft className="text-gray-800 dark:text-white" />
      </button>
      <button 
        className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
        onClick={(e) => {
          const container = e.currentTarget.parentElement?.querySelector('.overflow-x-auto');
          if (container) container.scrollLeft += 300;
        }}
      >
        <FaArrowRight className="text-gray-800 dark:text-white" />
      </button>
    </div>
  );

  const GridSection = ({ section }: { section: ShopSection }) => {
    const isExpanded = expandedSections.has(section.id);
    const displayProducts = isExpanded ? section.products : section.products.slice(0, 4);
    const hasMoreProducts = section.products.length > 4;

    return (
      <div className="space-y-4 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-100 via-teal-100 to-violet-100 dark:from-rose-950/20 dark:via-teal-950/20 dark:to-violet-950/20 rounded-3xl py-8 px-2">
        <div className="grid grid-cols-2 gap-4 p-4 backdrop-blur-sm">
          {displayProducts.map((product) => (
            <div key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        
        {hasMoreProducts && (
          <div className="flex justify-center px-4">
            <button
              onClick={() => {
                setExpandedSections(prev => {
                  const newSet = new Set(prev);
                  if (isExpanded) {
                    newSet.delete(section.id);
                  } else {
                    newSet.add(section.id);
                  }
                  return newSet;
                });
              }}
              className="w-full sm:w-auto px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-medium 
                hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors duration-300"
            >
              {isExpanded ? 'Show Less' : 'View More'}
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600 dark:text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      {sections.map((section) => (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="px-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{section.title}</h2>
            {section.description && (
              <p className="mt-1 text-gray-600 dark:text-gray-300">{section.description}</p>
            )}
          </div>
          
          {section.displayType === 'scroll' ? (
            <ScrollableSection section={section} />
          ) : (
            <GridSection section={section} />
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default FeaturedProducts;
