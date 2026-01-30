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
        const response = await http.get('/items', { params });
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error('Error fetching all items:', error);
        throw error;
    }
}
export async function getLots(filters) {
    try {
        const params = {
            lotNo: filters.lotNo || null, // Changed from skuNo to lotNo
            status: filters.status || null, // Added status filter
            startDate: filters.startDate,
            endDate: filters.endDate,
            limit: filters.size,
            offset: (filters.page - 1) * filters.size,
        };

        const response = await http.get('/admin/items', { params });
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error('Error fetching lots:', error);
        throw error;
    }
}

