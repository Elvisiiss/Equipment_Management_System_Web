<template>
  <div class="virtual-factory">
    <div class="header">
<!--      <h1>虚拟工厂管理系统</h1>-->
      <div class="workshop-tabs">
        <button
            v-for="workshop in workshops"
            :key="workshop.id"
            :class="{ active: activeWorkshop === workshop.id || (workshop.id === 'all' && activeWorkshop === 'all') }"
            @click="switchWorkshop(workshop.id)"
        >
          {{ workshop.name }}
        </button>
      </div>
      <div class="control-buttons">
        <button @click="toggleEditMode" :class="{ active: isEditMode }">
          {{ isEditMode ? '退出设置' : '设置布局' }}
        </button>
        <button v-if="isEditMode" @click="saveLayout" class="save-btn">保存布局</button>
        <button v-if="isEditMode" @click="resetLayout" class="reset-btn">重置布局</button>
      </div>
    </div>

    <div class="factory-floor" ref="factoryFloor">
      <div
          v-for="device in filteredDevices"
          :key="device.id"
          class="device-card"
          :class="{ 'draggable': isEditMode, 'workshop-highlight': activeWorkshop === 'all' || device.workshop === activeWorkshop }"
          :style="{
          left: device.position.x + 'px',
          top: device.position.y + 'px',
          'border-color': getWorkshopColor(device.workshop)
        }"
          @mousedown="startDrag(device, $event)"
          @click="showDeviceDetails(device)"
      >
        <div class="device-id">{{ device.id }}</div>
        <div class="device-status" :class="'status-' + device.status"></div>
      </div>
    </div>

    <!-- 设备详情弹窗 -->
    <div v-if="selectedDevice" class="modal-overlay" @click.self="closeModal">
      <div class="device-modal">
        <div class="modal-header">
          <h2>{{ selectedDevice.name }}</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="device-image">
            <img :src="selectedDevice.image || 'https://via.placeholder.com/300x200?text=' + selectedDevice.name" alt="设备图片">
          </div>
          <div class="device-details">
            <div class="detail-row">
              <span class="detail-label">设备ID:</span>
              <span>{{ selectedDevice.id }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">所属车间:</span>
              <span>{{ getWorkshopName(selectedDevice.workshop) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">当前状态:</span>
              <span :class="'status-' + selectedDevice.status">{{ getStatusText(selectedDevice.status) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">设备类型:</span>
              <span>{{ selectedDevice.type || '通用设备' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">安装日期:</span>
              <span>{{ selectedDevice.installDate || '2023-01-01' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">负责人:</span>
              <span>{{ selectedDevice.operator || '张三' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">运行时长:</span>
              <span>{{ selectedDevice.runtime || '1500小时' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">维护记录:</span>
              <span>{{ selectedDevice.maintenance || '上次维护: 2023-05-15' }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn" @click="showMaintenanceHistory">查看维护记录</button>
          <button class="btn primary" @click="showRealTimeData">查看实时数据</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  setup() {
    // 车间数据
    const workshops = ref([
      { id: 'all', name: '全部车间' },
      { id: 'workshop1', name: '车间一' },
      { id: 'workshop2', name: '车间二' },
      { id: 'workshop3', name: '车间三' }
    ])

    // 设备数据
    const devices = ref([
      {
        id: 'C4-51-01',
        name: '数控机床',
        workshop: 'workshop1',
        status: 'running',
        type: '金属加工设备',
        installDate: '2022-03-15',
        operator: '李四',
        runtime: '2450小时',
        maintenance: '上次维护: 2023-06-20',
        position: { x: 100, y: 150 },
        defaultPosition: { x: 100, y: 150 },
        image: 'https://via.placeholder.com/300x200?text=数控机床'
      },
      {
        id: 'C4-51-02',
        name: '激光切割机',
        workshop: 'workshop1',
        status: 'idle',
        type: '切割设备',
        installDate: '2021-11-08',
        operator: '王五',
        runtime: '1890小时',
        maintenance: '上次维护: 2023-05-10',
        position: { x: 300, y: 150 },
        defaultPosition: { x: 300, y: 150 },
        image: 'https://via.placeholder.com/300x200?text=激光切割机'
      },
      {
        id: 'C4-51-03',
        name: '3D打印机',
        workshop: 'workshop2',
        status: 'running',
        type: '增材制造设备',
        installDate: '2023-01-25',
        operator: '赵六',
        runtime: '620小时',
        maintenance: '上次维护: 2023-07-01',
        position: { x: 100, y: 350 },
        defaultPosition: { x: 100, y: 350 },
        image: 'https://via.placeholder.com/300x200?text=3D打印机'
      },
      {
        id: 'C4-51-07',
        name: '注塑机',
        workshop: 'workshop2',
        status: 'maintenance',
        type: '塑料成型设备',
        installDate: '2020-09-12',
        operator: '钱七',
        runtime: '3560小时',
        maintenance: '上次维护: 2023-04-05\n计划维护: 2023-08-15',
        position: { x: 300, y: 350 },
        defaultPosition: { x: 300, y: 350 },
        image: 'https://via.placeholder.com/300x200?text=注塑机'
      },
      {
        id: 'C4-51-05',
        name: '装配机器人',
        workshop: 'workshop3',
        status: 'running',
        type: '自动化设备',
        installDate: '2022-07-30',
        operator: '孙八',
        runtime: '1980小时',
        maintenance: '上次维护: 2023-06-28',
        position: { x: 100, y: 550 },
        defaultPosition: { x: 100, y: 550 },
        image: 'https://via.placeholder.com/300x200?text=装配机器人'
      },
      {
        id: 'C4-51-08',
        name: '包装机',
        workshop: 'workshop3',
        status: 'idle',
        type: '包装设备',
        installDate: '2021-05-18',
        operator: '周九',
        runtime: '2750小时',
        maintenance: '上次维护: 2023-05-22',
        position: { x: 300, y: 550 },
        defaultPosition: { x: 300, y: 550 },
        image: 'https://via.placeholder.com/300x200?text=包装机'
      }
    ])

    // 当前激活的车间
    const activeWorkshop = ref('all')

    // 编辑模式状态
    const isEditMode = ref(false)

    // 拖动相关变量
    const isDragging = ref(false)
    const draggedDevice = ref(null)
    const dragStartX = ref(0)
    const dragStartY = ref(0)
    const deviceStartX = ref(0)
    const deviceStartY = ref(0)
    const factoryFloor = ref(null)

    // 选中的设备(用于弹窗)
    const selectedDevice = ref(null)

    // 过滤显示当前车间的设备
    const filteredDevices = computed(() => {
      if (activeWorkshop.value === 'all') {
        return devices.value
      }
      return devices.value.filter(device => device.workshop === activeWorkshop.value)
    })

    // 切换车间
    const switchWorkshop = (workshopId) => {
      activeWorkshop.value = workshopId
    }

    // 获取车间名称
    const getWorkshopName = (workshopId) => {
      const workshop = workshops.value.find(w => w.id === workshopId)
      return workshop ? workshop.name : '未知车间'
    }

    // 获取车间颜色
    const getWorkshopColor = (workshopId) => {
      const colors = {
        workshop1: '#ff6666',
        workshop2: '#66ff66',
        workshop3: '#6666ff',
      }
      return colors[workshopId] || '#666666'
    }

    // 获取状态文本
    const getStatusText = (status) => {
      const statusMap = {
        running: '运行中',
        idle: '待机',
        maintenance: '维修中',
        fault: '故障'
      }
      return statusMap[status] || status
    }

    // 切换编辑模式
    const toggleEditMode = () => {
      isEditMode.value = !isEditMode.value
      isDragging.value = false
      draggedDevice.value = null
    }

    // 开始拖动
    const startDrag = (device, event) => {
      if (!isEditMode.value) return

      isDragging.value = true
      draggedDevice.value = device
      dragStartX.value = event.clientX
      dragStartY.value = event.clientY
      deviceStartX.value = device.position.x
      deviceStartY.value = device.position.y

      document.addEventListener('mousemove', dragDevice)
      document.addEventListener('mouseup', stopDrag)

      event.preventDefault()
    }

    // 拖动设备
    const dragDevice = (event) => {
      if (!isDragging.value || !draggedDevice.value) return

      const dx = event.clientX - dragStartX.value
      const dy = event.clientY - dragStartY.value

      draggedDevice.value.position.x = deviceStartX.value + dx
      draggedDevice.value.position.y = deviceStartY.value + dy
    }

    // 停止拖动
    const stopDrag = () => {
      isDragging.value = false
      document.removeEventListener('mousemove', dragDevice)
      document.removeEventListener('mouseup', stopDrag)
    }

    // 保存布局
    const saveLayout = () => {
      // 在实际应用中，这里可以发送API请求保存到服务器
      localStorage.setItem('factoryLayout', JSON.stringify(devices.value))
      console.log('布局已保存:', devices.value)
      alert('布局保存成功！')
    }

    // 重置布局
    const resetLayout = () => {
      if (confirm('确定要重置所有设备位置吗？')) {
        devices.value.forEach(device => {
          device.position.x = device.defaultPosition.x
          device.position.y = device.defaultPosition.y
        })
      }
    }

    // 显示设备详情
    const showDeviceDetails = (device) => {
      if (isEditMode.value) return // 编辑模式下不显示详情
      selectedDevice.value = device
    }

    // 关闭弹窗
    const closeModal = () => {
      selectedDevice.value = null
    }

    // 查看维护记录
    const showMaintenanceHistory = () => {
      alert(`显示 ${selectedDevice.value.name} 的维护记录:\n${selectedDevice.value.maintenance}`)
    }

    // 查看实时数据
    const showRealTimeData = () => {
      alert(`显示 ${selectedDevice.value.name} 的实时数据\n(模拟数据: 温度: 65°C, 功率: 3.2kW, 运行速度: 1200rpm)`)
    }

    // 初始化时从本地存储加载布局
    onMounted(() => {
      const savedLayout = localStorage.getItem('factoryLayout')
      if (savedLayout) {
        try {
          const parsedLayout = JSON.parse(savedLayout)
          devices.value = parsedLayout
        } catch (e) {
          console.error('加载布局失败:', e)
        }
      }
    })

    return {
      workshops,
      devices,
      activeWorkshop,
      isEditMode,
      filteredDevices,
      factoryFloor,
      selectedDevice,
      switchWorkshop,
      getWorkshopName,
      getWorkshopColor,
      getStatusText,
      toggleEditMode,
      startDrag,
      saveLayout,
      resetLayout,
      showDeviceDetails,
      closeModal,
      showMaintenanceHistory,
      showRealTimeData
    }
  }
}
</script>

<style scoped>
.virtual-factory {
  font-family: Arial, sans-serif;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #2c3e50;
  color: white;
  padding: 15px 20px;
}

.header h1 {
  margin: 0 0 15px 0;
  font-size: 24px;
  text-align: center;
}

.header-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.workshop-tabs {
  display: flex;
  flex: 1;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.workshop-tabs::-webkit-scrollbar {
  height: 4px;
}

.workshop-tabs::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.workshop-tabs button {
  padding: 8px 12px;
  min-width: 80px;
  border: none;
  border-radius: 4px;
  background-color: #34495e;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
  white-space: nowrap;
}

.workshop-tabs button:hover {
  background-color: #3d566e;
}

.workshop-tabs button.active {
  background-color: #1abc9c;
}

.control-buttons {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.control-buttons button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.control-buttons button.active {
  background-color: #e74c3c;
  color: white;
}

.control-buttons .save-btn {
  background-color: #2ecc71;
  color: white;
}

.control-buttons .reset-btn {
  background-color: #f39c12;
  color: white;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .header-controls {
    flex-direction: column;
    gap: 10px;
  }

  .workshop-tabs {
    width: 100%;
  }

  .control-buttons {
    width: 100%;
    justify-content: flex-end;
  }
}


.factory-floor {
  flex: 1;
  position: relative;
  background-color: #f5f5f5;
  overflow: auto;
  background-image:
      linear-gradient(#ddd 1px, transparent 1px),
      linear-gradient(90deg, #ddd 1px, transparent 1px);
  background-size: 50px 50px;
}

.device-card {
  position: absolute;
  width: 100px;
  height: 100px;
  border: 3px solid;
  border-radius: 8px;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  cursor: default;
  transition: transform 0.2s, box-shadow 0.2s;
  z-index: 1;
}

.device-card.draggable {
  cursor: move;
}

.device-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  z-index: 2;
}

.device-card.workshop-highlight {
  box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.5);
}

.device-id {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.device-status {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-top: 5px;
}

/* 状态样式 */
.status-running {
  background-color: #2ecc71;
}
.status-idle {
  background-color: #3498db;
}
.status-maintenance {
  background-color: #f39c12;
}
.status-fault {
  background-color: #e74c3c;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.device-modal {
  background-color: white;
  border-radius: 8px;
  width: 80%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0 10px;
}

.close-btn:hover {
  color: #e74c3c;
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.device-image {
  text-align: center;
}

.device-image img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.device-details {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-label {
  font-weight: bold;
  color: #7f8c8d;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn.primary {
  background-color: #3498db;
  color: white;
}

.btn.primary:hover {
  background-color: #2980b9;
}

.btn:hover {
  background-color: #ecf0f1;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .modal-body {
    flex-direction: column;
  }

  .device-details {
    grid-template-columns: 1fr;
  }

  .device-modal {
    width: 95%;
  }
}
</style>
