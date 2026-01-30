<template>
  <section class="admin-page">
    <div class="page-header">
      <p class="desc">홈 / 재고 관리 / 폐기 등록</p>
      <div class="title-wrap">
        <h2 class="page-title">폐기 등록</h2>
      </div>
    </div>

    <div class="card">
      <div class="form-grid">
        <div class="field">
          <label for="lot-id">LOT 번호</label>
          <input id="lot-id" type="text" v-model="form.lotId" placeholder="폐기할 LOT 번호를 입력하세요"/>
        </div>

        <!-- 품목명 입력란 제거 -->
        <!-- <div class="field">
          <label for="item-name">품목명</label>
          <input id="item-name" type="text" :value="selectedLot?.itemName" disabled placeholder="LOT을 선택하면 자동으로 입력됩니다"/>
        </div> -->

        <div class="field">
          <label for="discard-quantity">폐기 수량</label>
          <input id="discard-quantity" type="number" v-model.number="form.quantity" placeholder="폐기할 수량을 입력하세요"/>
          <!-- 현재 재고 설명 제거 -->
          <!-- <p v-if="selectedLot" class="field-desc">
            현재 재고: {{ selectedLot.quantity }}
          </p> -->
        </div>

        <div class="field">
          <label for="discard-reason">폐기 사유</label>
          <select id="discard-reason" v-model="form.reason">
            <option value="" disabled>사유를 선택하세요</option>
            <option value="DAMAGED">파손</option>
            <option value="EXPIRED">유통기한 만료</option>
            <option value="OTHER">기타</option>
          </select>
        </div>

        <div class="field full-width">
          <label for="reason-detail">상세 사유</label>
          <textarea id="reason-detail" v-model="form.reasonDetail" placeholder="상세 사유를 입력하세요 (선택)"></textarea>
        </div>

        <!-- 사진 첨부 필드 제거 -->
        <!-- <div class="field full-width">
          <label for="file-upload">사진 첨부 (선택)</label>
          <input id="file-upload" type="file" @change="onFileChange"/>
        </div> -->
      </div>

      <div class="actions">
        <BaseButton class="btn-secondary" @click="$router.back()">취소</BaseButton>
        <BaseButton class="btn-primary" @click="submit">폐기 등록</BaseButton>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { registerDiscard } from '@/api/DiscardApi';
// getLots는 더 이상 사용되지 않으므로 제거
// import { getLots } from '@/api/ItemApi';
import BaseButton from '@/components/button/BaseButton.vue';

const router = useRouter();

const form = reactive({
  lotId: '',
  quantity: null,
  reason: '',
  reasonDetail: '',
  // file은 더 이상 사용되지 않으므로 제거
  // file: null,
});

// availableLots, selectedLot, onLotChange, fetchAvailableLots는 더 이상 사용되지 않으므로 제거
// const availableLots = ref([]);

// const selectedLot = computed(() => {
//   return availableLots.value.find(lot => lot.lotId === form.lotId);
// });

// const onLotChange = () => {
//   if (selectedLot.value) {
//     form.quantity = selectedLot.value.quantity;
//   }
// };

// onFileChange는 더 이상 사용되지 않으므로 제거
// const onFileChange = (e) => {
//   form.file = e.target.files[0] || null;
// };

// fetchAvailableLots 함수 제거
// const fetchAvailableLots = async () => {
//   try {
//     const response = await getLots({ page: 1, size: 100 }); // Adjust page and size as needed
//     availableLots.value = response.data.content.map(lot => ({
//       lotId: lot.lotId,
//       itemName: lot.itemName,
//       quantity: lot.quantity,
//     }));
//   } catch (error) {
//     console.error('Error fetching available lots:', error);
//     alert('사용 가능한 LOT 목록을 불러오는 데 실패했습니다.');
//   }
// };

const submit = async () => {
  if (!form.lotId) {
    alert('LOT 번호를 입력해주세요.');
    return;
  }
  if (!form.quantity || form.quantity <= 0) {
    alert('폐기 수량을 1 이상으로 입력해주세요.');
    return;
  }
  // 현재 재고를 초과할 수 없다는 검증은 LOT 선택 드롭다운이 없으므로 제거
  // if (selectedLot.value && form.quantity > selectedLot.value.quantity) {
  //   alert('폐기 수량은 현재 재고를 초과할 수 없습니다.');
  //   return;
  // }
  if (!form.reason) {
    alert('폐기 사유를 선택해주세요.');
    return;
  }

  // DiscardItemRequest 객체 생성
  const discardItemRequest = {
    lotNo: form.lotId,
    quantity: form.quantity,
    discardStatus: form.reason,
    description: form.reasonDetail,
  };

  try {
    await registerDiscard(discardItemRequest);
    alert('폐기 등록이 완료되었습니다.');
    router.push({ name: 'adminDiscardList' }); // Redirect to discard list
  } catch (error) {
    console.error('폐기 등록 실패:', error);
    alert('폐기 등록 중 오류가 발생했습니다.');
  }
};

// onMounted에서 fetchAvailableLots 호출 제거
// onMounted(() => {
//   fetchAvailableLots();
// });
</script>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.desc {
  font-size: 13px;
  color: #6b7280;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #111827;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px 32px; /* Increased column gap */
}

.form-grid .field:not(.full-width) input,
.form-grid .field:not(.full-width) select {
  max-width: 300px; /* Apply max-width to inputs/selects in non-full-width fields */
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field.full-width {
  grid-column: span 2;
}

label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

input, select, textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background-color: #fff;
}

input:disabled {
  background-color: #f3f4f6;
  color: #6b7280;
}

textarea {
  min-height: 120px;
  resize: vertical;
}

.field-desc {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

input[type="file"] {
  padding: 8px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-primary {
  background: #ef4444;
  color: #fff;
  font-weight: 600;
}

.btn-secondary {
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
  font-weight: 600;
}
</style>
