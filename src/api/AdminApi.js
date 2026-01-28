import http from './axios.js';

// 1. [조회] 전체 회원 목록 조회 (전체 회원 & 가입 승인 탭)
export async function fetchAllUsers() {
    try {
        const response = await http.get('/admin/user');
        return response.data; // ApiResponse<List<UserAdminResponse>> 반환
    } catch (error) {
        console.error('Error fetching all users:', error);
        throw error;
    }
}

// 2. [조회] 정보 수정 대기 목록 조회 (수정 요청 탭)
export async function fetchPendingUpdateRequests() {
    try {
        const response = await http.get('/admin/user/update-requests');
        return response.data;
    } catch (error) {
        console.error('Error fetching pending update requests:', error);
        throw error;
    }
}

// 3. [처리] 신규 가입 승인
export async function approveUser(email, statusValue) {
    // statusValue에는 'ACTIVE' 문자열이 들어옵니다.
    try {
        const response = await http.patch(`/admin/user/${email}/approve`, {
            userStatus: statusValue  // 백엔드 DTO의 필드명과 정확히 일치해야 함
        });
        return response.data;
    } catch (error) {
        console.error(`Error approving user ${email}:`, error);
        throw error;
    }
}

// 4. [처리] 정보 수정 승인
export async function approveProfileUpdate(requestId) {
    try {
        const response = await http.patch(`/admin/user/update-requests/${requestId}/approve`);
        return response.data;
    } catch (error) {
        console.error(`Error approving profile update for request ${requestId}:`, error);
        throw error;
    }
}