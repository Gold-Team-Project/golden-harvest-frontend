<template>
  <div class="edit-info-container">
    <p class="top-guide-text">회사명, 사업자 등록번호, 이메일 수정 시 '수정 요청' 버튼을 눌러주세요.</p>

    <div class="settings-card">
      <div class="scroll-area">

        <div class="settings-section">
          <h3 class="section-title">
            <img src="@/assets/company.svg" alt="Company" class="title-icon" /> 사업자 정보
          </h3>

          <div class="business-info-list">
            <div class="input-group full-width">
              <label>회사명</label>
              <div class="input-with-btn">
                <input type="text" v-model="info.companyName" />
                <button type="button" class="request-btn">수정 요청</button>
              </div>
            </div>

            <div class="input-group full-width">
              <label>사업자 등록번호</label>
              <div class="input-with-btn">
                <input type="text" v-model="info.businessId" />
                <button type="button" class="request-btn">수정 요청</button>
              </div>
            </div>

            <div class="input-group full-width">
              <label>이메일 (세금계산서 수신용)</label>
              <div class="input-with-btn">
                <input type="email" v-model="info.email" />
                <button type="button" class="request-btn">수정 요청</button>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="personal-grid">
            <div class="input-group">
              <label>담당자 이름</label>
              <input type="text" v-model="info.managerName" />
            </div>
            <div class="input-group">
              <label>전화번호</label>
              <input type="text" v-model="info.phone" />
            </div>
          </div>
        </div>

        <div class="password-bg-area">
          <div class="settings-section">
            <h3 class="section-title">
              <img src="@/assets/password.svg" alt="Password" class="title-icon" /> 비밀번호 변경
            </h3>
            <div class="password-grid">
              <div class="input-group full-width">
                <label>기존 비밀번호</label>
                <input type="password" v-model="pass.old" placeholder="현재 비밀번호를 입력하세요" />
              </div>
              <div class="input-group">
                <label>비밀번호 변경</label>
                <input type="password" v-model="pass.new" placeholder="새 비밀번호를 입력하세요" />
              </div>
              <div class="input-group">
                <label>비밀번호 확인</label>
                <input type="password" v-model="pass.confirm" placeholder="새 비밀번호를 다시 입력하세요" />
              </div>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3 class="section-title">
            <img src="@/assets/address.svg" alt="Address" class="title-icon" /> 배송지 수정 및 등록
          </h3>
          <div class="table-wrapper">
            <table class="addr-table">
              <thead>
              <tr>
                <th style="width: 15%">수령인(Recipient)</th>
                <th style="width: 45%">주소(Address)</th>
                <th style="width: 20%">연락처(Contant)</th>
                <th style="width: 10%">상태</th>
                <th style="width: 10%">관리</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(addr, idx) in addressList" :key="idx">
                <td>{{ addr.name }}</td>
                <td class="addr-detail"><strong>[{{ addr.zip }}]</strong> {{ addr.base }} {{ addr.detail }}</td>
                <td>{{ addr.phone }}</td>
                <td><span v-if="addr.isDefault" class="default-tag">기본 배송지</span></td>
                <td class="action-cell">
                  <button class="icon-btn" @click="openEditModal(addr)">
                    <img src="@/assets/input.svg" alt="Edit" class="action-icon" />
                  </button>
                  <button class="icon-btn">
                    <img src="@/assets/delete.svg" alt="Delete" class="action-icon" />
                  </button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <button class="submit-btn">수정</button>
      </div>
    </div>
  </div>
  <AddressModal
      v-if="isAddrModalOpen"
      :addrData="currentAddr"
      @close="isAddrModalOpen = false"
      @save="handleSaveAddress"
  />
</template>

<script setup>
import { reactive, ref } from 'vue';
import AddressModal from '@/views/mypage/modal/AddressModal.vue';

const isAddrModalOpen = ref(false)
const currentAddr = ref(null)

const openEditModal = (addr) => {
  currentAddr.value = addr // 수정할 데이터 전달
  isAddrModalOpen.value = true
}

const handleSaveAddress = (updatedData) => {
  console.log("저장할 데이터:", updatedData)
  // API 호출 로직 추가
  isAddrModalOpen.value = false
}

const info = reactive({ companyName: '', businessId: '', managerName: '', phone: '', email: '' });
const pass = reactive({ old: '', new: '', confirm: '' });
const addressList = ref([
  { name: '김철수', zip: '12345', base: '경기도 성남시 분당구 판교로 456', detail: 'B동 202호', phone: '010-1234-5678', isDefault: true }
]);

</script>

<style scoped>
.edit-info-container { padding: 0 30px 20px; max-width: 1300px; margin: 0 auto; }
.top-guide-text { font-size: 13px; color: #a0a0a0; margin: 10px 0 15px; }

.settings-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 85vh; /* 화면의 85% 이상 커지지 않도록 제한 */
}

/* 스크롤 핵심 설정 */
.scroll-area {
  overflow-y: auto;
  flex: 1;
}

.settings-section { padding: 30px 40px; }

/* 1열 배치 (비즈니스 정보) */
.business-info-list { display: flex; flex-direction: column; gap: 20px; }

/* 2열 배치 (개인 정보 및 비밀번호) */
.personal-grid, .password-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 40px;
}

.full-width { grid-column: span 2; } /* 기존 비밀번호만 전체 너비 */

.password-bg-area { background-color: #f8f9fa; border-top: 1px solid #eee; border-bottom: 1px solid #eee; }

.section-title { display: flex; align-items: center; gap: 10px; font-size: 17px; font-weight: 700; margin-bottom: 25px; }
.title-icon { width: 22px; height: 22px; object-fit: contain; }

.input-group label { display: block; font-size: 16px; font-weight: 700; margin-bottom: 10px; color: #333; }
.input-group input { width: 100%; height: 48px; padding: 0 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 15px; outline: none; }
.input-group input:focus {
  border-color: #11D411;
  box-shadow: 0 0 0 4px rgba(17, 212, 17, 0.1);
}

.input-with-btn { display: flex; gap: 10px; }
.input-with-btn input { flex: 1; }
.request-btn { white-space: nowrap; background: #11D411; color: #fff; border: none; padding: 0 20px; border-radius: 8px; font-weight: 700; cursor: pointer; }
.request-btn:hover { background-color: #0fb80f; }
.request-btn:active { transform: scale(0.98); }

.divider { height: 1px; background: #eee; margin: 30px 0; }

/* 테이블 스타일 */
.table-wrapper { border: 1px solid #eee; border-radius: 8px; overflow: hidden; }
.addr-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.addr-table th { background: #fbfbfb; padding: 15px; text-align: left; color: #666; border-bottom: 1px solid #eee; }
.addr-table td { padding: 15px; border-bottom: 1px solid #f9f9f9; }
.default-tag { background: #eefdee; color: #11D411; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }
.icon-btn { background: none; border: none; cursor: pointer; font-size: 18px; margin-right: 10px; padding: 5px; }

/* 고정 하단 영역 */
.card-footer {
  padding: 20px 40px;
  display: flex;
  justify-content: flex-end;
  background: white;
  border-top: 1px solid #eee;
  z-index: 10;
}
.submit-btn { background: #11D411; color: #fff; border: none; padding: 12px 60px; border-radius: 8px; font-size: 17px; font-weight: 700; cursor: pointer; }
.submit-btn:hover { background-color: #0fb80f; }
.submit-btn:active { transform: scale(0.98); }

/* 스크롤바 디자인 (선택 사항) */
.scroll-area::-webkit-scrollbar { width: 8px; }
.scroll-area::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }
</style>