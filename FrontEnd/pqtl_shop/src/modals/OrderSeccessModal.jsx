import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

export default function SuccessModal({ isOpen, orderId, onClose }) {
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
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-lg p-8 max-w-md shadow-xl text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Check className="text-green-600" size={32} />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h3>
            <p className="text-gray-600 mb-4">Mã đơn hàng của bạn:</p>
            <p className="text-2xl font-mono font-bold text-green-600 mb-6">{orderId}</p>
            <p className="text-sm text-gray-500 mb-6">Chúng tôi sẽ gửi chi tiết đơn hàng đến email của bạn trong giây lát.</p>
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Tiếp tục mua sắm
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
