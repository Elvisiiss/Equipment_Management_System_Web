<template>
  <div class="inspection-management">
    <h2>点巡检管理</h2>
    <el-tabs v-model="activeTab" class="management-tabs">
      <el-tab-pane label="点检任务" name="tasks">
        <el-table :data="inspectionTasks" height="400" style="width: 100%">
          <el-table-column prop="device" label="设备名称" width="180" />
          <el-table-column prop="type" label="点检类型" width="120" />
          <el-table-column prop="planDate" label="计划日期" width="120" />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="inspector" label="负责人" width="120" />
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button type="primary" size="small" v-if="row.status === '待执行'">开始点检</el-button>
              <el-button type="info" size="small" v-else>查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="点检计划" name="plans">
        <div class="plan-actions">
          <el-button type="primary" icon="Plus">新增计划</el-button>
          <el-button type="success" icon="Refresh">刷新</el-button>
        </div>
        <el-table :data="inspectionPlans" height="400" style="width: 100%">
          <el-table-column prop="name" label="计划名称" width="200" />
          <el-table-column prop="cycle" label="执行周期" width="120" />
          <el-table-column prop="lastDate" label="上次执行" width="180" />
          <el-table-column prop="nextDate" label="下次执行" width="180" />
          <el-table-column prop="devices" label="涉及设备" width="200">
            <template #default="{ row }">
              <el-tag v-for="device in row.devices" :key="device" size="small" class="device-tag">
                {{ device }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default>
              <el-button type="primary" size="small" icon="Edit"></el-button>
              <el-button type="danger" size="small" icon="Delete"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('tasks')

const inspectionTasks = [
  { id: 1, device: 'CNC-001', type: '日常点检', planDate: '2023-06-15', status: '待执行', inspector: '张三' },
  { id: 2, device: '注塑机-002', type: '定期点检', planDate: '2023-06-16', status: '进行中', inspector: '李四' },
  { id: 3, device: '组装线-005', type: '日常点检', planDate: '2023-06-14', status: '已完成', inspector: '王五' },
  { id: 4, device: '包装机-003', type: '专项点检', planDate: '2023-06-17', status: '待执行', inspector: '赵六' },
  { id: 5, device: '测试设备-008', type: '定期点检', planDate: '2023-06-18', status: '待执行', inspector: '钱七' }
]

const inspectionPlans = [
  { id: 1, name: '日常设备点检计划', cycle: '每日', lastDate: '2023-06-14', nextDate: '2023-06-15', devices: ['CNC-001', 'CNC-002', '组装线-005'] },
  { id: 2, name: '周度设备保养计划', cycle: '每周', lastDate: '2023-06-12', nextDate: '2023-06-19', devices: ['注塑机-002', '包装机-003'] },
  { id: 3, name: '月度设备全面检查', cycle: '每月', lastDate: '2023-05-20', nextDate: '2023-06-20', devices: ['CNC-001', '注塑机-002', '组装线-005', '包装机-003'] }
]

const statusTagType = (status) => {
  switch (status) {
    case '待执行': return 'warning'
    case '进行中': return 'primary'
    case '已完成': return 'success'
    default: return 'info'
  }
}
</script>

<style scoped>
.inspection-management {
  padding: 20px;
}

.management-tabs {
  margin-top: 20px;
}

.plan-actions {
  margin-bottom: 15px;
}

.device-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}
</style>
