// src/api/ChatApi.js
import http from '@/api/axios.js';

export const sendChatMessage = (data) => {
    return http.post('/ai/chat', data);
};

export const downloadChatFile = async (url) => {
    try {
        // 이미 /api가 포함되어 있는지 확인하여 중복 방지
        const requestUrl = url.startsWith('/api') ? url.replace('/api', '') : url;

        const response = await http.get(requestUrl, {
            responseType: 'blob'
        });

        const contentDisposition = response.headers['content-disposition'];
        let fileName = 'downloaded-file';

        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
            if (fileNameMatch && fileNameMatch.length === 2)
                fileName = decodeURIComponent(fileNameMatch[1]); // 한글 파일명 대응
        }

        const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error("파일 다운로드 실패:", error);
        alert("파일을 다운로드할 수 없습니다.");
    }
};