import { motion, AnimatePresence } from 'framer-motion';
export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-lg p-6 max-w-sm shadow-xl"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Hủy
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Xóa
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}