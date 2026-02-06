<template>
  <div class="modal-overlay" v-if="isOpen" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h3>폐기 품목 조회</h3>
        <button class="close-x" @click="closeModal">✕</button>
      </div>

      <div class="modal-content">
        <div class="info-grid">
          <div class="info-item border-right">
            <label>폐기 번호</label>
            <div class="value bold">#{{ modalData.id }}</div>
          </div>
          <div class="info-item border-right">
            <label>폐기일</label>
            <div class="value">{{ modalData.date }}</div>
          </div>
          <div class="info-item border-right">
            <label>품목 정보</label>
            <div class="value">
              <div class="p-name">{{ modalData.productName }}</div>
              <div class="p-code">CODE : {{ modalData.productCode }}</div>
            </div>
          </div>
          <div class="info-item">
            <label>처리자</label>
            <div class="value row">
              <span class="handler-badge">관리자</span>
              <span class="arrow-down">▼</span>
            </div>
          </div>

          <div class="info-item border-top border-right">
            <label>폐기량</label>
            <div class="value bold">{{ modalData.amount }}</div>
          </div>
          <div class="info-item border-top border-right" style="grid-column: span 2;">
            <label>손실</label>
            <div class="value bold text-center">{{ modalData.loss.toLocaleString() }}원</div>
          </div>
          <div class="info-item border-top">
            <label>문의 유형</label>
            <div class="value row">
              <span class="reason-badge">파손/손실</span>
              <span class="arrow-down">▼</span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-edit" @click="handleEdit">수정</button>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';

export default {
  props: {
    isOpen: Boolean,
    modalData: {
      type: Object,
      default: () => ({
        id: '12345',
        date: '2023-10-27',
        productName: '프리미엄 부사 사과',
        productCode: 'A-1023',
        amount: '15kg',
        loss: 90000
      })
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    async handleEdit() {
      // [수정] 수정 로직 실행 전 확인창 혹은 안내창 디자인 적용
      await Swal.fire({
        title: '수정 모드 진입',
        text: '해당 품목의 정보를 수정하시겠습니까?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#11D411', // 프로젝트 포인트 컬러
        cancelButtonColor: '#9ca3af',
        confirmButtonText: '수정 시작',
        cancelButtonText: '취소',
        reverseButtons: true,
        borderRadius: '16px'
      }).then((result) => {
        if (result.isConfirmed) {
          // 실제 수정 로직이 여기에 들어갑니다.
          console.log('수정 프로세스 시작');
        }
      });
    }
  }
};
</script>

<style scoped>
/* 모달 레이아웃 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  width: 700px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

/* 헤더 스타일 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.close-x {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

/* 그리드 내용 스타일 */
.modal-content {
  padding: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr 1fr;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.info-item {
  padding: 12px 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item label {
  font-size: 13px;
  font-weight: bold;
  color: #22c55e; /* 이미지의 초록색 포인트 */
}

.info-item .value {
  font-size: 14px;
  color: #333;
}

.value.bold { font-weight: 800; }
.value.row { display: flex; align-items: center; justify-content: space-between; }

.p-name { font-weight: bold; font-size: 13px; }
.p-code { font-size: 12px; color: #94a3b8; }

/* 배지 스타일 */
.handler-badge {
  background: #f0fdf4;
  color: #22c55e;
  padding: 2px 10px;
  border-radius: 15px;
  border: 1px solid #bbf7d0;
  font-size: 12px;
}

.reason-badge {
  background: #f1f5f9;
  color: #64748b;
  padding: 2px 10px;
  border-radius: 15px;
  border: 1px solid #cbd5e1;
  font-size: 12px;
}

.arrow-down { font-size: 10px; color: #666; }

/* 보더 유틸리티 */
.border-right { border-right: 1px solid #e5e7eb; }
.border-top { border-top: 1px solid #e5e7eb; }
.text-center { text-align: center; }

/* 푸터 버튼 */
.modal-footer {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.btn-edit {
  background: #10b981; /* 이미지의 선명한 초록색 버튼 */
  color: white;
  border: none;
  padding: 12px 60px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

.btn-edit:hover {
  background: #059669;
}
</style>