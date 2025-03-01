'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { IoStar, IoStarHalf } from 'react-icons/io5';
import { HiOutlineShoppingCart, HiCheck } from 'react-icons/hi';
import { MdFavoriteBorder } from 'react-icons/md';
import { FaStar } from 'react-icons/fa';
import Link from 'next/link';
import CartSidebar, { CartItem } from '@/app/components/shop/CartSidebar';
import { cartService } from '@/app/services/cartService';
import { auth } from '@/app/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  mainImage: string;
  imageGallery: string[];
  description: string;
  longDescription: string;
  features: string[];
  price: number;
  discountedPrice: number;
  rating: number;
  category: string;
}

interface ProductDetailProps {
  productId: string;
}

export default function ProductDetail({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user] = useAuthState(auth);

  // Check if product is in cart
  const isInCart = useMemo(() => {
    return cartItems.some(item => item.id === productId);
  }, [cartItems, productId]);

  useEffect(() => {
    const fetchProduct = () => {
      if (!productId) {
        console.error('No productId provided');
        return;
      }

      setLoading(true);
      getDoc(doc(db, 'products', productId))
        .then((productDoc) => {
          if (productDoc.exists()) {
            const productData = {
              id: productId,
              ...productDoc.data()
            } as Product;
            setProduct(productData);
          } else {
            toast.error('Product not found');
          }
        })
        .catch((error) => {
          console.error('Error fetching product:', error);
          toast.error('Error loading product');
        })
        .finally(() => {
          setLoading(false);
        });
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = cartService.subscribeToCart(user.uid, (items) => {
      setCartItems(items);
    });

    return () => unsubscribe();
  }, [user]);

  // Add to cart function
  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    if (!product) {
      toast.error('Product not available');
      return;
    }

    try {
      const cartItem = {
        id: product.id,
        name: product.name,
        mainImage: product.mainImage,
        price: product.price,
        discountedPrice: product.discountedPrice,
        quantity: 1
      };

      cartService.addToCart(user.uid, cartItem)
        .then(() => {
          setIsCartOpen(true);
          toast.success('Added to cart');
        })
        .catch((error) => {
          console.error('Error adding to cart:', error);
          toast.error('Failed to add to cart');
        });
    } catch (error) {
      console.error('Error preparing cart item:', error);
      toast.error('Failed to add to cart');
    }
  };

  // Handle cart icon click
  const handleCartIconClick = () => {
    if (!product) {
      toast.error('Please wait for product to load');
      return;
    }

    if (isInCart) {
      setIsCartOpen(true);
    } else {
      handleAddToCart();
    }
  };

  useEffect(() => {
    const fetchRelatedProducts = () => {
      if (!product?.category) return;
      
      getDocs(query(
        collection(db, 'products'),
        where('category', '==', product.category),
        limit(8)
      ))
        .then((querySnapshot) => {
          const products = querySnapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            .filter(p => p.id !== product.id) // Filter out current product after fetching
            .slice(0, 7) as Product[]; // Limit to 7 products after filtering
          setRelatedProducts(products);
        })
        .catch((error) => {
          console.error('Error fetching related products:', error);
        });
    };

    if (product) {
      fetchRelatedProducts();
    }
  }, [product?.category, product?.id]);

  useEffect(() => {
    if (!user) return;

    cartService.getCartItems(user.uid)
      .then((items) => {
        setCartItems(items);
      })
      .catch((error) => {
        console.error('Error loading cart items:', error);
      });
  }, [user]);

  // Remove from cart function
  const removeFromCart = (productId: string) => {
    if (!user) return;

    cartService.removeFromCart(user.uid, productId)
      .then(() => {
        toast.success('Removed from cart');
      })
      .catch((error) => {
        console.error('Error removing from cart:', error);
        toast.error('Failed to remove from cart');
      });
  };

  // Toggle cart item
  const toggleCartItem = (product: Product) => {
    if (isInCart) {
      removeFromCart(product.id);
    } else {
      handleAddToCart();
    }
  };

  const updateCartItemQuantity = (id: string, newQuantity: number) => {
    if (!user) return;

    cartService.updateQuantity(user.uid, id, newQuantity)
      .then(() => {
        if (newQuantity === 0) {
          toast.success('Item removed from cart');
        }
      })
      .catch((error) => {
        console.error('Error updating quantity:', error);
        toast.error('Failed to update quantity');
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  const discount = Math.round(((product.price - product.discountedPrice) / product.price) * 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
      <div className="max-w-6xl mx-auto p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="grid md:grid-cols-2 gap-8 p-6">
            {/* Image Gallery Section */}
            <div className="space-y-4">
              <motion.div 
                className="relative aspect-square rounded-xl overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src={selectedImage === 0 ? product.mainImage : product.imageGallery[selectedImage - 1]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </motion.div>
              
              {/* Thumbnail Gallery */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <motion.button
                  onClick={() => setSelectedImage(0)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 ${
                    selectedImage === 0 ? 'ring-2 ring-brown-500' : ''
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image
                    src={product.mainImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </motion.button>
                {product.imageGallery.map((image, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedImage(index + 1)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 ${
                      selectedImage === index + 1 ? 'ring-2 ring-brown-500' : ''
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Product Info Section */}
            <div className="space-y-6">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < (product.rating || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                      ({product.rating || 0})
                    </span>
                  </div>
                </div>
                <motion.button
                  className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MdFavoriteBorder className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  {product.description.slice(0, 1000)}
                </p>

                {/* Product Images */}
                <div className="grid grid-cols-2 gap-4 my-6">
                  {product.imageGallery?.slice(0, 4).map((image, index) => (
                    <motion.div
                      key={index}
                      className="relative aspect-square rounded-xl overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} - Image ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Long Description */}
                
              </div>
             
            </div>
          </div>

          {/* Long Description */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Product Description
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              {product.longDescription.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-600 dark:text-gray-300">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Related Products Section */}
      <div className="mt-12 mb-24">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 px-4">
          Related Products
        </h2>
        <div className="relative">
          <div className="flex overflow-x-auto gap-4 px-4 pb-4 snap-x snap-mandatory scrollbar-hide">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                href={`/pages/shop/product/${relatedProduct.id}`}
                className="flex-none w-[160px] snap-start cursor-pointer"
                prefetch={false}
              >
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={relatedProduct.mainImage}
                    alt={relatedProduct.name}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                </div>
                <div className="mt-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {relatedProduct.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      ₹{relatedProduct.discountedPrice.toLocaleString()}
                    </span>
                    {relatedProduct.price > relatedProduct.discountedPrice && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
                        ₹{relatedProduct.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-20 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 px-4 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] z-40"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ₹{product.discountedPrice.toLocaleString()}
            </span>
            {product.price > product.discountedPrice && (
              <>
                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  ₹{product.price.toLocaleString()}
                </span>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <motion.button
              className={`relative ${
                isInCart 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              } h-10 w-10 rounded-full flex items-center justify-center overflow-hidden group`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCartIconClick}
              disabled={!product || loading}
            >
              <motion.div
                className={`absolute inset-0 ${
                  isInCart
                    ? 'bg-gradient-to-tr from-green-600/50 to-transparent'
                    : 'bg-gradient-to-tr from-gray-200/50 to-transparent dark:from-gray-700/50 dark:to-transparent'
                }`}
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <motion.div
                initial={false}
                animate={{ scale: isInCart ? 1 : 0, opacity: isInCart ? 1 : 0 }}
                className="absolute"
              >
                <HiCheck className="w-5 h-5 relative z-10" />
              </motion.div>
              <motion.div
                initial={false}
                animate={{ scale: isInCart ? 0 : 1, opacity: isInCart ? 0 : 1 }}
                className="absolute"
              >
                <HiOutlineShoppingCart className="w-5 h-5 relative z-10" />
              </motion.div>
            </motion.button>

            <motion.button
              className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-brown-800 dark:via-brown-700 dark:to-brown-900 text-white h-10 px-4 rounded-full font-medium flex items-center justify-center gap-2 overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-4 h-4 relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12L13 12M21 12L18 15M21 12L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 8V16C3 18.2091 4.79086 20 7 20H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M7 4H13C15.2091 4 17 5.79086 17 8V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="relative z-10 text-sm font-medium">Buy Now</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateCartItemQuantity}
        onRemoveItem={removeFromCart}
      />
    </div>
  );
};
