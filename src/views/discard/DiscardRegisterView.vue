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
          <label for="lot-select">LOT 선택</label>
          <select id="lot-select" v-model="form.lotId" @change="onLotChange">
            <option value="" disabled>폐기할 LOT을 선택하세요</option>
            <option v-for="lot in availableLots" :key="lot.lotId" :value="lot.lotId">
              {{ lot.lotId }} ({{ lot.itemName }})
            </option>
          </select>
        </div>

        <div class="field">
          <label for="item-name">품목명</label>
          <input id="item-name" type="text" :value="selectedLot?.itemName" disabled placeholder="LOT을 선택하면 자동으로 입력됩니다"/>
        </div>

        <div class="field">
          <label for="discard-quantity">폐기 수량</label>
          <input id="discard-quantity" type="number" v-model.number="form.quantity" placeholder="폐기할 수량을 입력하세요"/>
          <p v-if="selectedLot" class="field-desc">
            현재 재고: {{ selectedLot.quantity }}
          </p>
        </div>

        <div class="field">
          <label for="discard-reason">폐기 사유</label>
          <select id="discard-reason" v-model="form.reason">
            <option value="" disabled>사유를 선택하세요</option>
            <option value="DAMAGE">파손</option>
            <option value="EXPIRATION">유통기한 만료</option>
            <option value="OTHER">기타</option>
          </select>
        </div>

        <div class="field full-width">
          <label for="reason-detail">상세 사유</label>
          <textarea id="reason-detail" v-model="form.reasonDetail" placeholder="상세 사유를 입력하세요 (선택)"></textarea>
        </div>

        <div class="field full-width">
          <label for="file-upload">사진 첨부 (선택)</label>
          <input id="file-upload" type="file" @change="onFileChange"/>
        </div>
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
import http from '@/api/axios';
import BaseButton from '@/components/button/BaseButton.vue';

const router = useRouter();

const form = reactive({
  lotId: '',
  quantity: null,
  reason: '',
  reasonDetail: '',
  file: null,
});

const availableLots = ref([]);

const selectedLot = computed(() => {
  return availableLots.value.find(lot => lot.lotId === form.lotId);
});

const onLotChange = () => {
  if (selectedLot.value) {
    form.quantity = selectedLot.value.quantity; // Set max quantity initially
  }
};

const onFileChange = (e) => {
  form.file = e.target.files[0] || null;
};

const fetchAvailableLots = async () => {
  // This is a mock implementation.
  // In a real application, you would fetch this from your backend.
  // e.g., await http.get('/lots?status=ACTIVE');
  availableLots.value = Array.from({ length: 5 }, (_, i) => ({
    lotId: `LOT-${202401 + i}`,
    itemName: `품목 ${i + 1}`,
    quantity: Math.floor(Math.random() * 50) + 10,
  }));
};

const submit = async () => {
  if (!form.lotId) {
    alert('LOT을 선택해주세요.');
    return;
  }
  if (!form.quantity || form.quantity <= 0) {
    alert('폐기 수량을 1 이상으로 입력해주세요.');
    return;
  }
  if (selectedLot.value && form.quantity > selectedLot.value.quantity) {
    alert('폐기 수량은 현재 재고를 초과할 수 없습니다.');
    return;
  }
  if (!form.reason) {
    alert('폐기 사유를 선택해주세요.');
    return;
  }

  const formData = new FormData();
  formData.append('lotId', form.lotId);
  formData.append('quantity', form.quantity);
  formData.append('reason', form.reason);
  formData.append('reasonDetail', form.reasonDetail);
  if (form.file) {
    formData.append('file', form.file);
  }

  try {
    // In a real application, you would post to your backend.
    // await http.post('/discards', formData);
    
    // Mock success
    console.log('Submitting discard registration:', {
      lotId: form.lotId,
      quantity: form.quantity,
      reason: form.reason,
      reasonDetail: form.reasonDetail,
      fileName: form.file?.name,
    });
    alert('폐기 등록이 완료되었습니다.');
    
    // I will assume there's a list view for discards
    // For now, navigate back or to a relevant list page
    router.push({ name: 'adminLotList' }); // Redirecting to lot list for now

  } catch (error) {
    console.error('폐기 등록 실패:', error);
    alert('폐기 등록 중 오류가 발생했습니다.');
  }
};

onMounted(() => {
  fetchAvailableLots();
});
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
  gap: 20px 24px;
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
