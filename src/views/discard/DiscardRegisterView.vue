<template>
  <div class="admin-container">
    <div class="breadcrumb">홈 / 재고 관리 / <strong>폐기 등록</strong></div>

    <div class="list-card">
      <div class="card-header">
        <img src="@/assets/delete.svg" class="title-icon-svg" alt="discard" />
        <h3>폐기 상품 정보 입력</h3>
      </div>

      <div class="form-container">
        <div class="form-grid">
          <div class="field">
            <label>승인자 지정</label>
            <div class="search-input-wrapper readonly-wrapper">
              <img src="@/assets/search.svg" class="search-icon-svg" alt="user" />
              <input
                  type="text"
                  v-model="adminName"
                  readonly
                  class="basic-input input-readonly"
              />
            </div>
          </div>

          <div class="field">
            <label>등록 일자</label>
            <div class="date-input-wrapper">
              <input
                  type="date"
                  v-model="form.registerDate"
                  class="basic-input date-input"
              />
            </div>
          </div>

          <div class="field">
            <label for="lot-id">LOT 번호</label>
            <input
                id="lot-id"
                type="text"
                v-model="form.lotId"
                placeholder="폐기할 LOT 번호를 입력하세요"
                class="basic-input"
            />
          </div>

          <div class="field">
            <label for="discard-quantity">폐기 수량</label>
            <input
                id="discard-quantity"
                type="number"
                v-model.number="form.quantity"
                placeholder="폐기할 수량을 입력하세요"
                class="basic-input"
            />
          </div>

          <div class="field">
            <label for="discard-reason">폐기 사유</label>
            <select id="discard-reason" v-model="form.reason" class="basic-select">
              <option value="" disabled>사유를 선택하세요</option>
              <option value="DAMAGED">파손</option>
              <option value="EXPIRED">유통기한 만료</option>
              <option value="LOST">분실</option>
              <option value="POLLUTE">오염</option>
              <option value="RECALL">리콜/반품</option>
              <option value="OTHER">기타</option>
            </select>
          </div>

          <div class="field full-width">
            <label for="reason-detail">상세 사유</label>
            <textarea
                id="reason-detail"
                v-model="form.reasonDetail"
                placeholder="상세 사유를 입력하세요 (선택)"
                class="basic-textarea"
            ></textarea>
          </div>
        </div>

        <div class="actions">
          <button class="cancel-btn" @click="$router.back()">취소</button>
          <button class="submit-btn" @click="submit">폐기 등록</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { registerDiscard } from '@/api/DiscardApi';

const router = useRouter();

// 현재 로그인한 관리자 이름 (예시: localStorage나 Store에서 가져옴)
const adminName = ref(localStorage.getItem('userName') || '관리자');

const form = reactive({
  lotId: '',
  quantity: null,
  reason: '',
  reasonDetail: '',
  registerDate: new Date().toISOString().split('T')[0] // 오늘 날짜 기본값
});

const submit = async () => {
  if (!form.lotId) return alert('LOT 번호를 입력해주세요.');
  if (!form.quantity || form.quantity <= 0) return alert('폐기 수량을 입력해주세요.');
  if (!form.reason) return alert('폐기 사유를 선택해주세요.');

  const discardItemRequest = {
    lotNo: form.lotId,
    quantity: form.quantity,
    discardStatus: form.reason,
    description: form.reasonDetail,
    registerDate: form.registerDate, // 추가된 날짜 데이터
    approver: adminName.value // 추가된 승인자 데이터
  };

  try {
    await registerDiscard(discardItemRequest);
    alert('폐기 등록이 완료되었습니다.');
    router.push({ name: 'adminDiscardList' });
  } catch (error) {
    console.error('폐기 등록 실패:', error);
    alert('폐기 등록 중 오류가 발생했습니다.');
  }
};
</script>

<style scoped>
/* 기존 디자인 시스템 유지 */
.admin-container { padding: 20px 50px; background-color: #f8f9fb; min-height: 100vh; box-sizing: border-box; }
.breadcrumb { font-size: 14px; color: #888; margin-bottom: 25px; text-align: left; }
.list-card { background: #fff; border-radius: 20px; padding: 40px; border: 1px solid #e0e0e0; box-shadow: 0 4px 20px rgba(0,0,0,0.03); max-width: 900px; margin: 0 auto; }
.card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 35px; border-bottom: 2px solid #f8f9fb; padding-bottom: 15px; }
.card-header h3 { font-size: 18px; font-weight: 700; color: #333; margin: 0; }

.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 25px 30px; }
.field { display: flex; flex-direction: column; gap: 10px; text-align: left; }
.field.full-width { grid-column: span 2; }
.field label { font-size: 14px; font-weight: 700; color: #444; }

/* 공통 인풋 스타일 */
.basic-input, .basic-select, .basic-textarea {
  width: 100%; height: 48px; padding: 0 15px; border: 1px solid #C8E4C8;
  border-radius: 10px; background: white; font-size: 14px; outline: none; transition: all 0.2s; box-sizing: border-box;
}
.basic-textarea { height: 120px; padding: 15px; resize: none; }

/* 읽기 전용(승인자) 스타일 */
.readonly-wrapper { background-color: #f9fafb; border-radius: 10px; border: 1px solid #e5e7eb !important; }
.input-readonly { background: transparent; border: none !important; color: #888; cursor: default; }
.search-input-wrapper { display: flex; align-items: center; position: relative; }
.search-icon-svg { position: absolute; left: 15px; width: 18px; filter: opacity(0.5); }
.search-input-wrapper input { padding-left: 45px; }

/* 날짜 선택 커스텀 */
.date-input { position: relative; cursor: pointer; }
/* HTML5 date input의 캘린더 아이콘 디자인은 브라우저마다 다르므로 필요한 경우 스타일링 가능 */

.basic-input:focus, .basic-select:focus, .basic-textarea:focus {
  border-color: #11D411 !important; box-shadow: 0 0 0 3px rgba(17, 212, 17, 0.05);
}

.actions { display: flex; justify-content: center; gap: 15px; margin-top: 40px; padding-top: 30px; border-top: 1px solid #f1f3f5; }
.cancel-btn { background: #f1f3f5; color: #666; border: none; padding: 0 40px; height: 50px; border-radius: 12px; font-weight: 700; cursor: pointer; }
.submit-btn { background: #DC2626; color: #fff; border: none; padding: 0 50px; height: 50px; border-radius: 12px; font-weight: 700; cursor: pointer; }
.submit-btn:hover { background-color: #FF9494; }
.submit-btn:active { transform: scale(0.98); }
</style>