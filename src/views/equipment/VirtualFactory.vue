<template>
  <div class="virtual-factory">
    <div class="header">
      <h1>虚拟工厂管理系统</h1>
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
          'background-color': getWorkshopColor(device.workshop)
        }"
          @mousedown="startDrag(device, $event)"
      >
        <div class="device-info">
          <h3>{{ device.name }}</h3>
          <p>车间: {{ getWorkshopName(device.workshop) }}</p>
          <p>状态: {{ device.status }}</p>
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
      { id: 'device1', name: '数控机床', workshop: 'workshop1', status: '运行中',
        position: { x: 100, y: 150 }, defaultPosition: { x: 100, y: 150 } },
      { id: 'device2', name: '激光切割机', workshop: 'workshop1', status: '待机',
        position: { x: 300, y: 150 }, defaultPosition: { x: 300, y: 150 } },
      { id: 'device3', name: '3D打印机', workshop: 'workshop2', status: '运行中',
        position: { x: 100, y: 350 }, defaultPosition: { x: 100, y: 350 } },
      { id: 'device4', name: '注塑机', workshop: 'workshop2', status: '维修中',
        position: { x: 300, y: 350 }, defaultPosition: { x: 300, y: 350 } },
      { id: 'device5', name: '装配机器人', workshop: 'workshop3', status: '运行中',
        position: { x: 100, y: 550 }, defaultPosition: { x: 100, y: 550 } },
      { id: 'device6', name: '包装机', workshop: 'workshop3', status: '待机',
        position: { x: 300, y: 550 }, defaultPosition: { x: 300, y: 550 } }
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
        workshop1: '#ffcccc',
        workshop2: '#ccffcc',
        workshop3: '#ccccff',
      }
      return colors[workshopId] || '#dddddd'
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
      switchWorkshop,
      getWorkshopName,
      getWorkshopColor,
      toggleEditMode,
      startDrag,
      saveLayout,
      resetLayout
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
  padding: 15px;
  text-align: center;
}

.header h1 {
  margin: 0;
  font-size: 24px;
}

.workshop-tabs {
  display: flex;
  justify-content: center;
  margin: 15px 0;
}

.workshop-tabs button {
  padding: 8px 15px;
  margin: 0 5px;
  border: none;
  border-radius: 4px;
  background-color: #34495e;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.workshop-tabs button:hover {
  background-color: #3d566e;
}

.workshop-tabs button.active {
  background-color: #1abc9c;
}

.control-buttons {
  margin-top: 10px;
}

.control-buttons button {
  padding: 8px 15px;
  margin: 0 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
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
  width: 180px;
  height: 120px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  cursor: default;
  transition: transform 0.2s, box-shadow 0.2s;
  z-index: 1;
}

.device-card.draggable {
  cursor: move;
}

.device-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 2;
}

.device-card.workshop-highlight {
  box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.5);
}

.device-info {
  padding: 10px;
  color: #333;
}

.device-info h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-info p {
  margin: 3px 0;
  font-size: 12px;
}
</style>
