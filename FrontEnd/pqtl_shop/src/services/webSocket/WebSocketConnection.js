// src/services/webSocket/WebSocketConnection.js
class WebSocketConnection {
    constructor() {
        this.socket = null;
        this.tabId = null;
        this.isConnected = false;
        this.token = null;
        this.listeners = new Map();
    }

    connect(token,tabId) {
        this.token = token;
        this.tabId = tabId;
        console.log("--------------------------------------------------------------------", tabId);
        const wsUrl = `${import.meta.env.VITE_WS_URL}?token=${token}&tabId=${tabId}`;
        try {
            this.socket = new WebSocket(wsUrl);
            this.setupEventListeners();
        } catch(error) {
            console.error('WebSocket connection error:', error);
            throw error;
        }
    }

    setupEventListeners() {
        this.socket.onopen = (event) => {
            console.log('WebSocket connected');
            this.isConnected = true;
            this.emit('connected', event);
        };

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('WebSocket message received:', data);
                this.emit(data.messageType, data.data);
                this.emit('message', data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        this.socket.onclose = (event) => {
            console.log('WebSocket disconnected');
            this.isConnected = false;
            this.emit('disconnected', event);
        };
    }

    send(message) {
        if(!this.isConnected || !this.socket) {
            throw new Error("WoebSocket not connected")
        }
        try {
            this.socket.send(JSON.stringify(message));
            return true;
        } catch (error) {
            console.error('Error sending WebSocket message:', error);
            throw error;
        }
    }

    disconnect() {
        if(this.socket) {
            this.socket.close(1000, 'Client disconnect');
            this.socket = null;
        }
        this.isConnected = false;
        this.listeners.clear();
    }

    on(event, callback) {
        if(!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if(!this.listeners.has(event)) return;

        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if(index >-1) {
            callbacks.splice(index,1);
        }
    }

    emit(event, data) {
        if(!this.listeners.has(event)) return;
        this.listeners.get(event).forEach(callback => {
            try {
                callback(data);
            } catch(error) {
                console.error(`Error in WebSocket event handler for ${event}:`, error);
            }
        });
    }

    getConnectionState() {
        if(!this.socket) {
            return 'disconnected';
        }
        switch(this.socket.readyState) {
            case WebSocket.CONNECTING: return 'connecting';
            case WebSocket.OPEN: return 'connected';
            case WebSocket.CLOSING: return 'closing';
            case WebSocket.CLOSED: return 'disconnected';
            default: return 'unknown';
        }
    }

}

export default WebSocketConnection;