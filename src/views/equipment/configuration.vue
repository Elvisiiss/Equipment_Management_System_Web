<!-- DeviceConfig.vue -->
<template>
  <div class="device-config">
    <!-- 顶部操作栏 -->
    <el-header class="header">
      <h2>设备监控配置</h2>
      <el-button type="primary" icon="Plus" @click="openUpload">添加设备</el-button>
    </el-header>

    <!-- 产线画布 -->
    <main ref="canvasRef" class="canvas">
      <div
          v-for="dev in devices"
          :key="dev.id"
          class="device-item"
          :style="{ left: dev.x + 'px', top: dev.y + 'px' }"
          @mousedown="startDrag(dev, $event)"
          @click="openDetail(dev)"
      >
        <img :src="dev.img" alt="设备" />
        <span>{{ dev.name }}</span>
        <i class="el-icon-close" @click.stop="removeDevice(dev.id)"></i>
      </div>
    </main>

    <!-- 设备详情抽屉 -->
    <el-drawer
        v-model="detailVisible"
        :title="activeDevice?.name"
        direction="rtl"
        size="600px"
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane label="报警" name="alarm">
          <AlarmPanel :device="activeDevice" />
        </el-tab-pane>
        <el-tab-pane label="维修" name="repair">
          <RepairPanel :device="activeDevice" />
        </el-tab-pane>
        <el-tab-pane label="保养" name="maintain">
          <MaintainPanel :device="activeDevice" />
        </el-tab-pane>
        <el-tab-pane label="资产管理" name="asset">
          <AssetPanel :device="activeDevice" />
        </el-tab-pane>
        <el-tab-pane label="数据采集" name="data">
          <DataPanel :device="activeDevice" />
        </el-tab-pane>
      </el-tabs>
    </el-drawer>

    <!-- 上传设备图片对话框 -->
    <el-dialog v-model="uploadVisible" title="添加设备" width="400px">
      <el-form :model="uploadForm" label-width="80">
        <el-form-item label="名称">
          <el-input v-model="uploadForm.name" />
        </el-form-item>
        <el-form-item label="图片">
          <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :before-upload="beforeUpload"
          >
            <img v-if="uploadForm.img" :src="uploadForm.img" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmUpload">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import AlarmPanel from '../../components/panels/AlarmPanel.vue'
// import RepairPanel from './panels/RepairPanel.vue'
// import MaintainPanel from './panels/MaintainPanel.vue'
// import AssetPanel from './panels/AssetPanel.vue'
// import DataPanel from './panels/DataPanel.vue'

/* ---------------- 设备画布 ---------------- */
const devices = reactive([
  { id: 1, name: '冲压机-01', img: '/img/device1.png', x: 100, y: 120 },
  { id: 2, name: '注塑机-02', img: '/img/device2.png', x: 300, y: 200 }
])

let dragging = null
let offset = { x: 0, y: 0 }
const canvasRef = ref(null)

function startDrag(dev, e) {
  dragging = dev
  offset = { x: e.clientX - dev.x, y: e.clientY - dev.y }
}

function onMouseMove(e) {
  if (!dragging) return
  dragging.x = e.clientX - offset.x
  dragging.y = e.clientY - offset.y
}

function onMouseUp() {
  dragging = null
}

function removeDevice(id) {
  const idx = devices.findIndex(d => d.id === id)
  devices.splice(idx, 1)
}

/* ---------------- 设备详情 ---------------- */
const detailVisible = ref(false)
const activeDevice = ref(null)
const activeTab = ref('alarm')

function openDetail(dev) {
  activeDevice.value = dev
  detailVisible.value = true
}

/* ---------------- 上传 ---------------- */
const uploadVisible = ref(false)
const uploadForm = reactive({ name: '', img: '' })

function openUpload() {
  uploadForm.name = ''
  uploadForm.img = ''
  uploadVisible.value = true
}
function beforeUpload(file) {
  const reader = new FileReader()
  reader.onload = e => (uploadForm.img = e.target.result)
  reader.readAsDataURL(file)
  return false
}
function confirmUpload() {
  if (!uploadForm.name || !uploadForm.img) {
    ElMessage.warning('请填写完整')
    return
  }
  devices.push({
    id: Date.now(),
    name: uploadForm.name,
    img: uploadForm.img,
    x: 200,
    y: 200
  })
  uploadVisible.value = false
}

/* ---------------- 事件绑定 ---------------- */
onMounted(() => {
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
})
</script>

<style scoped>
.device-config {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
}
.canvas {
  flex: 1;
  position: relative;
  background: #fafafa url('../../assets/svg.svg');
  user-select: none;
}
.device-item {
  position: absolute;
  width: 90px;
  cursor: move;
  text-align: center;
  user-select: none;
}
.device-item img {
  width: 100%;
  height: auto;
  border: 2px solid #409eff;
  border-radius: 4px;
  background: #fff;
}
.device-item span {
  display: block;
  font-size: 12px;
  margin-top: 4px;
}
.device-item i {
  position: absolute;
  top: -8px;
  right: -8px;
  cursor: pointer;
  color: #f56c6c;
  font-size: 16px;
  background: #fff;
  border-radius: 50%;
}
.avatar-uploader .avatar {
  width: 120px;
  height: 120px;
  display: block;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
}
</style>
