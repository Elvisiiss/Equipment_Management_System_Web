<template>
  <div class="alert-setting">
    <h2>微信预警设置</h2>

    <div class="section">
      <h3>阈值设置</h3>
      <div v-for="(setting, key) in thresholdSettings" :key="key" class="threshold-item">
        <label>
          <input type="checkbox" v-model="setting.enabled">
          {{ key }} 阈值:
        </label>
        <input type="number" v-model.number="setting.value" :disabled="!setting.enabled">
        <span>{{ setting.unit }}</span>
      </div>
      <button @click="saveThresholdSettings">保存阈值设置</button>
    </div>

    <div class="section">
      <h3>预警接收人设置</h3>
      <div v-for="receiver in alertReceivers" :key="receiver.id" class="receiver-item">
        <label>
          <input type="checkbox" v-model="receiver.selected" @change="toggleReceiver(receiver.id)">
          {{ receiver.name }} ({{ receiver.wechatId }})
        </label>
      </div>
    </div>

    <div class="section">
      <h3>定时任务设置</h3>
      <div v-for="(task, key) in scheduledTasks" :key="key" class="task-item">
        <label>
          <input type="checkbox" v-model="task.enabled">
          检查{{ key.replace('check', '') }}:
        </label>
        <input type="number" v-model.number="task.interval" :disabled="!task.enabled">
        <span>{{ task.unit }}</span>
      </div>
      <button @click="saveScheduledTasks">保存定时任务</button>
    </div>
  </div>
</template>


<script setup>
import { ref, reactive } from 'vue'

// 假数据
const thresholdSettings = reactive({
  temperature: { value: 80, unit: '°C', enabled: true },
  humidity: { value: 70, unit: '%', enabled: false },
  pressure: { value: 100, unit: 'kPa', enabled: true }
})

const alertReceivers = ref([
  { id: 1, name: '张三', wechatId: 'zhangsan', selected: true },
  { id: 2, name: '李四', wechatId: 'lisi', selected: false },
  { id: 3, name: '王五', wechatId: 'wangwu', selected: true }
])

const scheduledTasks = reactive({
  checkTemperature: { interval: 30, unit: '分钟', enabled: true },
  checkHumidity: { interval: 60, unit: '分钟', enabled: false },
  checkPressure: { interval: 120, unit: '分钟', enabled: true }
})

// 方法
const saveThresholdSettings = () => {
  console.log('保存阈值设置:', thresholdSettings)
}

const toggleReceiver = (id) => {
  const receiver = alertReceivers.value.find(r => r.id === id)
  if (receiver) receiver.selected = !receiver.selected
}

const saveScheduledTasks = () => {
  console.log('保存定时任务:', scheduledTasks)
}
</script>

<style scoped>
.alert-setting {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
.section {
  margin-bottom: 30px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 5px;
}
.threshold-item, .receiver-item, .task-item {
  margin: 10px 0;
}
button {
  padding: 8px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}
button:hover {
  background-color: #45a049;
}
input[type="number"] {
  width: 80px;
  margin: 0 5px;
}
</style>
