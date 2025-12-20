import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes, FaExclamationTriangle } from "react-icons/fa";

const Toast = ({ message, type = "info", onClose, duration = 4000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose && onClose();
    }, 300);
  };

  if (!isVisible) return null;

  const typeStyles = {
    success: {
      bg: "bg-green-50 border-green-500",
      icon: <FaCheckCircle className="text-green-500 text-xl" />,
      title: "Thành công",
      titleColor: "text-green-800",
    },
    error: {
      bg: "bg-red-50 border-red-500",
      icon: <FaExclamationCircle className="text-red-500 text-xl" />,
      title: "Lỗi",
      titleColor: "text-red-800",
    },
    warning: {
      bg: "bg-yellow-50 border-yellow-500",
      icon: <FaExclamationTriangle className="text-yellow-500 text-xl" />,
      title: "Cảnh báo",
      titleColor: "text-yellow-800",
    },
    info: {
      bg: "bg-blue-50 border-blue-500",
      icon: <FaInfoCircle className="text-blue-500 text-xl" />,
      title: "Thông báo",
      titleColor: "text-blue-800",
    },
  };

  const style = typeStyles[type] || typeStyles.info;

  // Xử lý message có thể là string hoặc array
  const messages = Array.isArray(message) ? message : [message];

  return (
    <div
      className={`fixed top-5 right-5 z-[9999] max-w-md w-full transform transition-all duration-300 ease-in-out ${
        isLeaving ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
      }`}
    >
      <div
        className={`${style.bg} border-l-4 rounded-lg shadow-lg p-4 flex items-start gap-3`}
      >
        <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
        <div className="flex-1">
          <h4 className={`font-semibold ${style.titleColor}`}>{style.title}</h4>
          <div className="mt-1 text-sm text-gray-700">
            {messages.length === 1 ? (
              <p>{messages[0]}</p>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {messages.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

// Toast Container để quản lý nhiều toast
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-md w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`transform transition-all duration-300 ease-in-out ${
            toast.isLeaving ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
          }`}
        >
          <ToastItem toast={toast} onClose={() => removeToast(toast.id)} />
        </div>
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const typeStyles = {
    success: {
      bg: "bg-green-50 border-green-500",
      icon: <FaCheckCircle className="text-green-500 text-xl" />,
      title: "Thành công",
      titleColor: "text-green-800",
    },
    error: {
      bg: "bg-red-50 border-red-500",
      icon: <FaExclamationCircle className="text-red-500 text-xl" />,
      title: "Lỗi",
      titleColor: "text-red-800",
    },
    warning: {
      bg: "bg-yellow-50 border-yellow-500",
      icon: <FaExclamationTriangle className="text-yellow-500 text-xl" />,
      title: "Cảnh báo",
      titleColor: "text-yellow-800",
    },
    info: {
      bg: "bg-blue-50 border-blue-500",
      icon: <FaInfoCircle className="text-blue-500 text-xl" />,
      title: "Thông báo",
      titleColor: "text-blue-800",
    },
  };

  const style = typeStyles[toast.type] || typeStyles.info;
  const messages = Array.isArray(toast.message) ? toast.message : [toast.message];

  return (
    <div
      className={`${style.bg} border-l-4 rounded-lg shadow-lg p-4 flex items-start gap-3`}
    >
      <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
      <div className="flex-1">
        <h4 className={`font-semibold ${style.titleColor}`}>{style.title}</h4>
        <div className="mt-1 text-sm text-gray-700">
          {messages.length === 1 ? (
            <p>{messages[0]}</p>
          ) : (
            <ul className="list-disc list-inside space-y-1">
              {messages.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <FaTimes />
      </button>
    </div>
  );
};

// Custom hook để sử dụng toast
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info", duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    // Tự động xóa sau duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isLeaving: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  };

  const showSuccess = (message) => addToast(message, "success");
  const showError = (message) => addToast(message, "error", 5000);
  const showWarning = (message) => addToast(message, "warning");
  const showInfo = (message) => addToast(message, "info");

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    ToastContainer: () => <ToastContainer toasts={toasts} removeToast={removeToast} />,
  };
};

export default Toast;
