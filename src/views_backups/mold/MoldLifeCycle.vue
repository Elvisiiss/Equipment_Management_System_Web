<template>
  <div class="mold-lifecycle">
    <h2>模具生命周期管理</h2>

    <!-- 模具基础数据管理 -->
    <div class="section">
      <h3>模具基础数据管理</h3>
      <div class="form-group">
        <label>模具ID:</label>
        <input v-model="newMold.id" placeholder="输入模具ID">
      </div>
      <div class="form-group">
        <label>模具名称:</label>
        <input v-model="newMold.name" placeholder="输入模具名称">
      </div>
      <div class="form-group">
        <label>最大产量:</label>
        <input v-model.number="newMold.maxOutput" type="number" placeholder="输入最大产量">
      </div>
      <button @click="addMold">添加模具</button>
      <div class="import-section">
        <input type="file" @change="importMolds" accept=".csv,.xlsx">
        <button>批量导入</button>
      </div>
    </div>

    <!-- 模具寿命管理看板 -->
    <div class="section">
      <h3>模具寿命管理看板</h3>
      <table>
        <thead>
        <tr>
          <th>模具ID</th>
          <th>模具名称</th>
          <th>已生产</th>
          <th>剩余寿命</th>
          <th>上次保养</th>
          <th>下次保养</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="mold in moldList" :key="mold.id">
          <td>{{ mold.id }}</td>
          <td>{{ mold.name }}</td>
          <td>{{ mold.outputCount }}</td>
          <td>{{ remainingLife(mold) }}</td>
          <td>{{ mold.lastMaintenance }}</td>
          <td>{{ nextMaintenanceDate(mold) }}</td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- 模具状态查询 -->
    <div class="section">
      <h3>模具状态查询</h3>
      <select v-model="selectedMold">
        <option value="">选择模具</option>
        <option v-for="mold in moldList" :value="mold.id" :key="mold.id">{{ mold.name }}</option>
      </select>

      <div v-if="selectedMold" class="mold-details">
        <div v-for="mold in moldList.filter(m => m.id === selectedMold)" :key="mold.id">
          <p>状态: {{ mold.status }}</p>
          <p v-if="mold.status === '使用中'">安装设备: {{ mold.installDevice }}</p>
          <p v-if="mold.status === '使用中'">安装人: {{ mold.installer }}</p>
          <button v-if="mold.status === '库存中'" @click="showInstallForm = true">安装模具</button>
        </div>
      </div>
    </div>

    <!-- 模具安装表单 -->
    <div v-if="showInstallForm" class="modal">
      <div class="modal-content">
        <h3>模具安装</h3>
        <div class="form-group">
          <label>设备:</label>
          <input v-model="installInfo.device" placeholder="输入设备名称">
        </div>
        <div class="form-group">
          <label>安装人:</label>
          <input v-model="installInfo.installer" placeholder="输入安装人姓名">
        </div>
        <div class="form-group">
          <label>安装日期:</label>
          <input v-model="installInfo.date" type="date">
        </div>
        <button @click="installMold">确认安装</button>
        <button @click="showInstallForm = false">取消</button>
      </div>
    </div>

    <!-- 模具产品明细和部件管理 -->
    <div v-if="selectedMold" class="section">
      <div class="tab-container">
        <div class="tab">
          <h4>模具产品明细</h4>
          <ul>
            <li v-for="product in moldList.find(m => m.id === selectedMold).products" :key="product">{{ product }}</li>
          </ul>
        </div>
        <div class="tab">
          <h4>模具部件管理</h4>
          <ul>
            <li v-for="part in moldList.find(m => m.id === selectedMold).parts" :key="part">{{ part }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

// 假数据
const moldList = ref([
  { id: 'M001', name: '注塑模具A', status: '使用中', installDevice: '设备1', installer: '张三', outputCount: 1200, maxOutput: 5000, lastMaintenance: '2023-05-10', parts: ['刀具A', '刀具B'], products: ['产品X', '产品Y'] },
  { id: 'M002', name: '压铸模具B', status: '库存中', installDevice: '', installer: '', outputCount: 800, maxOutput: 3000, lastMaintenance: '2023-04-15', parts: ['刀具C'], products: ['产品Z'] }
])

const newMold = reactive({
  id: '',
  name: '',
  maxOutput: 0
})

const selectedMold = ref(null)
const showInstallForm = ref(false)
const installInfo = reactive({
  device: '',
  installer: '',
  date: ''
})

// 计算属性
const remainingLife = computed(() => {
  return (mold) => {
    return mold.maxOutput - mold.outputCount
  }
})

const nextMaintenanceDate = computed(() => {
  return (mold) => {
    const lastDate = new Date(mold.lastMaintenance)
    lastDate.setMonth(lastDate.getMonth() + 3)
    return lastDate.toISOString().split('T')[0]
  }
})

// 方法
const addMold = () => {
  moldList.value.push({
    id: newMold.id,
    name: newMold.name,
    status: '库存中',
    installDevice: '',
    installer: '',
    outputCount: 0,
    maxOutput: newMold.maxOutput,
    lastMaintenance: new Date().toISOString().split('T')[0],
    parts: [],
    products: []
  })
  Object.assign(newMold, { id: '', name: '', maxOutput: 0 })
}

const installMold = () => {
  const mold = moldList.value.find(m => m.id === selectedMold.value)
  if (mold) {
    mold.status = '使用中'
    mold.installDevice = installInfo.device
    mold.installer = installInfo.installer
    showInstallForm.value = false
    Object.assign(installInfo, { device: '', installer: '', date: '' })
  }
}

const importMolds = (event) => {
  const file = event.target.files[0]
  // 模拟导入逻辑
  console.log('导入文件:', file.name)
  alert(`模拟导入${file.name}成功`)
}
</script>

<style scoped>
.mold-lifecycle {
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
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
}
th {
  background-color: #f2f2f2;
}
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
}
.tab-container {
  display: flex;
  gap: 20px;
}
.tab {
  flex: 1;
}
</style>
