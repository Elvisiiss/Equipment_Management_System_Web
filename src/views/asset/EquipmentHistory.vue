<template>
  <div class="equipment-history">
    <el-card>
      <div class="header">
        <h2>设备履历 - {{ equipment.name }} ({{ equipment.id }})</h2>
        <el-tag type="info">{{ equipment.model }}</el-tag>
      </div>

      <el-divider />

      <el-descriptions :column="3" border>
        <el-descriptions-item label="所属车间">{{ equipment.workshop }}</el-descriptions-item>
        <el-descriptions-item label="供应商">{{ equipment.vendor }}</el-descriptions-item>
        <el-descriptions-item label="批次号">{{ equipment.batchNumber }}</el-descriptions-item>
        <el-descriptions-item label="购置日期">{{ equipment.purchaseDate }}</el-descriptions-item>
        <el-descriptions-item label="使用年限">{{ equipment.serviceLife }}年</el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :type="statusTagType(equipment.status)">{{ equipment.status }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <h3>履历记录</h3>
      <el-timeline style="margin-top: 20px; padding-left: 20px">
        <el-timeline-item
            v-for="(record, index) in historyRecords"
            :key="index"
            :timestamp="record.date"
            placement="top"
        >
          <el-card>
            <h4>{{ record.type }} - {{ record.title }}</h4>
            <p>{{ record.description }}</p>
            <div class="record-footer">
              <span>操作人: {{ record.operator }}</span>
              <el-tag :type="record.result === '通过' ? 'success' : 'danger'" size="small">
                {{ record.result }}
              </el-tag>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 设备基本信息
const equipment = ref({
  id: 'CNC023',
  name: '数控机床',
  model: 'FANUC M-20iB',
  workshop: '冲压车间',
  vendor: '发那科',
  batchNumber: 'BN202307001',
  purchaseDate: '2020-05-12',
  serviceLife: 10,
  status: '运行中'
});

// 履历记录
const historyRecords = ref([
  {
    id: 1,
    type: '验收',
    title: '设备初次验收',
    date: '2020-06-01',
    operator: '张工',
    result: '通过',
    description: '设备到厂验收，各项参数符合要求，验收通过'
  },
  {
    id: 2,
    type: '维护',
    title: '季度维护保养',
    date: '2021-03-15',
    operator: '李工',
    result: '通过',
    description: '完成季度维护保养，更换润滑油，检查各部件运行状态'
  },
  {
    id: 3,
    type: '维修',
    title: '主轴故障维修',
    date: '2021-08-22',
    operator: '王工',
    result: '通过',
    description: '主轴异常振动，更换主轴轴承，修复后运行正常'
  },
  {
    id: 4,
    type: '校准',
    title: '年度精度校准',
    date: '2022-05-10',
    operator: '赵工',
    result: '通过',
    description: '年度精度校准完成，精度符合±0.01mm标准要求'
  },
  {
    id: 5,
    type: '升级',
    title: '控制系统升级',
    date: '2023-01-18',
    operator: '钱工',
    result: '通过',
    description: '控制系统升级至最新版本，优化加工算法'
  }
]);

// 状态标签类型
const statusTagType = (status) => {
  switch(status) {
    case '运行中': return 'success';
    case '待机': return 'warning';
    case '维护中': return 'info';
    default: return 'danger';
  }
}
</script>

<style scoped>
.equipment-history {
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.record-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  color: #666;
  font-size: 14px;
}
</style>
