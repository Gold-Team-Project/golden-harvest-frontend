// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { jwtDecode } from 'jwt-decode' // ✅ 라이브러리 임포트 확인 (없으면 npm install jwt-decode)

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
import PerchaseOrderListView from "@/views/perchaseOrder/PerchaseOrderListView.vue";
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
        ],
    },
    {
        path: '/admin',
        component: AdminDefaultLayout,
        meta: { requiresAdmin: false }, // ✅ 이 부모가 있는 자식들은 모두 가드에 걸립니다.
        children: [
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
                path: 'perchaseOrder',
                name: 'perchaseOrder',
                component: PerchaseOrderListView,
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

    // to.matched를 통해 부모 중 하나라도 requiresAdmin이 있는지 확인합니다.
    const isRequiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

    if (isRequiresAdmin) {
        if (!token) {
            alert('관리자 로그인이 필요한 페이지입니다.');
            return next('/login');
        }

        try {
            const decoded = jwtDecode(token);
            // 백엔드 Role 값(ROLE_ADMIN)과 일치하는지 확인
            if (decoded.role !== 'ROLE_ADMIN') {
                alert('접근 권한이 없습니다.');
                return next('/');
            }
            next(); // 관리자라면 통과
        } catch (error) {
            console.error('JWT Decode Error:', error);
            localStorage.removeItem('accessToken');
            next('/login');
        }
    } else {
        next(); // 일반 페이지는 통과
    }
});

export default router;