// src/api/http.js
import axios from 'axios'

const http = axios.create({
    baseURL: 'http://localhost:8088/api',
    timeout: 5000,
})

export default http
