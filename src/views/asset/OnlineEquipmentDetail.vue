<template>
  <div class="equipment-detail">
    <el-card>
      <div class="header">
        <h2>{{ equipment.name }} ({{ equipment.id }})</h2>
        <el-tag :type="equipment.onlineStatus === '在线' ? 'success' : 'danger'">
          {{ equipment.onlineStatus }}
        </el-tag>
      </div>

      <el-divider />

      <el-descriptions :column="2" border>
        <el-descriptions-item label="所属车间">{{ equipment.workshop }}</el-descriptions-item>
        <el-descriptions-item label="设备型号">{{ equipment.model }}</el-descriptions-item>
        <el-descriptions-item label="工作节拍">{{ equipment.beat }}秒/件</el-descriptions-item>
        <el-descriptions-item label="运行时间">{{ equipment.runningTime }}小时</el-descriptions-item>
        <el-descriptions-item label="最后上线时间">{{ equipment.lastOnlineTime }}</el-descriptions-item>
        <el-descriptions-item label="最后下线时间">{{ equipment.lastOfflineTime }}</el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <h3>连接设置</h3>
      <el-form :model="connectionForm" label-width="120px" style="margin-top: 20px">
        <el-form-item label="通信协议">
          <el-select v-model="connectionForm.protocol" placeholder="请选择协议">
            <el-option label="Modbus TCP" value="modbus" />
            <el-option label="OPC UA" value="opc" />
            <el-option label="Profinet" value="profinet" />
            <el-option label="EtherNet/IP" value="ethernet" />
          </el-select>
        </el-form-item>

        <el-form-item label="IP地址">
          <el-input v-model="connectionForm.ip" style="width: 200px" />
        </el-form-item>

        <el-form-item label="端口号">
          <el-input-number v-model="connectionForm.port" :min="1" :max="65535" />
        </el-form-item>

        <el-form-item label="轮询间隔(ms)">
          <el-input-number v-model="connectionForm.pollingInterval" :min="100" :max="10000" />
        </el-form-item>

        <el-form-item label="心跳检测">
          <el-switch v-model="connectionForm.heartbeat" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveConnection">保存设置</el-button>
          <el-button @click="testConnection">测试连接</el-button>
          <el-button type="danger" @click="disconnect">断开连接</el-button>
        </el-form-item>
      </el-form>

      <el-divider />

      <h3>点表管理</h3>
      <el-table :data="plcPoints" style="width: 100%; margin-top: 20px">
        <el-table-column prop="name" label="点名称" />
        <el-table-column prop="address" label="地址" width="120" />
        <el-table-column prop="dataType" label="数据类型" width="120" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="操作" width="120">
          <template #default>
            <el-button size="small" type="primary">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 设备详情数据
const equipment = ref({
  id: 'ROB015',
  name: '焊接机器人',
  workshop: '焊接车间',
  model: 'FANUC ARC-1',
  onlineStatus: '在线',
  beat: 32,
  runningTime: 245,
  lastOnlineTime: '2023-07-25 09:45:12',
  lastOfflineTime: '2023-07-24 18:30:45'
});

// 连接设置表单
const connectionForm = ref({
  protocol: 'modbus',
  ip: '192.168.1.100',
  port: 502,
  pollingInterval: 1000,
  heartbeat: true
});

// PLC点表数据
const plcPoints = ref([
  { id: 1, name: '启动信号', address: 'M100', dataType: 'Bool', description: '设备启动信号' },
  { id: 2, name: '急停状态', address: 'M101', dataType: 'Bool', description: '设备急停状态' },
  { id: 3, name: '运行电流', address: 'D100', dataType: 'Float', description: '电机运行电流' },
  { id: 4, name: '工作温度', address: 'D102', dataType: 'Float', description: '设备工作温度' },
  { id: 5, name: '故障代码', address: 'D200', dataType: 'Int16', description: '设备故障代码' },
]);

// 保存连接设置
const saveConnection = () => {
  console.log('保存连接设置:', connectionForm.value);
  ElMessage.success('连接设置已保存');
};

// 测试连接
const testConnection = () => {
  console.log('测试连接:', connectionForm.value);
  ElMessage.info('正在测试连接...');
  setTimeout(() => {
    ElMessage.success('连接测试成功');
  }, 1500);
};

// 断开连接
const disconnect = () => {
  console.log('断开连接');
  ElMessage.warning('设备连接已断开');
  equipment.value.onlineStatus = '离线';
};
</script>

<style scoped>
.equipment-detail {
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
