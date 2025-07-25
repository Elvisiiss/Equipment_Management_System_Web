<template>
  <div class="dashboard-container">
    <!-- 顶部标题栏 -->
    <el-header class="dashboard-header">
      <div class="header-content">
        <h1><el-icon><Monitor /></el-icon> 工厂数据监控大屏</h1>
        <div class="header-info">
          <span><el-icon><Clock /></el-icon> {{ currentTime }}</span>
          <span><el-icon><User /></el-icon> 当前用户: 管理员</span>
        </div>
      </div>
    </el-header>

    <!-- 主内容区 -->
    <el-main class="dashboard-main">
      <!-- 第一行：概览卡片 -->
      <div class="row overview-row">
        <el-card class="overview-card">
          <div class="card-content">
            <div class="card-icon" style="background-color: #409EFF;">
              <el-icon><User /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-title">用户总数</div>
              <div class="card-value">5</div>
            </div>
          </div>
        </el-card>

        <el-card class="overview-card">
          <div class="card-content">
            <div class="card-icon" style="background-color: #67C23A;">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-title">角色数量</div>
              <div class="card-value">3</div>
            </div>
          </div>
        </el-card>

        <el-card class="overview-card">
          <div class="card-content">
            <div class="card-icon" style="background-color: #E6A23C;">
              <el-icon><OfficeBuilding /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-title">车间数量</div>
              <div class="card-value">6</div>
            </div>
          </div>
        </el-card>

        <el-card class="overview-card">
          <div class="card-content">
            <div class="card-icon" style="background-color: #F56C6C;">
              <el-icon><Cpu /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-title">设备总数</div>
              <div class="card-value">6</div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 第二行：图表和主要数据 -->
      <div class="row chart-row">
        <!-- 用户角色分布 -->
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><PieChart /></el-icon>
              <span>用户角色分布</span>
            </div>
          </template>
          <div class="chart-container">
            <div ref="roleChart" style="width: 100%; height: 300px;"></div>
          </div>
        </el-card>

        <!-- 设备状态分布 -->
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><DataLine /></el-icon>
              <span>设备状态监控</span>
            </div>
          </template>
          <div class="chart-container">
            <div ref="deviceChart" style="width: 100%; height: 300px;"></div>
          </div>
        </el-card>
      </div>

      <!-- 第三行：表格数据 -->
      <div class="row table-row">
        <!-- 用户管理表格 -->
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <el-icon><Document /></el-icon>
              <span>用户管理</span>
            </div>
          </template>
          <el-table :data="users" border style="width: 100%" height="300">
            <el-table-column prop="name" label="姓名" width="120"></el-table-column>
            <el-table-column prop="username" label="用户名"></el-table-column>
            <el-table-column prop="email" label="邮箱"></el-table-column>
            <el-table-column label="角色">
              <template #default="{row}">
                <el-tag v-for="roleId in row.roleIds" :key="roleId" :type="getRoleType(roleId)">
                  {{ getRoleName(roleId) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态">
              <template #default="{row}">
                <el-tag :type="row.status === '1' ? 'success' : 'danger'">
                  {{ row.status === '1' ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 设备管理表格 -->
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <el-icon><Cpu /></el-icon>
              <span>设备管理</span>
            </div>
          </template>
          <el-table :data="devices" border style="width: 100%" height="300">
            <el-table-column prop="name" label="设备名称" width="150"></el-table-column>
            <el-table-column prop="lineName" label="所属产线"></el-table-column>
            <el-table-column prop="workshopName" label="所属车间"></el-table-column>
            <el-table-column label="状态">
              <template #default="{row}">
                <el-tag :type="row.status === '运行中' ? 'success' : 'danger'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="关联人员">
              <template #default="{row}">
                <el-tag v-for="personId in row.personIds" :key="personId" type="info">
                  {{ getPersonName(personId) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>

      <!-- 第四行：微信相关数据 -->
      <div class="row wechat-row">
        <!-- 微信预警设置 -->
        <el-card class="wechat-card">
          <template #header>
            <div class="card-header">
              <el-icon><Bell /></el-icon>
              <span>微信预警设置</span>
            </div>
          </template>
          <div class="wechat-content">
            <div class="wechat-item">
              <span class="wechat-label">温度阈值:</span>
              <el-tag type="danger">{{ thresholdSettings.temperature.value }}°C</el-tag>
            </div>
            <div class="wechat-item">
              <span class="wechat-label">湿度阈值:</span>
              <el-tag type="warning">{{ thresholdSettings.humidity.value }}%</el-tag>
            </div>
            <div class="wechat-item">
              <span class="wechat-label">压力阈值:</span>
              <el-tag type="success">{{ thresholdSettings.pressure.value }}kPa</el-tag>
            </div>
            <div class="wechat-item">
              <span class="wechat-label">接收人数:</span>
              <el-tag>{{ alertReceivers.filter(r => r.selected).length }}人</el-tag>
            </div>
          </div>
        </el-card>

        <!-- 微信消息管理 -->
        <el-card class="wechat-card">
          <template #header>
            <div class="card-header">
              <el-icon><Message /></el-icon>
              <span>微信消息管理</span>
            </div>
          </template>
          <div class="wechat-content">
            <div class="wechat-item">
              <span class="wechat-label">启用消息类型:</span>
              <el-tag v-for="type in enabledMessageTypes" :key="type.id" type="info">
                {{ type.name }}
              </el-tag>
            </div>
            <div class="wechat-item">
              <span class="wechat-label">已匹配用户:</span>
              <el-tag>{{ matchedUsersCount }}人</el-tag>
            </div>
            <div class="wechat-item">
              <span class="wechat-label">WebHook状态:</span>
              <el-tag :type="webhookSettings.enabled ? 'success' : 'danger'">
                {{ webhookSettings.enabled ? '已启用' : '已禁用' }}
              </el-tag>
            </div>
            <div class="wechat-item">
              <span class="wechat-label">提醒类型:</span>
              <el-tag v-for="type in enabledReminderTypes" :key="type.id" type="info">
                {{ type.name }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </div>
    </el-main>

    <!-- 底部状态栏 -->
    <el-footer class="dashboard-footer">
      <div class="footer-content">
        <span><el-icon><InfoFilled /></el-icon> 系统状态: 运行正常</span>
        <span><el-icon><User /></el-icon> 当前在线用户: 3</span>
        <span><el-icon><Clock /></el-icon> 最后数据更新时间: {{ currentTime }}</span>
      </div>
    </el-footer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import * as echarts from 'echarts'
import {
  Monitor, Clock, User, UserFilled, OfficeBuilding, Cpu,
  PieChart, DataLine, Document, Bell, Message, InfoFilled
} from '@element-plus/icons-vue'

// 当前时间
const currentTime = ref('')
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 用户数据
const users = ref([
  {
    id: 1,
    name: '张三',
    username: 'zhangsan',
    email: 'zhangsan@example.com',
    roleIds: [1],
    status: '1'
  },
  {
    id: 2,
    name: '李四',
    username: 'lisi',
    email: 'lisi@example.com',
    roleIds: [2],
    status: '1'
  },
  {
    id: 3,
    name: '王五',
    username: 'wangwu',
    email: 'wangwu@example.com',
    roleIds: [3],
    status: '0'
  },
  {
    id: 4,
    name: '赵六',
    username: 'zhaoliu',
    email: 'zhaoliu@example.com',
    roleIds: [2, 3],
    status: '1'
  },
  {
    id: 5,
    name: '钱七',
    username: 'qianqi',
    email: 'qianqi@example.com',
    roleIds: [3],
    status: '1'
  }
])

// 角色数据
const roles = ref([
  { id: 1, name: '超级管理员' },
  { id: 2, name: '部门管理员' },
  { id: 3, name: '普通用户' }
])

// 车间数据
const workshops = ref([
  { id: 1, name: '一车间' },
  { id: 2, name: '二车间' },
  { id: 3, name: '三车间' },
  { id: 4, name: '四车间' },
  { id: 5, name: '五车间' },
  { id: 6, name: '六车间' }
])

// 产线数据
const lines = ref([
  { id: 101, workshopId: 1, name: '产线A' },
  { id: 102, workshopId: 1, name: '产线B' },
  { id: 103, workshopId: 1, name: '产线C' },
  { id: 104, workshopId: 2, name: '产线D' },
  { id: 105, workshopId: 2, name: '产线E' },
  { id: 106, workshopId: 3, name: '产线F' }
])

// 设备数据
const devices = ref([
  { id: 1001, lineId: 101, name: 'CNC机床-01', status: '运行中', personIds: [1, 3] },
  { id: 1002, lineId: 101, name: '注塑机-02', status: '待机', personIds: [2] },
  { id: 1003, lineId: 101, name: '装配机器人-03', status: '运行中', personIds: [1] },
  { id: 1004, lineId: 102, name: '激光切割机-04', status: '维护中', personIds: [4] },
  { id: 1005, lineId: 102, name: '3D打印机-05', status: '运行中', personIds: [5] },
  { id: 1006, lineId: 103, name: '检测设备-06', status: '运行中', personIds: [3] }
])

// 人员数据
const personnel = ref([
  { id: 1, name: '张三', position: '设备工程师' },
  { id: 2, name: '李四', position: '操作员' },
  { id: 3, name: '王五', position: '技术员' },
  { id: 4, name: '赵六', position: '工程师' },
  { id: 5, name: '钱七', position: '高级工程师' }
])

// 微信预警设置
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

// 微信消息管理
const messageTypes = ref([
  { id: 1, name: '推送消息', enabled: true },
  { id: 2, name: '日志', enabled: false },
  { id: 3, name: '通知', enabled: true }
])

const reminderTypes = ref([
  { id: 1, name: '停机', enabled: true },
  { id: 2, name: '报修', enabled: true },
  { id: 3, name: '点检', enabled: false }
])

const webhookSettings = reactive({
  groupName: '设备管理群',
  webhookUrl: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=123456',
  enabled: true
})

const usersMapping = ref([
  { id: 1, systemAccount: 'user1', wechatAccount: 'wx_user1', matched: true },
  { id: 2, systemAccount: 'user2', wechatAccount: '', matched: false },
  { id: 3, systemAccount: 'user3', wechatAccount: 'wx_user3', matched: true }
])

// 计算属性
const enabledMessageTypes = computed(() => {
  return messageTypes.value.filter(type => type.enabled)
})

const enabledReminderTypes = computed(() => {
  return reminderTypes.value.filter(type => type.enabled)
})

const matchedUsersCount = computed(() => {
  return usersMapping.value.filter(user => user.matched).length
})

// 辅助方法
const getRoleName = (roleId) => {
  const role = roles.value.find(r => r.id === roleId)
  return role ? role.name : ''
}

const getRoleType = (roleId) => {
  switch (roleId) {
    case 1: return 'success'
    case 2: return 'primary'
    case 3: return 'info'
    default: return 'default'
  }
}

const getPersonName = (personId) => {
  const person = personnel.value.find(p => p.id === personId)
  return person ? person.name : ''
}

// 图表引用
const roleChart = ref(null)
const deviceChart = ref(null)

// 初始化图表
const initCharts = () => {
  // 用户角色分布饼图
  const roleChartInstance = echarts.init(roleChart.value)
  const roleChartOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: roles.value.map(role => role.name)
    },
    series: [
      {
        name: '用户角色分布',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: roles.value.map(role => ({
          value: users.value.filter(u => u.roleIds.includes(role.id)).length,
          name: role.name
        }))
      }
    ]
  }
  roleChartInstance.setOption(roleChartOption)

  // 设备状态柱状图
  const deviceChartInstance = echarts.init(deviceChart.value)
  const deviceChartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: ['运行中', '待机', '维护中']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '设备数量',
        type: 'bar',
        data: [
          devices.value.filter(d => d.status === '运行中').length,
          devices.value.filter(d => d.status === '待机').length,
          devices.value.filter(d => d.status === '维护中').length
        ],
        itemStyle: {
          color: function(params) {
            const colorList = ['#67C23A', '#E6A23C', '#F56C6C']
            return colorList[params.dataIndex]
          }
        }
      }
    ]
  }
  deviceChartInstance.setOption(deviceChartOption)

  // 窗口大小变化时重新调整图表大小
  window.addEventListener('resize', () => {
    roleChartInstance.resize()
    deviceChartInstance.resize()
  })
}

// 处理设备数据，添加车间和产线名称
const processDevices = () => {
  devices.value.forEach(device => {
    const line = lines.value.find(l => l.id === device.lineId)
    if (line) {
      device.lineName = line.name
      const workshop = workshops.value.find(w => w.id === line.workshopId)
      if (workshop) {
        device.workshopName = workshop.name
      }
    }
  })
}

// 生命周期钩子
onMounted(() => {
  updateTime()
  setInterval(updateTime, 1000)
  processDevices()
  initCharts()
})
</script>

<style scoped>
.dashboard-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.dashboard-header {
  background: linear-gradient(135deg, #1e88e5, #0d47a1);
  color: white;
  height: 60px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-content h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.header-content h1 i {
  margin-right: 10px;
  font-size: 1.8rem;
}

.header-info {
  display: flex;
  gap: 20px;
  font-size: 14px;
}

.header-info span i {
  margin-right: 5px;
}

.dashboard-main {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.overview-row {
  height: 120px;
}

.overview-card {
  flex: 1;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  color: white;
  font-size: 24px;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.chart-row {
  height: 400px;
}

.chart-card {
  flex: 1;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
}

.card-header i {
  margin-right: 8px;
  color: #1e88e5;
}

.chart-container {
  width: 100%;
  height: calc(100% - 40px);
}

.table-row {
  height: 400px;
}

.table-card {
  flex: 1;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.wechat-row {
  height: 200px;
}

.wechat-card {
  flex: 1;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.wechat-content {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 10px;
}

.wechat-item {
  display: flex;
  align-items: center;
  min-width: 200px;
}

.wechat-label {
  margin-right: 10px;
  font-size: 14px;
  color: #606266;
}

.dashboard-footer {
  background-color: #e3f2fd;
  color: #546e7a;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border-top: 1px solid #e0e0e0;
}

.footer-content {
  display: flex;
  gap: 30px;
}

.footer-content span i {
  margin-right: 5px;
}
</style>
