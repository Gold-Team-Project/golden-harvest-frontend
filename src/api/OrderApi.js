import http from './axios.js'

export async function fetchMyOrders() {
    try {
        const response = await http.get('/sales/my-orders');
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

export async function fetchAllOrders(filters) {
    try {
        const params = {
            startDate: filters.startDate,
            endDate: filters.endDate,
            orderStatus: filters.orderStatus === '전체' ? null : filters.orderStatus, // "전체"일 경우 null로 보냄
            // page, size 등의 페이지네이션 파라미터는 나중에 추가
        };
        const response = await http.get('/sales/all-orders', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching all orders:', error);
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
