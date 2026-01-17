// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import UserDefaultLayout from "@/layouts/user/UserDefaultLayout.vue";
import InquiryListView from "@/views/inquiry/InquiryListView.vue";
import InquiryCreateView from "@/views/inquiry/InquiryCreateView.vue";


let DashboardView;
const routes = [
    {
        path: '/',
        component: UserDefaultLayout,
        children: [
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
]

export default createRouter({
    history: createWebHistory(),
    routes
})
