<template>
  <div class="order-detail">

    <!-- 주문 헤더 -->
    <div class="order-header">
      <div>
        <h2 class="order-id">주문 #{{ order.orderNo }}</h2>
        <p class="order-date">주문일시 : {{ order.orderedAt }}</p>
      </div>

      <div class="actions">
        <BaseButton variant="outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;"><path d="M19 8H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2h3a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1Zm-5 11h-4v-5h4v5Zm3-6H7v-4h10v4Z" /></svg>
            거래 명세서 출력
        </BaseButton>
        <BaseButton variant="primary" style="background-color: #ef4444;">주문 취소</BaseButton>
        <BaseButton variant="primary" style="background-color: #2ecc71;">승인</BaseButton>
      </div>
    </div>

    <!-- 주문 진행 상태 -->
    <div class="order-status-section">
      <OrderProgress :status="orderStatusKey" />
    </div>

    <!-- 정보 카드 -->
    <div class="info-cards-grid">
      <InfoCard title="주문자 정보" icon="👤">
            <p><strong>상호명</strong> {{ order.customer.company }}</p>
            <p><strong>담당자</strong> {{ order.customer.manager }}</p>
            <p><strong>연락처</strong> {{ order.customer.phone }}</p>
            <p><strong>이메일</strong> {{ order.customer.email }}</p>
          </InfoCard>
    
          <InfoCard title="배송지 정보" icon="🚚">
            <p><strong>수령인</strong> {{ order.shipping.receiver }}</p>
            <p><strong>배송주소</strong> {{ order.shipping.address }}</p>
            <p><strong>배송요청일</strong> {{ order.shipping.requestDate }}</p>
            <p><strong>요청사항</strong> {{ order.shipping.memo }}</p>
          </InfoCard>
    
          <InfoCard title="결제 정보" icon="💳">
            <p><strong>결제 수단</strong> {{ order.payment.method }}</p>
            <p><strong>입금 계정</strong> {{ order.payment.account }}</p>
            <p><strong>결제 상태</strong> {{ order.payment.status }}</p>
            <p class="total"><strong>총 결제 금액</strong> {{ totalAmount }}원</p>
          </InfoCard>
        </div>
    
        <!-- 주문 상품 리스트 -->
        <div class="card order-items-list-card">
          <h3 class="section-title">주문 품목 리스트</h3>
    
          <table class="item-table">
            <thead>
              <tr>
                <th>상품 정보</th>
                <th>단가</th>
                <th>수량</th>
                <th>합계</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in order.items" :key="item.id">
                <td>
                  <div class="item-info">
                    <img :src="item.image" alt="item-image" class="item-image" />
                    <div class="item-details">
                      <p class="item-name">{{ item.name }}</p>
                      <p class="item-code">코드: {{ item.code }}</p>
                      <p class="item-option">옵션: {{ item.option }}</p>
                    </div>
                  </div>
                </td>
                <td>{{ item.price.toLocaleString() }}원</td>
                <td>{{ item.quantity }}</td>
                <td>{{ (item.price * item.quantity).toLocaleString() }}원</td>
              </tr>
            </tbody>
          </table>
    
          <div class="item-summary">
            <div class="summary-total-quantity">
              <span>합계 수량:</span>
              <span>{{ totalQuantity }}개</span>
            </div>
            <div class="summary-total-amount">
              <span></span>
              <span>{{ totalAmount }}원</span>
            </div>
          </div>
        </div>
    
      </div>
    </template>
    
    <script setup>
    import { ref, computed } from 'vue'
    import BaseButton from '@/components/button/BaseButton.vue';
    import InfoCard from './InfoCard.vue'
    import OrderProgress from './OrderProgress.vue' // New import
    
    const order = ref({
      orderNo: 'ORD-2023-001',
      orderedAt: '2023년 10월 24일 · 10:30 AM',
      statusIndex: 0, // 0: 신규 주문, 1: 상품준비중, 2: 배송 중, 3: 배송 완료
    
      customer: {
        company: '프레시 마켓',
        manager: '김철수',
        phone: '010-1234-5676',
        email: 'ac2ount930@name.co.kr'
      },
    
      shipping: {
        receiver: '김철수',
        address: '서울시 강남구 테헤란로 123, 프레시마켓 물류센터',
        requestDate: '2023-10-26',
        memo: '오전 중에 도착하게 해주세요'
      },
    
      payment: {
        method: '무통장 입금',
        account: '프레시마켓',
        status: '입금 대기'
      },
    
      items: [
        { id: 1, name: '프리미엄 제주 감귤 (10kg)', code: 'PO-00125', option: '특상', price: 30000, quantity: 10, image: '' },
        { id: 2, name: '프리미엄 제주 감귤 (10kg)', code: 'PO-00125', option: '특상', price: 30000, quantity: 10, image: '' }
      ]
    })
    
    
    const totalQuantity = computed(() =>
      order.value.items.reduce((sum, i) => sum + i.quantity, 0)
    )
    
    const totalAmount = computed(() =>
      order.value.items.reduce((sum, i) => sum + i.price * i.quantity, 0).toLocaleString()
    )
    
    // Map statusIndex to string key for OrderProgress component
    const orderStatusKey = computed(() => {
      switch (order.value.statusIndex) {
        case 0: return 'CREATED';
        case 1: return 'PREPARING';
        case 2: return 'SHIPPING';
        case 3: return 'DELIVERED';
        default: return 'CREATED';
      }
    });
    </script>
    
    <style scoped>
    .order-detail {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .card { /* Base card style for .order-items-list-card */
      background: #ffffff;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    }
    
    /* Order Header */
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px; /* Added padding to match other cards */
      background: #ffffff; /* Added background for header */
      border-radius: 12px; /* Added border-radius */
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    }
    .order-id {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
    }
    .order-date {
      font-size: 14px;
      color: #6b7280;
      margin-top: 8px;
    }
    .actions {
      display: flex;
      gap: 8px;
    }
    
    /* Order Status Section */
    .order-status-section {
      padding: 24px; /* Added padding to match other cards */
      background: #ffffff; /* Added background */
      border-radius: 12px; /* Added border-radius */
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      /* Use the OrderProgress component directly */
    }
    
    /* Info Cards Grid */
    .info-cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    
    /* Order Items List Card */
    .order-items-list-card {
      /* Inherits .card styles */
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 16px 0;
    }
    .item-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }
    .item-table th, .item-table td {
      padding: 12px 0;
      border-bottom: 1px solid #f3f4f6;
      text-align: left;
      vertical-align: middle;
    }
    .item-table th {
      font-size: 13px;
      color: #6b7280;
      background-color: #f9fafb;
      padding: 8px;
    }
    .item-table td:nth-child(1) { width: 40%; } /* 상품 정보 */
    .item-table td:nth-child(2) { width: 20%; } /* 단가 */
    .item-table td:nth-child(3) { width: 10%; } /* 수량 */
    .item-table td:nth-child(4) { width: 30%; text-align: right; } /* 합계 */
    .item-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .item-image {
      width: 64px;
      height: 64px;
      border-radius: 8px;
      object-fit: cover;
      background-color: #f3f4f6;
    }
    .item-details p { margin: 0; font-size: 13px; }
    .item-name { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
    .item-code, .item-option { color: #6b7280; }
    
    .item-summary {
      display: flex;
      justify-content: flex-end;
      gap: 24px;
      margin-top: 24px;
      font-size: 16px;
      font-weight: 600;
    }
    .summary-total-quantity, .summary-total-amount {
      display: flex;
      gap: 8px;
    }
    .summary-total-amount span:last-child {
      color: #22c55e;
      font-size: 20px;
    }
    </style>