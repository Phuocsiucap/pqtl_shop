class MessageHandler {
    constructor(connection) {
        this.connection = connection;
    }

    // Gửi tin nhắn với type và data - FIXED VERSION
    send(messageType, data = {}) {
        const message = {
            messageType: messageType,  // Backend đọc field này
            data: data  // Spread data ra ngoài thay vì nest
        };
        return this.connection.send(message);
    }

    // Gửi tin nhắn chat
    sendMessage(conversationId, data) {
        return this.send('CHAT', {  // Dùng 'CHAT' để match với ChatMessageHandler
            chatId: conversationId,  // Backend expect 'chatId'
            ...data
            // content: content,
            // message_Type: message_Type  // Này là loại message (text/image/file)
        });
    }

    // Gửi media message
    sendMediaMessage(conversationId, fileUrl, messageType = 'image') {
        return this.send('CHAT', {  // Match với ChatMessageHandler
            chatId: conversationId,
            fileUrl: fileUrl,
            messageType: messageType
        });
    }

    // Join conversation room
    joinConversation(conversationId) {
        return this.send('CHAT_JOIN', {  // Thêm prefix để phân biệt
            chatId: conversationId
        });
    }

    // Leave conversation room  
    leaveConversation(conversationId) {
        return this.send('CHAT_LEAVE', {
            chatId: conversationId
        });
    }

    // Đánh dấu tin nhắn đã đọc
    markAsRead(conversationId, messageId) {  // Fixed typo: mardAsRead -> markAsRead
        return this.send('CHAT_READ', {
            chatId: conversationId,
            messageId: messageId
        });
    }

    // Typing indicator
    sendTyping(conversationId, isTyping = true) {
        return this.send('CHAT_TYPING', {
            chatId: conversationId,
            isTyping: isTyping
        });
    }


    // Friend requests
    sendFriendRequest(targetUserId) {
        return this.send('FRIEND_REQUEST', {
            targetId: targetUserId
        });
    }

    acceptFriendRequest(targetUserId) {
        return this.send('FRIEND_ACCEPT', {
            targetId: targetUserId
        });
    }

    rejectFriendRequest(targetUserId) {
        return this.send('FRIEND_REJECT', {
            targetId: targetUserId
        });
    }
    cancelFriendRequest(targetUserId) {
        return this.send('FRIEND_CANCEL', {
            targetId: targetUserId
        });
    }
}

// Usage example:
// const messageHandler = new MessageHandler(websocketConnection);
// messageHandler.sendMessage('chat123', 'Hello world!');
// messageHandler.joinConversation('chat123');
// messageHandler.likePost('post456');

export default MessageHandler;