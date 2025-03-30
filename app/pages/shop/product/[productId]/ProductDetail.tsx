'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { doc, getDoc, collection, query, where, getDocs, limit, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
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
import { FiShoppingBag } from 'react-icons/fi';
import ReviewSection from '@/app/components/shop/ReviewSection';

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
  const [isInCart, setIsInCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    const isProductInCart = cartItems.some(item => item.id === productId);
    setIsInCart(isProductInCart);
  }, [cartItems, productId]);

  useEffect(() => {
    if (user && product) {
      checkWishlistStatus();
    }
  }, [user, product]);

  const checkWishlistStatus = async () => {
    if (!user || !product) return;
    try {
      const wishlistRef = doc(db, 'users', user.uid, 'wishlist', product.id);
      const wishlistDoc = await getDoc(wishlistRef);
      setIsInWishlist(wishlistDoc.exists());
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleWishlistClick = async () => {
    if (!user) {
      toast.error('Please sign in to add to wishlist');
      return;
    }

    if (!product) {
      toast.error('Product not found');
      return;
    }

    try {
      const wishlistRef = doc(db, 'users', user.uid, 'wishlist', product.id);
      
      if (isInWishlist) {
        await deleteDoc(wishlistRef);
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await setDoc(wishlistRef, {
          productId: product.id,
          name: product.name,
          mainImage: product.mainImage,
          price: product.price,
          discountedPrice: product.discountedPrice,
          addedAt: serverTimestamp()
        });
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

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

  const handleCartIconClick = () => {
    if (!user) {
      toast.error('Please sign in to add to cart');
      return;
    }

    if (!product) {
      toast.error('Product not found');
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

  const handleBuyNow = async () => {
    if (!user) {
      toast.error('Please sign in to purchase');
      return;
    }

    if (!product) {
      toast.error('Product not available');
      return;
    }

    try {
      const cartItem: CartItem = {
        id: product.id,
        name: product.name,
        mainImage: product.mainImage,
        price: product.price,
        discountedPrice: product.discountedPrice || product.price, // Use price if no discount
        quantity: 1
      };

      await cartService.addToCart(user.uid, cartItem);

      window.location.href = '/pages/shop/checkout';
      
    } catch (error) {
      console.error('Error in buy now:', error);
      toast.error('Failed to process. Please try again.');
    }
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
                className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {product.mainImage ? (
                  <>
                    <Image
                      src={product.mainImage}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                    />
                    {/* Discount Badge */}
                    {product.price > product.discountedPrice && (
                      <div className="absolute top-4 left-4 px-2 py-1 bg-green-500 text-white text-sm font-medium rounded-lg shadow-lg">
                        {Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% OFF
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FiShoppingBag className="w-16 h-16 text-gray-400" />
                  </div>
                )}
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
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-2xl font-bold text-green-600 dark:text-green-500">
                      ₹{product.discountedPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(avgRating)
                            ? 'text-yellow-400'
                            : i < avgRating
                            ? 'text-yellow-300' // For partial stars
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      {avgRating.toFixed(1)} ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                </div>
               
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

          {/* Reviews Section */}
          {product && (
            <ReviewSection 
              productId={product.id} 
              onRatingUpdate={(rating, reviews) => {
                setAvgRating(rating);
                setTotalReviews(reviews);
              }}
            />
          )}
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
        className="fixed bottom-16 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] z-40"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <motion.button
            onClick={handleCartIconClick}
            whileTap={{ scale: 0.95 }}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 ${
              isInCart 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
            } font-medium rounded-xl transition-colors duration-200`}
          >
            {isInCart ? (
              <>
                <HiCheck className="w-5 h-5" />
                <span className="hidden sm:inline">Added to Cart</span>
                <span className="sm:hidden">Added</span>
              </>
            ) : (
              <>
                <HiOutlineShoppingCart className="w-5 h-5" />
                <span className="hidden sm:inline">Add to Cart</span>
                <span className="sm:hidden">Cart</span>
              </>
            )}
          </motion.button>

          <motion.button
            onClick={handleBuyNow}
            whileTap={{ scale: 0.95 }}
            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors duration-200"
          >
            <span className="hidden sm:inline">Buy Now</span>
            <span className="sm:hidden">Buy</span>
          </motion.button>

          <motion.button
            onClick={handleWishlistClick}
            whileTap={{ scale: 0.95 }}
            className={`w-12 h-12 flex items-center justify-center ${
              isInWishlist
                ? 'text-red-500 dark:text-red-400'
                : 'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400'
            } bg-gray-100 dark:bg-gray-800 rounded-xl transition-colors duration-200`}
          >
            <svg 
              className="w-6 h-6" 
              fill={isInWishlist ? "currentColor" : "none"} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
          </motion.button>
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
