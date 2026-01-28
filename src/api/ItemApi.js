import http from './axios.js'

export async function getAllItems(filters) {
    try {
        const params = {
            page: filters.page,
            size: filters.size,
            skuNo: filters.skuNo || null,
            startDate: filters.startDate || null,
            endDate: filters.endDate || null,
        };
        const response = await http.get('/admin/item', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching all items:', error);
        throw error;
    }
}

export async function getLots(filters) {
    try {
        const params = {
            page: filters.page,
            size: filters.size,
            lotNo: filters.lotNo || null,
            itemName: filters.itemName || null,
            status: filters.status || null,
        };
        const response = await http.get('/admin/item', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching lots:', error);
        throw error;
    }
}
