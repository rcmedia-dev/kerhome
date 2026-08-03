'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-white"
        >
          <div className="flex flex-col items-center gap-6 w-72">
            <Image
              src="/kercasa_logo.png"
              alt="Kercasa Logo"
              width={300}
              height={84}
              className="object-contain w-auto max-w-[300px]"
              priority
            />

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-gray-100/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-orange-500 to-purple-600 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
