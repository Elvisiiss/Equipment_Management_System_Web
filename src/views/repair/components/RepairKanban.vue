<template>
  <div class="repair-kanban">
    <div class="kanban-item" v-for="order in orders" :key="order.id">
      <div class="order-header">
        <span class="order-code">{{ order.code }}</span>
        <el-tag :type="priorityType[order.priority]" size="small">
          {{ order.priority }}
        </el-tag>
      </div>
      <div class="order-content">
        <div class="device-name">{{ order.deviceName }}</div>
        <div class="fault-desc">{{ order.faultDesc }}</div>
        <div class="order-info">
          <span>{{ order.reporter }}</span>
          <span>{{ order.createTime }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  orders: {
    type: Array,
    default: () => []
  }
})

const priorityType = {
  '低': 'info',
  '中': 'warning',
  '高': 'danger',
  '紧急': 'danger'
}
</script>

<style scoped>
.repair-kanban {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.kanban-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 10px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.order-code {
  font-weight: bold;
}

.device-name {
  font-size: 14px;
  margin-bottom: 5px;
}

.fault-desc {
  font-size: 12px;
  color: #aaa;
  margin-bottom: 5px;
}

.order-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}
</style>
