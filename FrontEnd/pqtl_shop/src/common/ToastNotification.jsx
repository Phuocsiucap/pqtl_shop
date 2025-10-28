import { motion, AnimatePresence } from 'framer-motion';
import {Check, X } from 'lucide-react';

export default function Toast({ message, type = 'success', isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 ${
            type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {type === 'success' ? <Check size={20} /> : <X size={20} />}
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}