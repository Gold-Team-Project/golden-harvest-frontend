import http from './axios.js'

export async function getDiscardList(filters) {
    try {
        const params = {
            page: filters.page,
            size: filters.size,
            startDate: filters.startDate || null,
            endDate: filters.endDate || null,
            // 다른 필터들도 필요에 따라 추가
        };
        const response = await http.get('/discard/list', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching discard list:', error);
        throw error;
    }
}

export async function getDiscardVolume() {
    try {
        const response = await http.get('/discard/volume');
        return response.data;
    } catch (error) {
        console.error('Error fetching discard volume:', error);
        throw error;
    }
}
