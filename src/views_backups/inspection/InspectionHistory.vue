<template>
  <div class="inspection-history">
    <h2>设备点检历史数据</h2>
    <div class="filter-container">
      <div class="filter-group">
        <label>设备选择:</label>
        <select v-model="selectedEquipment">
          <option value="">全部设备</option>
          <option v-for="item in equipmentOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label>日期范围:</label>
        <input type="date" v-model="startDate">
        <span>至</span>
        <input type="date" v-model="endDate">
      </div>
      <button @click="filterHistory">筛选</button>
    </div>

    <div class="history-table">
      <table>
        <thead>
        <tr>
          <th>序号</th>
          <th>设备名称</th>
          <th>点检时间</th>
          <th>点检人</th>
          <th>点检结果</th>
          <th>备注</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in filteredHistory" :key="item.id">
          <td>{{ index + 1 }}</td>
          <td>{{ item.equipmentName }}</td>
          <td>{{ formatDate(item.inspectionTime) }}</td>
          <td>{{ item.inspector }}</td>
          <td :class="getStatusClass(item.status)">{{ getStatusText(item.status) }}</td>
          <td>{{ item.remark }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const inspectionHistory = ref([
  { id: 1, equipmentId: 1, equipmentName: '设备A', inspectionTime: '2023-05-10T09:00:00', inspector: '张三', status: 'normal', remark: '无异常' },
  { id: 2, equipmentId: 2, equipmentName: '设备B', inspectionTime: '2023-05-09T14:30:00', inspector: '李四', status: 'abnormal', remark: '参数异常' },
  { id: 3, equipmentId: 1, equipmentName: '设备A', inspectionTime: '2023-05-08T10:15:00', inspector: '王五', status: 'debug', remark: '调试后正常' },
  { id: 4, equipmentId: 3, equipmentName: '设备C', inspectionTime: '2023-05-07T16:45:00', inspector: '赵六', status: 'normal', remark: '' },
  { id: 5, equipmentId: 4, equipmentName: '设备D', inspectionTime: '2023-05-06T11:20:00', inspector: '张三', status: 'not-inspected', remark: '未点检' },
]);

const equipmentOptions = ref([
  { value: 1, label: '设备A' },
  { value: 2, label: '设备B' },
  { value: 3, label: '设备C' },
  { value: 4, label: '设备D' },
]);

const selectedEquipment = ref('');
const startDate = ref('');
const endDate = ref('');

const filteredHistory = computed(() => {
  let result = [...inspectionHistory.value];

  if (selectedEquipment.value) {
    result = result.filter(item => item.equipmentId === selectedEquipment.value);
  }

  if (startDate.value) {
    result = result.filter(item => new Date(item.inspectionTime) >= new Date(startDate.value));
  }

  if (endDate.value) {
    result = result.filter(item => new Date(item.inspectionTime) <= new Date(endDate.value + 'T23:59:59'));
  }

  return result.sort((a, b) => new Date(b.inspectionTime) - new Date(a.inspectionTime));
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
};

const padZero = (num) => {
  return num < 10 ? `0${num}` : num;
};

const getStatusClass = (status) => {
  return {
    normal: 'status-normal',
    abnormal: 'status-abnormal',
    debug: 'status-debug',
    'not-inspected': 'status-not-inspected',
  }[status];
};

const getStatusText = (status) => {
  return {
    normal: '正常',
    abnormal: '异常',
    debug: '调试通过',
    'not-inspected': '未点检',
  }[status];
};

const filterHistory = () => {
  // 筛选逻辑已在计算属性中实现
};
</script>

<style scoped>
.inspection-history {
  padding: 20px;
}
.filter-container {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
}
.filter-group {
  display: flex;
  align-items: center;
  gap: 5px;
}
.history-table {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}
th {
  background-color: #f2f2f2;
}
.status-normal {
  background-color: #c8e6c9;
}
.status-abnormal {
  background-color: #ffcdd2;
}
.status-debug {
  background-color: #fff9c4;
}
.status-not-inspected {
  background-color: #ffffff;
}
</style>
