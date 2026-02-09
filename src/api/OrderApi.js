import http from './axios.js'

export async function fetchMyOrders(filters, page = 0, size = 10) {
    try {
        const params = { page, size };
        if (filters?.startDate) {
            params.startDate = filters.startDate;
        }
        if (filters?.endDate) {
            params.endDate = filters.endDate;
        }
        const response = await http.get('/sales/my-orders', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching my orders:', error);
        throw error;
    }
}

export async function fetchOrderDetail(orderId) {
    try {
        const response = await http.get(`/sales/${orderId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching order detail for ${orderId}:`, error);
        throw error;
    }
}

export async function fetchAdminOrderDetail(orderId) {
    try {
        const response = await http.get(`/sales/orders/${orderId}/details`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching admin order detail for ${orderId}:`, error);
        throw error;
    }
}

export async function fetchAllOrders(filters, page = 0, size = 10) {
    try {
        const params = { page, size };
        if (filters?.startDate) params.startDate = filters.startDate;
        if (filters?.endDate) params.endDate = filters.endDate;
        if (filters?.orderStatus && filters.orderStatus !== '전체') {
            params.orderStatus = filters.orderStatus;
        }
        if (filters?.customerName) params.customerName = filters.customerName;

        const response = await http.get('/sales/all-orders', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching all orders:', error);
        throw error;
    }
}

export async function fetchProducts(filters) {
    try {
        const response = await http.get('/items', { params: filters });
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

export async function fetchItemDetail(skuNo) {
    try {
        const response = await http.get(`/master-data/items/${skuNo}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching item detail for ${skuNo}:`, error);
        throw error;
    }
}

export async function fetchCartItems() {
    try {
        const response = await http.get('/cart');
        return response.data;
    } catch (error) {
        console.error('Error fetching cart items:', error);
        throw error;
    }
}

export async function updateCartItemQuantity(skuNo, quantity) {
    try {
        const response = await http.put('/cart/items', { skuNo, quantity });
        return response.data;
    } catch (error) {
        console.error(`Error updating cart item quantity for ${skuNo}:`, error);
        throw error;
    }
}

export async function deleteCartItem(skuNo) {
    try {
        const response = await http.delete(`/cart/items/${skuNo}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting cart item ${skuNo}:`, error);
        throw error;
    }
}

export async function checkoutCart() {
    try {
        const response = await http.post('/cart/checkout');
        return response.data;
    } catch (error) {
        console.error('Error during cart checkout:', error);
        throw error;
    }
}

export async function cancelOrder(orderId) {
    try {
        const response = await http.patch(`/sales/orders/${orderId}/cancel`); // Corrected path
        return response.data;
    } catch (error) {
        console.error(`Error cancelling order ${orderId}:`, error);
        throw error;
    }
}
export function addToCart(payload) {
    return http.post('/cart/items', payload);
}

export async function approveOrder(orderId) {
    try {
        const response = await http.patch(`/sales/orders/${orderId}/approve`, {}); // Send an empty JSON body
        return response.data;
    } catch (error) {
        console.error(`Error approving order ${orderId}:`, error);
        throw error;
    }

}

export async function fetchUserOrderInfo() {
    try {
        const response = await http.get('/sales/user-order');
        return response.data;
    } catch (error) {
        console.error('Error fetching user order info:', error);
        throw error;
    }
}

export async function fetchUserFrequentOrders() {
    try {
        const response = await http.get('/sales/user-frequent-orders');
        return response.data;
    } catch (error) {
        console.error('Error fetching user frequent orders:', error);
        throw error;
    }
}