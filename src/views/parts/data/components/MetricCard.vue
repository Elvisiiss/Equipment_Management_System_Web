<template>
  <div class="metric-card">
    <div class="card-icon" :style="{ backgroundColor: color + '20', color: color }">
      <el-icon><component :is="icon" /></el-icon>
    </div>
    <div class="card-content">
      <div class="card-title">{{ title }}</div>
      <div class="card-value">{{ value }}</div>
      <div class="card-trend" :class="trend >= 0 ? 'positive' : 'negative'">
        <el-icon><CaretTop v-if="trend >= 0" /><CaretBottom v-else /></el-icon>
        {{ Math.abs(trend) }}%
      </div>
    </div>
  </div>
</template>

<script setup>
import { CaretTop, CaretBottom } from '@element-plus/icons-vue'

defineProps({
  title: String,
  value: [String, Number],
  trend: Number,
  icon: String,
  color: String
})
</script>

<style scoped>
.metric-card {
  background: rgba(30, 40, 60, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid rgba(66, 134, 244, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  height: 100%;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #a0aec0;
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.card-trend {
  display: flex;
  align-items: center;
  font-size: 12px;
  gap: 4px;
}

.card-trend.positive {
  color: #67c23a;
}

.card-trend.negative {
  color: #f56c6c;
}
</style>
