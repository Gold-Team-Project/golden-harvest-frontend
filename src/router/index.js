// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
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


const routes = [
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
        ],
    },
    {
        path: '/admin',
        component: AdminDefaultLayout,
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
                path: 'masterData/edit/:skuNo', // 수정 페이지 경로 추가
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
        ]
    }
]

export default createRouter({
    history: createWebHistory(),
    routes
})
