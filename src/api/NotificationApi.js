import http from './axios.js'

export async function fetchAllNotificationByUserEmail(userEmail, page = 1, size = 10) {
    try {
        const res = await http.get('/notifications', {
            params: { userEmail, page, size },
        })
        return res.data.data
    } catch (e) {
        console.error(e)
        return null
    }
}

export async function markNotificationAsRead(id) {
    return await http.patch(`/notifications/${id}`)
}

export async function deleteNotification(id, userEmail) {
    return await http.delete(`/notifications/${id}`, { params: { userEmail } })
}

export async function deleteAllNotifications(userEmail) {
    return await http.delete('/notifications/deleteAll', { params: { userEmail } })
}