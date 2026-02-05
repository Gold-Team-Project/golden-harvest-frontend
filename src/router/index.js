// src/router/index.js
import DashboardView from "@/views/admin/DashboardView.vue"; // Admin Dashboard
import { createRouter, createWebHistory } from 'vue-router'
import { jwtDecode } from 'jwt-decode'

import UserDefaultLayout from "@/layouts/user/UserDefaultLayout.vue";
import InquiryListView from "@/views/inquiry/user/InquiryListView.vue";
import AdminInquiryListView from "@/views/inquiry/admin/AdminInquiryListView.vue";
import InquiryCreateView from "@/views/inquiry/user/InquiryCreateView.vue";
import AdminDefaultLayout from "@/layouts/admin/AdminDefaultLayout.vue";
import AdminOrderListView from "@/views/orderlist/AdminOrderListView.vue";
import AdminOrderDetailView from "@/views/orderlist/AdminOrderDetailView.vue";
import MasterDataList from "@/views/masterdata/MasterDataList.vue";
import MasterDataDetail from "@/views/masterdata/MasterDataDetail.vue";
import MasterDataEdit from "@/views/masterdata/MasterDataEdit.vue";
import AdminNotificationListView from "@/views/notification/admin/AdminNotificationListView.vue";
import PurchaseOrderListView from "@/views/purchaseOrder/PurchaseOrderListView.vue";
import LotListView from "@/views/lot/LotListView.vue";
import DiscardRegisterView from "@/views/discard/DiscardRegisterView.vue";
import DiscardListView from "@/views/discard/DiscardListView.vue";
import OrderHistoryView from "@/views/orderHistory/OrderHistoryView.vue";
import OrderHistoryDetailView from "@/views/orderHistory/OrderHistoryDetailView.vue";
import CartView from "@/views/cart/CartView.vue";
import OrderView from "@/views/order/OrderView.vue";
import OrderDetailView from "@/views/order/OrderDetailView.vue";
import Login from "@/views/login/Login.vue";
import Signup from "@/views/signup/Signup.vue";
import Password from "@/views/password/Password.vue";
import Mypage from "@/views/mypage/Mypage.vue";
import UserApproval from "@/views/userapproval/UserApproval.vue";
import DashBoardView from "@/views/dashboard/user/DashBoardView.vue";

const routes = [
    {
        path: '/login',
        name: "login",
        component: Login,
    },
    {
        path: '/signup',
        name: "signup",
        component: Signup,
    },
    {
        path: '/password',
        name: "password",
        component: Password,
    },
    {
        path: '/',
        component: UserDefaultLayout,
        children: [
            {
                path: 'order',
                name: 'Order',
                component: OrderView,
                meta: { title: '주문' }
            },
            {
                path: 'order/:id',
                name: 'ProductDetail',
                component: OrderDetailView,
                meta: { title: '주문 / 상품상세' }
            },
            {
                path: 'cart',
                name: 'Cart',
                component: CartView,
                meta: { title: '장바구니' }
            },
            {
                path: 'order-history',
                name: "Invoice",
                component: OrderHistoryView,
                meta: { title: '영수증'}
            },
            {
                path: 'order-history/:id',
                name: 'OrderDetail',
                component: OrderHistoryDetailView,
                meta: { title: '영수증 / 영수증 상세 내역' }
            },
            {
                path: 'inquiries',
                name: "inquiryList",
                component: InquiryListView,
                meta: { title: '설정 / 문의 내역'}
            },
            {
                path: 'inquiries/create',
                name: "inquiryCreate",
                component: InquiryCreateView,
                meta: { title: '설정 / 문의 내역 / 문의 등록 '}
            },
            {
                path: 'mypage',
                name: "mypage",
                component: Mypage,
                meta: { title: '마이페이지 / 내정보 수정 '}
            },
            {
                path: 'dashboard',
                name: "dashboard",
                component: DashBoardView,
                meta: { title: '마이페이지 / 대시보드 '}
            },
        ],
    },
    {
        path: '/admin',
        component: AdminDefaultLayout,
        meta: { requiresAdmin: false }, // 이 부모가 있는 자식들은 모두 가드에 걸림
        children: [
            {
                path: '',
                name: 'adminDashboard',
                component: DashboardView,
                meta: { title: '홈 / 대시보드' },
            },
            {
                path: 'orders',
                name: 'adminOrderList',
                component: AdminOrderListView,
                meta: { title: '거래 관리 / 고객 주문 목록' },
            },
            {
                path: 'orders/:id',
                name: 'adminOrderDetail',
                component: AdminOrderDetailView,
                meta: { title: '거래 관리 / 주문 상세' },
            },
            {
                path: 'inquiries',
                name: 'adminInquiryList',
                component: AdminInquiryListView,
                meta: { title: '관리자 / 문의 관리' },
            },
            {
                path: 'masterData',
                name: 'adminMasterDataList',
                component: MasterDataList,
                meta: { title: '홈 / 마스터 데이터 / 품목 관리' },
            },
            {
                path: 'masterData/:skuNo',
                name: 'adminMasterDataDetail',
                component: MasterDataDetail,
                meta: { title: '홈 / 마스터 데이터 / 품목 관리 / 품목 상세 정보' },
            },
            {
                path: 'masterData/edit/:skuNo',
                name: 'MasterEdit',
                component: MasterDataEdit
            },
            {
                path: 'notifications',
                name: 'adminNotification',
                component: AdminNotificationListView,
                meta: { title: '알림' },
            },
            {
                path: 'purchaseOrder',
                name: 'purchaseOrder',
                component: PurchaseOrderListView,
                meta: { title: '알림' },
            },
            {
                path: 'lots',
                name: 'adminLotList',
                component: LotListView,
                meta: { title: '홈 / LOT 관리 / LOT 리스트' },
            },
            {
                path: 'discard/register',
                name: 'adminDiscardRegister',
                component: DiscardRegisterView,
                meta: { title: '홈 / 재고 관리 / 폐기 등록' },
            },
            {
                path: 'discard/list',
                name: 'adminDiscardList',
                component: DiscardListView,
                meta: { title: '홈 / 재고 관리 / 폐기 내역' },
            },
            {
                path: 'approval',
                name: 'adminMemberList',
                component: UserApproval,
                meta: { title: '홈 / 재고 관리 / 폐기 내역' },
            },
        ]
    }
]

// 라우터 생성
const router = createRouter({
    history: createWebHistory(),
    routes
})

// 라우터 가드 작성
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('accessToken');
    const isAuthenticated = !!token;

    const publicPages = ['/login', '/signup', '/password'];
    const authRequired = !publicPages.includes(to.path);

    // 인증이 필요하고 사용자가 인증되지 않았다면 로그인 페이지로 리디렉션 (알림 없음)
    if (authRequired && !isAuthenticated) {
        return next('/login');
    }

    // 사용자가 인증되었고 로그인/회원가입/비밀번호 찾기 페이지로 가려 한다면 홈으로 리디렉션
    if (isAuthenticated && publicPages.includes(to.path)) {
        return next('/');
    }

    // --- 기존 관리자 가드 로직 ---
    const isRequiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

    if (isRequiresAdmin) {
        // 이 부분은 인증된 사용자가 관리자 권한이 없을 때만 해당
        try {
            const decoded = jwtDecode(token); // 토큰이 있다는 것은 위에서 확인됨
            if (decoded.role !== 'ROLE_ADMIN') {
                alert('접근 권한이 없습니다.');
                return next('/');
            }
            next(); // 관리자라면 통과
        } catch (error) {
            console.error('JWT Decode Error:', error);
            localStorage.removeItem('accessToken');
            next('/login'); // 토큰 오류 시 로그인 페이지로
        }
    } else {
        next(); // 공용 페이지 또는 인증된 일반 사용자 페이지, 진행
    }
});

export default router;