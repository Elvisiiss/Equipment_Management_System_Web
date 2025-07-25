<template>
  <div class="factory-management">
    <el-container>
      <!-- 顶部标题栏 -->
      <el-header class="header">
        <div class="title-container">
          <h1><i class="el-icon-factory"></i> 车间设备人员管理系统</h1>
          <div class="action-buttons">
            <el-button type="primary" icon="el-icon-refresh">刷新数据</el-button>
            <el-button type="success" icon="el-icon-download">导出报表</el-button>
          </div>
        </div>
      </el-header>

      <el-container>
        <!-- 左侧车间/产线/设备树 -->
        <el-aside width="280px" class="sidebar">
          <div class="tree-container">
            <el-tree
                :data="factoryStructure"
                node-key="id"
                :props="treeProps"
                :default-expanded-keys="[1]"
                :highlight-current="true"
                @node-click="handleNodeClick"
                class="factory-tree"
            >
              <template #default="{ node, data }">
                <span class="tree-node">
                  <i :class="data.icon" class="node-icon"></i>
                  <span>{{ node.label }}</span>
                  <span v-if="data.type === 'line'" class="device-count">
                    ({{ getDeviceCount(data.id) }}台设备)
                  </span>
                </span>
              </template>
            </el-tree>
          </div>
        </el-aside>

        <!-- 主内容区域 -->
        <el-main class="main-content">
          <div v-if="selectedDevice" class="device-details">
            <!-- 设备基本信息 -->
            <div class="device-info">
              <h2><i class="el-icon-cpu"></i> 设备详情：{{ selectedDevice.name }}</h2>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="设备ID">{{ selectedDevice.id }}</el-descriptions-item>
                <el-descriptions-item label="设备状态">
                  <el-tag :type="selectedDevice.status === '运行中' ? 'success' : 'danger'">
                    {{ selectedDevice.status }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="所属产线">{{ selectedDevice.lineName }}</el-descriptions-item>
                <el-descriptions-item label="所属车间">{{ selectedDevice.workshopName }}</el-descriptions-item>
                <el-descriptions-item label="安装日期">2023-06-15</el-descriptions-item>
                <el-descriptions-item label="维护周期">每月一次</el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 关联人员管理 -->
            <div class="personnel-management">
              <div class="section-header">
                <h3><i class="el-icon-user"></i> 设备关联人员管理</h3>
                <el-button type="primary" icon="el-icon-plus" @click="openPersonnelDialog">添加人员</el-button>
              </div>

              <!-- 人员列表 -->
              <el-table :data="assignedPersonnel" stripe style="width: 100%">
                <el-table-column prop="name" label="姓名" width="150" />
                <el-table-column prop="position" label="职位" />
                <el-table-column prop="department" label="部门" />
                <el-table-column prop="skills" label="技能">
                  <template #default="{ row }">
                    <el-tag v-for="skill in row.skills" :key="skill" size="small" class="skill-tag">
                      {{ skill }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                  <template #default="{ row }">
                    <el-button
                        type="danger"
                        icon="el-icon-delete"
                        size="small"
                        circle
                        @click="removePersonnel(row.id)"
                    ></el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <!-- 未选择设备时的提示 -->
          <div v-else class="empty-state">
            <el-empty description="请从左侧选择一台设备进行管理">
              <i class="el-icon-s-management empty-icon"></i>
            </el-empty>
          </div>
        </el-main>
      </el-container>

      <!-- 底部状态栏 -->
      <el-footer class="footer">
        <div class="status-info">
          <span><i class="el-icon-info"></i> 系统状态：运行正常</span>
          <span>当前在线用户：3</span>
          <span>最后更新时间：{{ currentTime }}</span>
        </div>
      </el-footer>
    </el-container>

    <!-- 添加人员对话框 -->
    <el-dialog v-model="personnelDialogVisible" title="添加设备管理人员" width="600px">
      <div class="dialog-content">
        <el-transfer
            v-model="selectedPersonnel"
            :data="availablePersonnel"
            :titles="['可用人员', '已选人员']"
            :props="{ key: 'id', label: 'name' }"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="personnelDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="savePersonnel">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import {ElMessage} from 'element-plus'

// 模拟数据 - 车间
const workshops = ref([
  {id: 1, name: '一车间', icon: 'el-icon-office-building'},
  {id: 2, name: '二车间', icon: 'el-icon-office-building'},
  {id: 3, name: '三车间', icon: 'el-icon-office-building'},
  {id: 4, name: '四车间', icon: 'el-icon-office-building'},
  {id: 5, name: '五车间', icon: 'el-icon-office-building'},
  {id: 6, name: '六车间', icon: 'el-icon-office-building'}
])

// 模拟数据 - 产线
const lines = ref([
  {id: 101, workshopId: 1, name: '产线A', icon: 'el-icon-s-operation'},
  {id: 102, workshopId: 1, name: '产线B', icon: 'el-icon-s-operation'},
  {id: 103, workshopId: 1, name: '产线C', icon: 'el-icon-s-operation'},
  {id: 104, workshopId: 2, name: '产线D', icon: 'el-icon-s-operation'},
  {id: 105, workshopId: 2, name: '产线E', icon: 'el-icon-s-operation'},
  {id: 106, workshopId: 3, name: '产线F', icon: 'el-icon-s-operation'}
])

// 模拟数据 - 设备
const devices = ref([
  {id: 1001, lineId: 101, name: 'CNC机床-01', status: '运行中', personIds: [1, 3]},
  {id: 1002, lineId: 101, name: '注塑机-02', status: '待机', personIds: [2]},
  {id: 1003, lineId: 101, name: '装配机器人-03', status: '运行中', personIds: [1]},
  {id: 1004, lineId: 102, name: '激光切割机-04', status: '维护中', personIds: [4]},
  {id: 1005, lineId: 102, name: '3D打印机-05', status: '运行中', personIds: [5]},
  {id: 1006, lineId: 103, name: '检测设备-06', status: '运行中', personIds: [3]}
])

// 模拟数据 - 人员
const personnel = ref([
  {id: 1, name: '张三', position: '设备工程师', department: '技术部', skills: ['CNC', 'PLC']},
  {id: 2, name: '李四', position: '操作员', department: '生产部', skills: ['注塑']},
  {id: 3, name: '王五', position: '技术员', department: '维护部', skills: ['装配', '检测']},
  {id: 4, name: '赵六', position: '工程师', department: '技术部', skills: ['激光切割']},
  {id: 5, name: '钱七', position: '高级工程师', department: '研发部', skills: ['3D打印']},
  {id: 6, name: '孙八', position: '操作员', department: '生产部', skills: ['装配']},
  {id: 7, name: '周九', position: '技术员', department: '维护部', skills: ['检测']},
  {id: 8, name: '吴十', position: '设备工程师', department: '技术部', skills: ['PLC', 'CNC']}
])

// 当前选中的设备
const selectedDevice = ref(null)

// 工厂结构树数据
const factoryStructure = computed(() => {
  return workshops.value.map(workshop => {
    const workshopLines = lines.value
        .filter(line => line.workshopId === workshop.id)
        .map(line => {
          const lineDevices = devices.value
              .filter(device => device.lineId === line.id)
              .map(device => ({
                id: device.id,
                name: device.name,
                type: 'device',
                icon: 'el-icon-cpu'
              }))

          return {
            id: line.id,
            name: line.name,
            type: 'line',
            icon: line.icon,
            children: lineDevices
          }
        })

    return {
      id: workshop.id,
      name: workshop.name,
      type: 'workshop',
      icon: workshop.icon,
      children: workshopLines
    }
  })
})

// 树形结构配置
const treeProps = {
  label: 'name',
  children: 'children'
}

// 获取产线下的设备数量
const getDeviceCount = (lineId) => {
  return devices.value.filter(device => device.lineId === lineId).length
}

// 树节点点击事件
const handleNodeClick = (data) => {
  if (data.type === 'device') {
    const device = devices.value.find(d => d.id === data.id)
    if (device) {
      const line = lines.value.find(l => l.id === device.lineId)
      const workshop = workshops.value.find(w => w.id === line.workshopId)

      selectedDevice.value = {
        ...device,
        lineName: line.name,
        workshopName: workshop.name
      }
    }
  }
}

// 获取已分配的人员
const assignedPersonnel = computed(() => {
  if (!selectedDevice.value) return []

  const assignedIds = selectedDevice.value.personIds || []
  return personnel.value.filter(person => assignedIds.includes(person.id))
})

// 人员管理对话框相关
const personnelDialogVisible = ref(false)
const selectedPersonnel = ref([])

// 获取可用人员
const availablePersonnel = computed(() => {
  return personnel.value.map(person => ({
    key: person.id,
    label: `${person.name} (${person.position})`,
    ...person
  }))
})

// 打开人员对话框
const openPersonnelDialog = () => {
  selectedPersonnel.value = [...selectedDevice.value.personIds]
  personnelDialogVisible.value = true
}

// 保存人员分配
const savePersonnel = () => {
  if (selectedDevice.value) {
    selectedDevice.value.personIds = [...selectedPersonnel.value]
    const deviceIndex = devices.value.findIndex(d => d.id === selectedDevice.value.id)
    if (deviceIndex !== -1) {
      devices.value[deviceIndex].personIds = [...selectedPersonnel.value]
    }
    ElMessage.success('人员分配已更新')
  }
  personnelDialogVisible.value = false
}

// 移除人员
const removePersonnel = (personId) => {
  if (selectedDevice.value) {
    selectedDevice.value.personIds = selectedDevice.value.personIds.filter(id => id !== personId)
    const deviceIndex = devices.value.findIndex(d => d.id === selectedDevice.value.id)
    if (deviceIndex !== -1) {
      devices.value[deviceIndex].personIds = selectedDevice.value.personIds
    }
    ElMessage.success('人员已移除')
  }
}

// 当前时间
const currentTime = ref('')
onMounted(() => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})
</script>

<style scoped>
.factory-management {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.header {
  background: linear-gradient(135deg, #1e88e5, #0d47a1);
  color: white;
  padding: 0 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.title-container {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-container h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.title-container h1 i {
  margin-right: 10px;
  font-size: 1.8rem;
}

.sidebar {
  background-color: #fff;
  border-right: 1px solid #e6e6e6;
  height: calc(100vh - 120px);
  overflow: auto;
}

.tree-container {
  padding: 15px;
}

.factory-tree {
  background: transparent;
}

.tree-node {
  display: flex;
  align-items: center;
  width: 100%;
}

.node-icon {
  margin-right: 8px;
  font-size: 16px;
}

.device-count {
  margin-left: auto;
  font-size: 12px;
  color: #909399;
}

.main-content {
  padding: 20px;
  background-color: #f8fafc;
  height: calc(100vh - 120px);
  overflow-y: auto;
}

.device-details {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.device-info h2 {
  margin-top: 0;
  color: #1e88e5;
  display: flex;
  align-items: center;
}

.device-info h2 i {
  margin-right: 10px;
}

.personnel-management {
  margin-top: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
}

.section-header h3 i {
  margin-right: 8px;
  color: #1e88e5;
}

.skill-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.empty-state {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.empty-icon {
  font-size: 100px;
  color: #c0c4cc;
  margin-bottom: 20px;
}

.footer {
  background-color: #e3f2fd;
  color: #546e7a;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border-top: 1px solid #e0e0e0;
}

.status-info {
  display: flex;
  gap: 30px;
}

.status-info span i {
  margin-right: 5px;
}

.dialog-content {
  padding: 10px;
}

:deep(.el-transfer-panel) {
  width: 220px;
}

:deep(.el-tree-node__content) {
  height: 40px;
}
</style>
