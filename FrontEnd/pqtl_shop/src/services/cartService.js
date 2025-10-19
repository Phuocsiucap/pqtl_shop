import { apiCall1 } from './rootAPI';


export const cartService = {
    getCart: () => apiCall1('GET', '/api/cart'),
    updateItemQty: (itemId, qty) => apiCall1('PUT', `/api/cart/${itemId}`, { qty }),
    removeItem: (itemId) => apiCall1('DELETE', `/api/cart/${itemId}`),
    clearSelected: (ids) => apiCall1('POST', '/api/cart/bulk-delete', { ids }),
};
export const promoService = {
    validateCode: (code) => apiCall1('POST', '/api/promos/validate', { code }),
};


export const orderService = {
    checkout: (payload) => apiCall1('POST', '/api/orders', payload),
};