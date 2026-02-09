<template>
  <div class="notification-dropdown" v-if="isOpen">
    <div class="dropdown-header">
      <h3>알림</h3>
      <button class="clear-btn" @click="$emit('clear-all')">전체 삭제</button>
    </div>
    
    <div class="notification-list" v-if="notifications.length > 0">
      <div 
        v-for="n in notifications" 
        :key="n.userNotificationId" 
        :class="['notification-item', { unread: !n.isRead }]"
        @click="$emit('read', n)"
      >
        <div class="item-icon" :class="typeClass(n.type)">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5L4 18v1h16v-1l-2-2Z" fill="currentColor" />
          </svg>
        </div>
        <div class="item-content">
          <div class="item-title">{{ n.summary }}</div>
          <div class="item-time">{{ n.receivedAt }}</div>
        </div>
        <div class="unread-dot" v-if="!n.isRead"></div>
      </div>
    </div>
    
    <div class="empty-state" v-else>
      <p>새로운 알림이 없습니다.</p>
    </div>

    <div class="dropdown-footer">
      <button class="view-all-btn" @click="$emit('view-all')">전체보기</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isOpen: Boolean,
  notifications: {
    type: Array,
    default: () => []
  }
});

defineEmits(['clear-all', 'read', 'view-all', 'close']);

const typeClass = (t) => {
  switch (t) {
    case 'SIGNUP_PENDING': return 'type-green';
    default: return 'type-gray';
  }
};
</script>

<style scoped>
.notification-dropdown {
  position: absolute;
  top: 50px;
  right: 0;
  width: 320px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  border: 1px solid #e5e7eb;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.dropdown-header {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.clear-btn {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
}

.clear-btn:hover {
  color: #ef4444;
}

.notification-list {
  max-height: 360px;
  overflow-y: auto;
}

.notification-item {
  padding: 12px 16px;
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s;
  align-items: flex-start;
  position: relative;
}

.notification-item:hover {
  background: #f9fafb;
}

.notification-item.unread {
  background: #f0fdf4;
}

.item-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.type-green {
  background: #dcfce7;
  color: #15803d;
}

.type-gray {
  background: #f3f4f6;
  color: #6b7280;
}

.item-content {
  flex: 1;
}

.item-title {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  line-height: 1.4;
  margin-bottom: 4px;
}

.item-time {
  font-size: 12px;
  color: #9ca3af;
}

.unread-dot {
  width: 6px;
  height: 6px;
  background: #22c55e;
  border-radius: 50%;
  position: absolute;
  top: 16px;
  right: 16px;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}

.dropdown-footer {
  padding: 12px;
  border-top: 1px solid #f3f4f6;
  text-align: center;
}

.view-all-btn {
  width: 100%;
  padding: 8px;
  background: none;
  border: none;
  color: #22c55e;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}

.view-all-btn:hover {
  text-decoration: underline;
}
</style>
