<template>
  <div class="inspection-period-setting">
    <h2>点检项目周期设置</h2>
    <div class="setting-container">
      <div class="equipment-list">
        <h3>设备列表</h3>
        <ul>
          <li
              v-for="item in equipmentList"
              :key="item.id"
              @click="selectEquipment(item)"
              :class="{ active: selectedEquipment?.id === item.id }"
          >
            {{ item.name }}
          </li>
        </ul>
      </div>

      <div class="period-setting" v-if="selectedEquipment">
        <h3>{{ selectedEquipment.name }} - 点检周期设置</h3>
        <div class="form-group">
          <label>选择周期类型:</label>
          <select v-model="selectedEquipment.period">
            <option value="daily">日</option>
            <option value="weekly">周</option>
            <option value="monthly">月</option>
            <option value="quarterly">季</option>
            <option value="half-yearly">半年</option>
            <option value="yearly">年度</option>
          </select>
        </div>
        <div class="form-group">
          <label>详细设置:</label>
          <div v-if="selectedEquipment.period === 'weekly'">
            <label v-for="day in weekDays" :key="day.value">
              <input type="checkbox" v-model="selectedEquipment.details" :value="day.value">
              {{ day.label }}
            </label>
          </div>
          <div v-else-if="selectedEquipment.period === 'monthly'">
            <input type="number" v-model="selectedEquipment.details" min="1" max="31" placeholder="输入日期(1-31)">
          </div>
          <div v-else>
            <p>无需额外设置</p>
          </div>
        </div>
        <button @click="saveSetting">保存设置</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const equipmentList = ref([
  { id: 1, name: '设备A', period: 'daily', details: [] },
  { id: 2, name: '设备B', period: 'weekly', details: [1, 3] },
  { id: 3, name: '设备C', period: 'monthly', details: 15 },
  { id: 4, name: '设备D', period: 'quarterly', details: [] },
  { id: 5, name: '设备E', period: 'half-yearly', details: [] },
]);

const selectedEquipment = ref(null);
const weekDays = [
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' },
  { value: 0, label: '周日' },
];

const selectEquipment = (item) => {
  selectedEquipment.value = { ...item };
};

const saveSetting = () => {
  const index = equipmentList.value.findIndex(e => e.id === selectedEquipment.value.id);
  if (index !== -1) {
    equipmentList.value[index] = { ...selectedEquipment.value };
    alert('设置已保存');
  }
};
</script>

<style scoped>
.inspection-period-setting {
  padding: 20px;
}
.setting-container {
  display: flex;
  gap: 20px;
}
.equipment-list {
  width: 200px;
}
.equipment-list ul {
  list-style: none;
  padding: 0;
}
.equipment-list li {
  padding: 10px;
  cursor: pointer;
  border: 1px solid #ddd;
  margin-bottom: 5px;
}
.equipment-list li.active {
  background-color: #e0f7fa;
  border-color: #4db6ac;
}
.period-setting {
  flex: 1;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
}
button {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #388e3c;
}
</style>
