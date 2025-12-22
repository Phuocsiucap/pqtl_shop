import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaShoppingBasket, FaUtensils, FaPlus, FaMinus } from 'react-icons/fa';
import { request1, getFullImageUrl } from '../../utils/request'; // Import request1 để gọi API chatbot
import { useDispatch } from 'react-redux';
import { AddProduct } from '../../redux/Actions';
import { PricetoString } from '../Translate_Price';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            sender: 'bot',
            type: 'text',
            content: 'Chào bạn! Mình là Bếp Phó Tận Tâm 👨‍🍳. Hôm nay bạn muốn ăn món gì? (VD: Nấu nhanh, món chay, món canh...)'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const dispatch = useDispatch();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: 'user', type: 'text', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Gọi API Chatbot
            const response = await request1.post('v1/chatbot/chat', {
                message: userMessage.content
            });

            const data = response.data;

            // Add Bot Message (Text)
            if (data.botMessage) {
                setMessages(prev => [...prev, { sender: 'bot', type: 'text', content: data.botMessage }]);
            }

            // Add Suggestions (Recipe Cards)
            if (data.suggestions && data.suggestions.length > 0) {
                setMessages(prev => [...prev, { sender: 'bot', type: 'suggestions', content: data.suggestions }]);
            }

        } catch (error) {
            console.error("Chatbot Error:", error);
            setMessages(prev => [...prev, { sender: 'bot', type: 'text', content: 'Xin lỗi, mình đang gặp chút trục trặc. Bạn thử lại sau nhé!' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    const handleAddToCart = async (ingredient) => {
        // Gọi Redux Action AddProduct
        // Lưu ý: AddProduct trong Redux là async action nhưng trả về plain object,
        // Logic gọi API cart/add nằm bên trong action creator đó.
        if (ingredient.productId) {
            await AddProduct({ id: ingredient.productId, number: ingredient.quantityToBuy || 1 });
            // Có thể thêm toast thông báo ở đây nếu cần (Action đã có alert)
        }
    };

    const handleAddAllToCart = async (ingredients) => {
        if (!ingredients || ingredients.length === 0) return;

        let count = 0;
        for (const item of ingredients) {
            if (item.productId) {
                await AddProduct({ id: item.productId, number: item.quantityToBuy || 1 });
                count++;
            }
        }
        if (count > 0) {
            // Thông báo tổng (Action AddProduct đã alert từng cái, hơi spam, nên tối ưu Action sau)
            // Tạm thời để vậy
        }
    };

    // --- Sub-components Render ---

    const renderText = (msg, idx) => (
        <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none'
            }`}>
                {msg.content}
            </div>
        </div>
    );

    const renderSuggestions = (msg, idx) => (
        <div key={idx} className="mb-4 pl-2">
            <div className="flex gap-3 overflow-x-auto pb-4 snap-x custom-scrollbar">
                {msg.content.map((suggestion, sIdx) => (
                    <div key={sIdx} className="snap-center min-w-[280px] w-[280px] bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden flex-shrink-0">
                        {/* Header Món Ăn */}
                        <div className="bg-green-50 p-3 border-b border-green-100">
                            <h4 className="font-bold text-green-800 flex items-center gap-2">
                                <FaUtensils className="text-sm" />
                                {suggestion.recipeName}
                            </h4>
                            <div className="flex justify-between text-xs text-green-600 mt-1">
                                <span>⏱ {suggestion.cookingTime}</span>
                                <span>💰 ~{PricetoString(suggestion.totalEstimatePrice)}đ</span>
                            </div>
                        </div>

                        {/* List Nguyên liệu */}
                        <div className="p-3 max-h-[200px] overflow-y-auto">
                            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Nguyên liệu cần mua:</p>
                            <ul className="space-y-2">
                                {suggestion.ingredients.map((ing, iIdx) => (
                                    <li key={iIdx} className="flex items-center justify-between text-sm group">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className="w-8 h-8 rounded bg-gray-100 flex-shrink-0">
                                                <img
                                                    src={getFullImageUrl(ing.imageUrl)}
                                                    alt=""
                                                    className="w-full h-full object-cover rounded"
                                                    onError={(e) => e.target.src = 'https://via.placeholder.com/30'}
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate font-medium text-gray-700" title={ing.productName}>{ing.productName}</p>
                                                <p className="text-xs text-gray-400">x{ing.quantityToBuy} • {PricetoString(ing.unitPrice)}đ</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAddToCart(ing)}
                                            className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-full transition-colors"
                                            title="Thêm vào giỏ"
                                        >
                                            <FaPlus size={10} />
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            {/* Missing Ingredients */}
                            {suggestion.missingIngredients && suggestion.missingIngredients.length > 0 && (
                                <div className="mt-3 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                                    <span className="font-bold">Thiếu:</span> {suggestion.missingIngredients.join(', ')}
                                </div>
                            )}
                        </div>

                        {/* Action Footer */}
                        <div className="p-3 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={() => handleAddAllToCart(suggestion.ingredients)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                            >
                                <FaShoppingBasket />
                                Mua trọn bộ ({PricetoString(suggestion.totalEstimatePrice)}đ)
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-Montserrat">
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 animate-bounce-slow"
                >
                    <FaRobot size={32} />
                    {/* Badge notification if needed */}
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="w-[380px] h-[600px] bg-gray-50 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-slide-up">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 flex justify-between items-center text-white shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <FaRobot size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-tight">Bếp Phó</h3>
                                <p className="text-xs text-blue-100 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    Sẵn sàng hỗ trợ
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#F0F2F5]">
                        {messages.map((msg, idx) =>
                            msg.type === 'text' ? renderText(msg, idx) : renderSuggestions(msg, idx)
                        )}

                        {isLoading && (
                            <div className="flex justify-start mb-4">
                                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <div className="flex gap-2 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Hôm nay ăn gì?..."
                                className="w-full pl-4 pr-12 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                            >
                                <FaPaperPlane size={14} />
                            </button>
                        </div>
                        <div className="text-center mt-2">
                            <p className="text-[10px] text-gray-400">Powered by Gemini AI • Gợi ý từ thực phẩm sạch</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
