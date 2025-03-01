'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaBoxOpen, FaShoppingCart, FaClipboardList } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';

const BottomNavigation = () => {
  const pathname = usePathname();

  const navItems = [
    { path: '/', icon: MdDashboard, label: 'Dashboard' },
    { path: '#', icon: FaBoxOpen, label: 'Products' },
    { path: '#', icon: FaClipboardList, label: 'Orders' },
    { path: '#', icon: FaShoppingCart, label: 'Cart' },
  ];

  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4"
    >
      {/* Glass Background with Gradient Border */}
      <div className="relative mx-auto max-w-lg">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-brown-500/20 p-[1px] backdrop-blur-xl">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-brown-500/10 blur-xl" />
        </div>
        
        {/* Navigation Content */}
        <div className="relative flex items-center justify-around rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-2 shadow-lg">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link key={item.path} href={item.path}>
                <motion.div
                  className="relative px-4 py-2"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-brown-500/20"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  
                  <div className="relative flex flex-col items-center">
                    <motion.div
                      animate={{
                        scale: isActive ? 1.2 : 1,
                        color: isActive ? '#8B5CF6' : '#6B7280'
                      }}
                      className="relative"
                    >
                      <Icon className={`text-xl ${isActive ? 'text-purple-500' : 'text-gray-500 dark:text-gray-400'}`} />
                      
                      {/* Glow Effect */}
                      {isActive && (
                        <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-md" />
                      )}
                    </motion.div>
                    
                    <motion.span
                      animate={{
                        scale: isActive ? 1 : 0.9,
                        color: isActive ? '#8B5CF6' : '#6B7280'
                      }}
                      className="mt-1 text-xs font-medium"
                    >
                      {item.label}
                    </motion.span>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
};

export default BottomNavigation;
