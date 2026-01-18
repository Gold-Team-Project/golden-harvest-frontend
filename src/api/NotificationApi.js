import http from './axios.js'

export async function fetchAllNotificationByUserEmail(userEmail) {
    const res = await http.get('api/Notifications/user/' + userEmail, {
        params: {page, size },
    })
    console.log(res.data.data)
    return res.data.data
}