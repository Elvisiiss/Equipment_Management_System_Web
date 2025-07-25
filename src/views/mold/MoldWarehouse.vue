<template>
  <div class="mold-warehouse">
    <h2>模具仓库管理</h2>

    <!-- 库位管理 -->
    <div class="section">
      <h3>库位管理</h3>
      <div class="form-group">
        <label>库位ID:</label>
        <input v-model="newLocation.id" placeholder="输入库位ID">
      </div>
      <div class="form-group">
        <label>库位名称:</label>
        <input v-model="newLocation.name" placeholder="输入库位名称">
      </div>
      <button @click="addLocation">添加库位</button>

      <table>
        <thead>
        <tr>
          <th>库位ID</th>
          <th>库位名称</th>
          <th>状态</th>
          <th>模具ID</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="loc in locations" :key="loc.id">
          <td>{{ loc.id }}</td>
          <td>{{ loc.name }}</td>
          <td>{{ loc.status }}</td>
          <td>{{ loc.mold || '-' }}</td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- 出入库操作 -->
    <div class="section">
      <h3>出入库操作</h3>
      <div class="form-group">
        <label>操作类型:</label>
        <select v-model="operation.type">
          <option value="入库">入库</option>
          <option value="出库">出库</option>
        </select>
      </div>
      <div class="form-group">
        <label>模具ID:</label>
        <input v-model="operation.moldId" placeholder="输入模具ID">
      </div>
      <div class="form-group">
        <label>库位:</label>
        <select v-model="operation.location">
          <option value="">选择库位</option>
          <option v-for="loc in locations" :value="loc.id" :key="loc.id">{{ loc.name }}</option>
        </select>
      </div>
      <div class="form-group">
        <label>操作人:</label>
        <input v-model="operation.operator" placeholder="输入操作人姓名">
      </div>
      <button @click="executeOperation">执行操作</button>
    </div>

    <!-- 出入库记录 -->
    <div class="section">
      <h3>出入库记录</h3>
      <table>
        <thead>
        <tr>
          <th>记录ID</th>
          <th>模具ID</th>
          <th>操作类型</th>
          <th>库位</th>
          <th>操作人</th>
          <th>日期</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="log in warehouseLogs" :key="log.id">
          <td>{{ log.id }}</td>
          <td>{{ log.moldId }}</td>
          <td>{{ log.type }}</td>
          <td>{{ log.location }}</td>
          <td>{{ log.operator }}</td>
          <td>{{ log.date }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// 假数据
const locations = ref([
  { id: 'A-01', name: 'A区01架', status: '已占用', mold: 'M001' },
  { id: 'A-02', name: 'A区02架', status: '空闲', mold: '' },
  { id: 'B-01', name: 'B区01架', status: '已占用', mold: 'M002' }
])

const warehouseLogs = ref([
  { id: 'LOG001', moldId: 'M001', type: '入库', location: 'A-01', operator: '张三', date: '2023-05-10' },
  { id: 'LOG002', moldId: 'M002', type: '入库', location: 'B-01', operator: '李四', date: '2023-05-12' }
])

const newLocation = reactive({
  id: '',
  name: ''
})

const operation = reactive({
  type: '出库',
  moldId: '',
  location: '',
  operator: ''
})

// 方法
const addLocation = () => {
  locations.value.push({
    id: newLocation.id,
    name: newLocation.name,
    status: '空闲',
    mold: ''
  })
  Object.assign(newLocation, { id: '', name: '' })
}

const executeOperation = () => {
  if (operation.type === '入库') {
    const location = locations.value.find(l => l.id === operation.location)
    if (location && location.status === '空闲') {
      location.status = '已占用'
      location.mold = operation.moldId
      warehouseLogs.value.push({
        id: `LOG${Date.now()}`,
        moldId: operation.moldId,
        type: '入库',
        location: operation.location,
        operator: operation.operator,
        date: new Date().toISOString().split('T')[0]
      })
    }
  } else {
    const location = locations.value.find(l => l.id === operation.location)
    if (location && location.status === '已占用' && location.mold === operation.moldId) {
      location.status = '空闲'
      location.mold = ''
      warehouseLogs.value.push({
        id: `LOG${Date.now()}`,
        moldId: operation.moldId,
        type: '出库',
        location: operation.location,
        operator: operation.operator,
        date: new Date().toISOString().split('T')[0]
      })
    }
  }
  Object.assign(operation, { moldId: '', location: '', operator: '' })
}
</script>

<style scoped>
.mold-warehouse {
  padding: 20px;
}
.section {
  margin-bottom: 30px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
}
.form-group {
  margin-bottom: 10px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
}
th {
  background-color: #f2f2f2;
}
</style>
