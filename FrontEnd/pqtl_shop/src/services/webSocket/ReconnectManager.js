
class ReconnectManager {
    constructor(connection) {
        this.connection = connection;
        this.reconnectInterval = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5; // Maximum number of reconnection attemptst
        this.reconnectDelay = 5000; // Delay between reconnection attempts in milliseconds
        this.token = null;
        this.tabId = null;
        
        this.setupListeners();
    }

    setupListeners() {
        this.connection.on('disconnected', (event) => {
            console.log('WebSocket disconnected, starting reconnection attempts...');
            if(event.code !== 1000) { // 1000 is normal closure
                this.handleReconnet();
            }
        });

        this.connection.on('connected', () => {
            console.log('WebSocket reconnected successfully');
            this.reconnectAttempts = 0;
            this.clearReconnectInterval();
        });
    }

    handleReconnet() {
        if(this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error(" Max reconnect attempts reached");
            this.connection.emit('MaxReconnectAttemptsReached');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
        console.log(`Attempting to reconnect .. (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        this.reconnectInterval = setTimeout(() => {
            if(this.token) {
                try {
                    this.connection.connect(this.token, this.tabId);

                }catch(error) {
                    console.error ("Reconnect failed:", error);
                    this.handleReconnet(); // Retry reconnection
                }
            }
        }, delay);


    }

    setToken(token) {
        this.token = token;
    }
    
    setTabId(tabId) {
        this.tabId = tabId;
    }

    clearReconnectInterval() {
        if(this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
            this.reconnectInterval = null;
        }
    } 

    reset() {
        this.reconnectAttempts = 0;
        this.clearReconnectInterval();
    }
            
};

// const ReconnectManagerInstance = new ReconnectManager();
export default ReconnectManager;