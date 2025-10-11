import WebSocketConnection from './WebSocketConnection.js';
import ReconnectManager from './ReconnectManager.js';
import MessageHandler from './MessageHandler.js';

class WebSocketService {
    constructor() {
        this.connection = new WebSocketConnection();
        this.reconnectManager = new ReconnectManager(this.connection);
        this.messageHandler = new MessageHandler(this.connection);
    }

    // Connect to WebSocket server with token
    connect(token,tabId) {
        this.reconnectManager.setToken(token);
        this.reconnectManager.setTabId(tabId);
        return this.connection.connect(token, tabId);
    }

    // event listners
    on(event, callback) {
        this.connection.on(event, callback);
    }
    off(event, callback) {
        return this.connection.off(event, callback);
    }

    //Message methods
    sendMessage(conversationId, content, messageType = 'text') {
        return this.messageHandler.sendMessage(conversationId, content, messageType);
    }

    joinConversation(conversationId) {
        return this.messageHandler.joinConversation(conversationId);
    }

    leaveConversation(conversationId) {
        return this.messageHandler.leaveConversation(conversationId);
    }

    markAsRead(conversationId, messageId) {
        return this.messageHandler.mardAsRead(conversationId, messageId);
    }

    sendTyping(conversationId, isTyping = true) {
        return this.messageHandler.sendTyping(conversationId, isTyping);
    }

    //utility methods
    disconnect() {
        this.reconnectManager.clearReconnectInterval();
        return this.connection.disconnect();
    }

    getConnectionState() {
        return this.connection.getConnectionState();
    }

    get isConnected() {
        return this.connection.isConnected;
    }

    resetReconnectAttempts() {
        this.reconnectManager.reset();
    }



    //friend methods
    sendFriendRequest(targetUserId) {
        return this.messageHandler.sendFriendRequest(targetUserId);
    }
    acceptFriendRequest(targetUserId) {
        return this.messageHandler.acceptFriendRequest(targetUserId);
    }
    rejectFriendRequest(targetUserId) {
        return this.messageHandler.rejectFriendRequest(targetUserId);
    }    
    cancelFriendRequest(targetUserId) {
        return this.messageHandler.cancelFriendRequest(targetUserId);
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;