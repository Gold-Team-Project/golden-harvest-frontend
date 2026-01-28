<template>
  <div class="admin-container">
    <div class="breadcrumb">홈 / 고객관리 / <strong>회원 관리</strong></div>

    <div class="tab-container">
      <button :class="['tab-btn', { active: activeTab === 'all' }]" @click="activeTab = 'all'">전체 회원</button>
      <button :class="['tab-btn', { active: activeTab === 'join' }]" @click="activeTab = 'join'">
        가입 승인 <span class="count">{{ joinPendingCount }}</span>
      </button>
      <button :class="['tab-btn', { active: activeTab === 'update' }]" @click="activeTab = 'update'">
        수정 요청 <span class="count">{{ updatePendingCount }}</span>
      </button>
    </div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-item flex-2">
          <label>사업자명</label>
          <div class="search-input-wrapper">
            <img src="@/assets/search.svg" class="search-icon-svg" alt="search" />
            <input type="text" placeholder="사업자명 검색" v-model="filters.companyName" />
          </div>
        </div>
        <div class="filter-item">
          <label>대표자명</label>
          <input type="text" placeholder="이름 입력" v-model="filters.ceoName" class="basic-input" />
        </div>
        <div class="filter-item">
          <label>연락처</label>
          <input type="text" placeholder="번호 입력" v-model="filters.phone" class="basic-input" />
        </div>
        <div class="filter-item">
          <label>상태</label>
          <select v-model="filters.status" class="basic-select">
            <option value="">전체</option>
            <option value="PENDING">대기</option>
            <option value="ACTIVE">활성화</option>
          </select>
        </div>
        <button class="search-btn">검색</button>
      </div>
    </div>

    <div class="list-card">
      <div class="card-header">
        <img src="@/assets/user-icon.svg" class="title-icon-svg" alt="user" />
        <h3>{{ tabTitle }}</h3>
      </div>

      <div class="table-container">
        <table class="admin-table">
          <thead>
          <tr v-if="activeTab !== 'update'">
            <th style="width: 15%">요청/가입일</th>
            <th style="width: 20%">사업자명</th>
            <th style="width: 12%">대표자명</th>
            <th style="width: 15%">연락처</th>
            <th style="width: 10%">권한</th>
            <th style="width: 13%">상태</th>
            <th style="width: 15%">관리</th>
          </tr>
          <tr v-else>
            <th style="width: 15%">요청일</th>
            <th style="width: 15%">사업자명</th>
            <th style="width: 12%">수정항목</th>
            <th style="width: 19%">기존 정보</th>
            <th style="width: 19%">변경 희망 정보</th>
            <th style="width: 10%">상태</th>
            <th style="width: 10%">관리</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, idx) in filteredList" :key="idx">
            <template v-if="activeTab !== 'update'">
              <td>{{ item.date }}</td>
              <td>{{ item.company }}</td>
              <td>{{ item.ceo }}</td>
              <td>{{ item.phone }}</td>
              <td>{{ item.role }}</td>
              <td>
                  <span :class="['status-badge', item.userStatus]">
                    {{ item.userStatus === 'ACTIVE' ? '활성화' : '대기' }}
                  </span>
              </td>
            </template>
            <template v-else>
              <td>{{ item.date }}</td>
              <td>{{ item.company }}</td>
              <td><span class="update-tag">{{ item.updateField }}</span></td>
              <td class="old-val">{{ item.oldValue }}</td>
              <td class="new-val">{{ item.newValue }}</td>
              <td><span class="status-badge PENDING">수정대기</span></td>
            </template>
            <td>
              <button class="detail-btn" @click="openModal(item)">상세보기</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-wrapper">
        <div class="pagination">
          <button class="arrow" :disabled="currentPage === 1">&lt;</button>
          <button class="page active">1</button>
          <button class="arrow">&gt;</button>
        </div>
      </div>
    </div>

    <UserApprovalModal v-if="isModalOpen" :userData="selectedData" :mode="activeTab" @close="isModalOpen = false" />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import UserApprovalModal from '@/views/userapproval/modal/UserApprovalModal.vue';

const activeTab = ref('all');
const filters = reactive({ companyName: '', ceoName: '', phone: '', status: '' });
const isModalOpen = ref(false);
const selectedData = ref(null);
const currentPage = ref(1);

const userList = ref([
  { id: 1, date: '2025-12-25', company: '푸른바다 유통', ceo: '김청수', phone: '010-1234-5678', role: '고객', userStatus: 'PENDING', requestStatus: 'PENDING', type: 'JOIN' },
  { id: 2, date: '2025-12-24', company: '고래상점', ceo: '박고래', phone: '010-5678-9999', role: '고객', userStatus: 'ACTIVE', requestStatus: 'APPROVED', type: 'JOIN' },
  { id: 3, date: '2025-12-26', company: '새우나라', updateField: '사업자번호', oldValue: '111-22-33333', newValue: '444-55-66666', type: 'UPDATE' }
]);

const tabTitle = computed(() => {
  if (activeTab.value === 'join') return '가입 승인 요청';
  if (activeTab.value === 'update') return '정보 수정 요청';
  return '회원 목록';
});

const filteredList = computed(() => {
  if (activeTab.value === 'join') return userList.value.filter(u => u.type === 'JOIN' && u.requestStatus === 'PENDING');
  if (activeTab.value === 'update') return userList.value.filter(u => u.type === 'UPDATE');
  return userList.value.filter(u => u.type === 'JOIN');
});

const joinPendingCount = computed(() => userList.value.filter(u => u.type === 'JOIN' && u.requestStatus === 'PENDING').length);
const updatePendingCount = computed(() => userList.value.filter(u => u.type === 'UPDATE').length);

const openModal = (data) => { selectedData.value = { ...data }; isModalOpen.value = true; };
</script>

<style scoped>
.admin-container { padding: 30px 50px; background-color: #f8f9fb; min-height: 100vh; box-sizing: border-box; }
.breadcrumb { font-size: 14px; color: #888; margin-bottom: 20px; }

/* 🔹 탭 디자인 */
.tab-container {
  display: flex;
  gap: 0; /* 탭 사이 틈을 없애고 테두리를 공유하게 설정 (선택 사항) */
  margin-bottom: -1px;
}
.tab-btn {
  /* 포인트: 고정 너비 설정 (원하는 크기에 따라 조정 가능) */
  width: 160px;
  height: 50px;

  display: flex;
  align-items: center;
  justify-content: center; /* 텍스트 중앙 정렬 */

  border: 1px solid #e0e0e0;
  border-bottom: none;
  background: #f1f3f5;
  color: #777;
  font-weight: 700;
  cursor: pointer;
  border-radius: 12px 12px 0 0;
  transition: all 0.2s;
  font-size: 15px;
  position: relative;
  margin-right: 5px; /* 탭 사이 간격 */
}
.tab-btn.active {
  background: #fff;
  color: #11D411;
  border-color: #e0e0e0;
  border-bottom: 2px solid #fff; /* 필터 카드 테두리를 덮음 */
  z-index: 2;
}
.tab-btn .count {
  background: #ff4d4d;
  color: #fff;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 8px;
  /* 숫자가 있어도 글자가 밀리지 않도록 절대 위치를 잡고 싶다면 아래 주석 해제 */
  /* position: absolute; right: 15px; */
}

/* 🔹 필터 카드 */
.filter-card {
  background: #fff; padding: 30px; border-radius: 0 20px 20px 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 30px; border: 1px solid #e0e0e0;
}
.filter-grid { display: flex; gap: 15px; align-items: flex-end; }
.filter-item { display: flex; flex-direction: column; gap: 10px; flex: 1; min-width: 0; }
.filter-item.flex-2 { flex: 1.8; }
.filter-item label { font-size: 14px; font-weight: 700; color: #444; }

/* 🔹 인풋 스타일 (요청하신 포커스 효과 유지) */
.search-input-wrapper { position: relative; width: 100%; }
.search-icon-svg { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); width: 18px; }
.search-input-wrapper input, .basic-input, .basic-select {
  width: 100%; height: 45px; padding: 0 15px; border: 1px solid #C8E4C8;
  border-radius: 10px; background: white; font-size: 14px; outline: none; transition: all 0.2s; box-sizing: border-box;
}
.search-input-wrapper input { padding-left: 45px; }
.search-input-wrapper input:focus, .basic-input:focus, .basic-select:focus {
  border-color: #11D411 !important; box-shadow: 0 0 0 3px rgba(17, 212, 17, 0.05);
}

.search-btn { background: #11D411; color: #fff; border: none; padding: 0 35px; height: 45px; border-radius: 10px; font-weight: 700; cursor: pointer; flex-shrink: 0; }
.search-btn:hover { background-color: #0fb80f; }
.search-btn:active { transform: scale(0.98); }

/* 🔹 리스트 카드 및 테이블 */
.list-card { background: #fff; border-radius: 20px; padding: 30px; border: 1px solid #e0e0e0; min-height: 550px; display: flex; flex-direction: column; }
.card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 25px; }
.title-icon-svg { width: 22px; }

.table-container { flex: 1; overflow-x: auto; width: 100%; }
.admin-table { width: 100%; border-collapse: collapse; min-width: 900px; table-layout: fixed; }
.admin-table th { padding: 15px; text-align: left; color: #888; border-bottom: 2px solid #f4f4f4; font-size: 14px; background: #fff; }
.admin-table td { padding: 18px 10px; font-size: 14px; border-bottom: 1px solid #f9f9f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* 🔹 수정 요청 탭 전용 스타일 */
.update-tag { background: #f1f3f5; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; color: #555; }
.old-val { color: #999; text-decoration: line-through; font-size: 13px; }
.new-val { color: #11D411; font-weight: 700; font-size: 14px; }

/* 배지 및 버튼 */
.status-badge { padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
.status-badge.ACTIVE { background: #eefdee; color: #11D411; border: 1px solid #11D411; }
.status-badge.PENDING { background: #fff8ee; color: #f39c12; border: 1px solid #f39c12; }
.detail-btn { background: #f1f3f5; border: 1px solid #dee2e6; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; }

.pagination-wrapper { margin-top: auto; padding-top: 30px; }
.pagination { display: flex; justify-content: center; gap: 5px; }
.page, .arrow { min-width: 32px; height: 32px; border-radius: 6px; border: 1px solid #eee; background: transparent; cursor: pointer; }
.page.active { background: #11D411; color: #fff; border-color: #11D411; }
</style>