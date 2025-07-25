<template>
  <div class="asset-dashboard">
    <el-row :gutter="20">
      <!-- 车间概览 -->
      <el-col :span="8">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>车间概览</span>
            </div>
          </template>
          <el-table :data="workshops" height="250" style="width: 100%">
            <el-table-column prop="name" label="车间名称" />
            <el-table-column prop="location" label="位置" />
            <el-table-column prop="manager" label="负责人" />
          </el-table>
        </el-card>
      </el-col>

      <!-- 设备状态分布 -->
      <el-col :span="8">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>设备状态分布</span>
            </div>
          </template>
          <div class="chart-container">
            <el-statistic title="运行中设备" :value="equipmentStats.running" />
            <el-divider />
            <el-statistic title="待机设备" :value="equipmentStats.idle" />
            <el-divider />
            <el-statistic title="离线设备" :value="equipmentStats.offline" />
          </div>
        </el-card>
      </el-col>

      <!-- 厂商分布 -->
      <el-col :span="8">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>设备厂商分布</span>
            </div>
          </template>
          <el-table :data="vendors" height="250" style="width: 100%">
            <el-table-column prop="name" label="厂商名称" />
            <el-table-column prop="count" label="设备数量" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <!-- 设备型号分布 -->
      <el-col :span="12">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>设备型号TOP5</span>
            </div>
          </template>
          <el-table :data="equipmentModels" style="width: 100%">
            <el-table-column prop="model" label="型号" />
            <el-table-column prop="count" label="数量" />
            <el-table-column prop="scenario" label="适用场景" />
          </el-table>
        </el-card>
      </el-col>

      <!-- 联机设备状态 -->
      <el-col :span="12">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>联机设备状态</span>
            </div>
          </template>
          <div class="online-status">
            <el-progress
                type="dashboard"
                :percentage="onlineRate"
                :color="onlineRate > 90 ? '#67c23a' : onlineRate > 70 ? '#e6a23c' : '#f56c6c'"
            />
            <div class="status-text">
              <el-tag type="success">在线: {{ onlineEquipmentCount }}</el-tag>
              <el-tag type="danger" class="ml-10">离线: {{ offlineEquipmentCount }}</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 车间数据
const workshops = ref([
  { id: 1, name: '总装车间', location: 'A区1号楼', manager: '张工', equipmentRange: 'AGV001-AGV050' },
  { id: 2, name: '焊接车间', location: 'B区2号楼', manager: '李工', equipmentRange: 'ROB001-ROB030' },
  { id: 3, name: '涂装车间', location: 'C区3号楼', manager: '王工', equipmentRange: 'PLC001-PLC020' },
  { id: 4, name: '冲压车间', location: 'D区4号楼', manager: '赵工', equipmentRange: 'CNC001-CNC040' },
]);

// 设备状态
const equipmentStats = ref({
  total: 150,
  running: 92,
  idle: 38,
  offline: 20
});

// 厂商数据
const vendors = ref([
  { id: 1, name: '西门子', count: 45, contact: '400-800-8888' },
  { id: 2, name: '发那科', count: 32, contact: '400-700-7777' },
  { id: 3, name: 'ABB', count: 28, contact: '400-600-6666' },
  { id: 4, name: '库卡', count: 25, contact: '400-500-5555' },
]);

// 设备型号数据
const equipmentModels = ref([
  { id: 1, model: 'FANUC R-2000iC', count: 25, scenario: '重型搬运' },
  { id: 2, model: 'SIEMENS S7-1500', count: 22, scenario: 'PLC控制' },
  { id: 3, model: 'ABB IRB 6700', count: 18, scenario: '装配作业' },
  { id: 4, model: 'KUKA KR 1000', count: 15, scenario: '大型焊接' },
  { id: 5, model: 'OMRON NX102', count: 12, scenario: '精密控制' },
]);

// 联机设备状态
const onlineEquipmentCount = ref(86);
const offlineEquipmentCount = ref(14);
const onlineRate = ref(Math.round(86 / (86 + 14) * 100));
</script>

<style scoped>
.asset-dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.dashboard-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}

.chart-container {
  padding: 20px;
  text-align: center;
}

.online-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.status-text {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.mt-20 {
  margin-top: 20px;
}

.ml-10 {
  margin-left: 10px;
}
</style>
