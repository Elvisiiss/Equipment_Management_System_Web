<script setup>
import { ref, computed } from 'vue';

// 假数据
const repairRequests = ref([
  { id: 1, deviceId: 'DEV-001', reporter: '张三', reportTime: '2023-05-01 10:00', type: '硬件故障', status: '已处理', handler: '李四' },
  { id: 2, deviceId: 'DEV-002', reporter: '王五', reportTime: '2023-05-02 14:30', type: '软件故障', status: '处理中', handler: '赵六' },
  { id: 3, deviceId: 'DEV-003', reporter: '钱七', reportTime: '2023-05-03 09:15', type: '网络问题', status: '待处理', handler: '' }
]);

const knowledgeBase = ref([
  { id: 1, deviceType: '打印机', fault: '卡纸', solution: '打开后盖取出卡纸，检查是否有异物' },
  { id: 2, deviceType: '电脑', fault: '无法开机', solution: '检查电源连接，尝试更换电源线' }
]);

const newRepair = ref({
  deviceId: '',
  reporter: '',
  type: '硬件故障',
  qrCode: ''
});

const searchParams = ref({
  deviceId: '',
  type: '',
  status: ''
});

const handleQRCode = () => {
  // 模拟扫码获取设备ID
  newRepair.value.deviceId = 'DEV-' + Math.floor(100 + Math.random() * 900);
};

const submitRepair = () => {
  if (!newRepair.value.deviceId) return;

  repairRequests.value.push({
    id: repairRequests.value.length + 1,
    deviceId: newRepair.value.deviceId,
    reporter: newRepair.value.reporter || '匿名',
    reportTime: new Date().toLocaleString(),
    type: newRepair.value.type,
    status: '待处理',
    handler: ''
  });

  // 重置表单
  newRepair.value = { deviceId: '', reporter: '', type: '硬件故障', qrCode: '' };
};

const assignHandler = (id, handler) => {
  const index = repairRequests.value.findIndex(item => item.id === id);
  if (index !== -1) {
    repairRequests.value[index].handler = handler;
    repairRequests.value[index].status = '处理中';
  }
};

const completeRepair = (id) => {
  const index = repairRequests.value.findIndex(item => item.id === id);
  if (index !== -1) {
    repairRequests.value[index].status = '已处理';
  }
};

const filteredRepairs = computed(() => {
  return repairRequests.value.filter(item => {
    return (!searchParams.value.deviceId || item.deviceId.includes(searchParams.value.deviceId)) &&
        (!searchParams.value.type || item.type === searchParams.value.type) &&
        (!searchParams.value.status || item.status === searchParams.value.status);
  });
});

const exportData = () => {
  // 模拟导出数据
  alert('数据已导出(模拟)');
};
</script>

<template>
  <div class="repair-manage">
    <h2>设备报修管理</h2>
    <div class="repair-form">
      <input v-model="newRepair.deviceId" placeholder="设备编号">
      <button @click="handleQRCode">扫码获取设备ID</button>
      <input v-model="newRepair.reporter" placeholder="报修人">
      <select v-model="newRepair.type">
        <option value="硬件故障">硬件故障</option>
        <option value="软件故障">软件故障</option>
        <option value="网络问题">网络问题</option>
      </select>
      <button @click="submitRepair">提交报修</button>
    </div>

    <h2>维修看板</h2>
    <div class="dashboard">
      <div v-for="item in repairRequests" :key="item.id" class="repair-card">
        <h3>{{ item.deviceId }} - {{ item.type }}</h3>
        <p>报修人: {{ item.reporter }}</p>
        <p>时间: {{ item.reportTime }}</p>
        <p>状态: {{ item.status }}</p>
        <p v-if="item.handler">责任人: {{ item.handler }}</p>
        <div v-if="item.status === '待处理'">
          <input v-model="item.handler" placeholder="责任人">
          <button @click="assignHandler(item.id, item.handler)">分配</button>
        </div>
        <button v-if="item.status === '处理中'" @click="completeRepair(item.id)">完成维修</button>
      </div>
    </div>

    <h2>维修记录查询</h2>
    <div class="search-section">
      <input v-model="searchParams.deviceId" placeholder="设备编号">
      <select v-model="searchParams.type">
        <option value="">所有类型</option>
        <option value="硬件故障">硬件故障</option>
        <option value="软件故障">软件故障</option>
        <option value="网络问题">网络问题</option>
      </select>
      <select v-model="searchParams.status">
        <option value="">所有状态</option>
        <option value="待处理">待处理</option>
        <option value="处理中">处理中</option>
        <option value="已处理">已处理</option>
      </select>
      <button @click="exportData">导出数据</button>
    </div>
    <table>
      <thead>
      <tr>
        <th>设备编号</th>
        <th>报修人</th>
        <th>报修时间</th>
        <th>报修类型</th>
        <th>状态</th>
        <th>责任人</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in filteredRepairs" :key="item.id">
        <td>{{ item.deviceId }}</td>
        <td>{{ item.reporter }}</td>
        <td>{{ item.reportTime }}</td>
        <td>{{ item.type }}</td>
        <td>{{ item.status }}</td>
        <td>{{ item.handler }}</td>
      </tr>
      </tbody>
    </table>

    <h2>故障知识库</h2>
    <div class="knowledge-base">
      <div v-for="item in knowledgeBase" :key="item.id" class="knowledge-card">
        <h3>{{ item.deviceType }} - {{ item.fault }}</h3>
        <p>{{ item.solution }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.repair-manage {
  padding: 20px;
}
.repair-form, .search-section {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}
.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}
.repair-card, .knowledge-card {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 5px;
}
.knowledge-base {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
th {
  background-color: #f2f2f2;
}
</style>
