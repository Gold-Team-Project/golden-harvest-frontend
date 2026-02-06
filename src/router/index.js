import DashboardView from "@/views/admin/DashboardView.vue";
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
        meta: { requiresAdmin: true },
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
                name: 'adminPurchaseRegister',
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
                meta: { title: '홈 / 회원 승인 관리' },
            },
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// [수정] 모든 페이지 접근 허용을 위한 가드 주석 처리
router.beforeEach((to, from, next) => {
    // 자유로운 페이지 이동을 위해 모든 차단 로직을 주석 처리했습니다.
    /*
    const accessToken = localStorage.getItem('accessToken');
    const publicPages = ['/login', '/signup', '/password'];
    const isPublicPage = publicPages.includes(to.path);

    // 1. 토큰 만료 체크
    if (accessToken) {
        try {
            const decoded = jwtDecode(accessToken);
            const currentTime = Math.floor(Date.now() / 1000);
            if (decoded.exp < currentTime) {
                alert('로그인 세션이 만료되었습니다.');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                return next('/login');
            }
        } catch (e) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            return next('/login');
        }
    }

    // 2. 비로그인 사용자 차단
    if (!accessToken && !isPublicPage) {
        return next('/login');
    }

    // 3. 이미 로그인한 사용자 차단
    if (accessToken && isPublicPage) {
        return next('/');
    }

    // 4. 관리자 권한 체크
    const isRequiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
    if (isRequiresAdmin && accessToken) {
        const decoded = jwtDecode(accessToken);
        if (decoded.role !== 'ROLE_ADMIN') {
            alert('접근 권한이 없습니다.');
            return next('/');
        }
    }
    */

    // 무조건 다음 페이지로 이동 허용
    next();
});

export default router;