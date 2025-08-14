<template>
  <div class="device-detail">
    <!-- 第一行：查询条件 + 功能按钮 + 说明书/图纸 -->
    <el-row justify="space-between" align="middle" class="top-bar">
      <!-- 查询 -->
      <el-col :span="8">
        <el-form inline>
          <el-form-item label="车间">
            <el-select v-model="query.workshop" placeholder="全部车间" clearable>
              <el-option label="C4车间" value="C4车间" />
            </el-select>
          </el-form-item>
          <el-form-item label="设备编码">
            <el-input v-model="query.code" placeholder="请输入设备编码" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchDevice">查询</el-button>
          </el-form-item>
        </el-form>
      </el-col>

      <!-- 功能按钮 -->
      <el-col :span="8" style="text-align:center">
        <el-button type="success" @click="openAcceptDialog">验收</el-button>
        <el-button type="warning" @click="openRepairDialog">维修</el-button>
        <el-button type="primary" @click="openTransferDialog">转移</el-button>
        <el-button @click="setIdle">闲置</el-button>
        <el-button type="danger" @click="setScrap">报废</el-button>
      </el-col>

      <!-- 说明书/图纸 -->
      <el-col :span="8" style="text-align:right">
        <el-button circle @click="showDoc('manual')">
          <el-icon :size="18"><Document /></el-icon>
        </el-button>
        <span style="margin-right:12px">设备说明书</span>

        <el-button circle @click="showDoc('drawing')">
          <el-icon :size="18"><Picture /></el-icon>
        </el-button>
        <span>设备图纸</span>
      </el-col>
    </el-row>

    <!-- 第二行：设备主信息 -->
    <el-card class="full-width-card">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <el-image
              :src="device.imageUrl"
              fit="cover"
              style="width:100%; height:180px;border-radius:6px"
          />
        </el-col>
        <el-col :span="12">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="状态">
              <el-tag :type="statusTagType">{{ device.status }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="设备编码">{{ device.code }}</el-descriptions-item>
            <el-descriptions-item label="车间">{{ device.workshop }}</el-descriptions-item>
            <el-descriptions-item label="型号">{{ device.model }}</el-descriptions-item>
            <el-descriptions-item label="厂商">{{ device.vendor }}</el-descriptions-item>
            <el-descriptions-item label="进场日期">{{ device.inDate }}</el-descriptions-item>
            <el-descriptions-item label="责任人">{{ device.owner }}</el-descriptions-item>
            <el-descriptions-item label="工站">{{ device.station }}</el-descriptions-item>
          </el-descriptions>
        </el-col>
        <el-col :span="6" style="text-align:center">
          <div ref="qrRef">
            <vue-qr :text="device.qrText" :size="160" />
          </div>
          <el-button @click="downloadQR">导出二维码</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 第三行：BOM 备件清单 -->
    <el-card class="full-width-card" header="BOM 清单（备件）">
      <el-table :data="bomList" stripe style="width:100%">
        <el-table-column prop="deviceCode" label="设备编码" />
        <el-table-column prop="deviceName" label="设备名称" />
        <el-table-column prop="areaId" label="区域ID" />
        <el-table-column prop="spareCode" label="备件编码" />
        <el-table-column prop="spareName" label="备件名称" />
      </el-table>
    </el-card>

    <!-- 第四行：模治具清单 -->
    <el-card class="full-width-card" header="模治具清单">
      <el-table :data="mouldList" stripe style="width:100%">
        <el-table-column prop="deviceCode" label="设备编码" />
        <el-table-column prop="deviceName" label="设备名称" />
        <el-table-column prop="areaId" label="区域ID" />
        <el-table-column prop="mouldCode" label="模具编码" />
        <el-table-column prop="mouldName" label="模具名称" />
      </el-table>
    </el-card>

    <!-- 第五行：生命周期履历 -->
    <el-card class="full-width-card" header="设备全生命周期履历">
      <el-table :data="lifeCycleList" stripe style="width:100%">
        <el-table-column prop="time" label="时间" sortable />
        <el-table-column prop="stage" label="阶段" />
        <el-table-column prop="areaId" label="区域ID" />
        <el-table-column prop="submitter" label="提交人" />
        <el-table-column prop="approver" label="审批人" />
        <el-table-column prop="remark" label="备注" />
      </el-table>
    </el-card>

    <!-- 第六行：维修信息 -->
    <el-card class="full-width-card" header="维修信息">
      <el-table :data="repairList" stripe style="width:100%">
        <el-table-column prop="date" label="日期" sortable />
        <el-table-column prop="problem" label="问题描述" />
        <el-table-column prop="method" label="维修方法" />
        <el-table-column prop="oldSpare" label="旧备件编码" />
        <el-table-column prop="newSpare" label="新备件编码" />
        <el-table-column prop="repairer" label="维修人" />
      </el-table>
    </el-card>

    <!-- 第七行：点检任务 -->
    <el-card class="full-width-card" header="今日点检任务">
      <div style="margin-bottom:8px">
        <el-button @click="refreshCheck">刷新</el-button>
      </div>
      <el-table v-if="checkList.length" :data="checkList" stripe style="width:100%">
        <el-table-column prop="time" label="时间" />
        <el-table-column prop="deviceCode" label="设备编码" />
        <el-table-column prop="deviceName" label="设备名称" />
        <el-table-column prop="content" label="点检内容" />
        <el-table-column prop="areaId" label="区域ID" />
        <el-table-column prop="checker" label="点检人" />
        <el-table-column prop="period" label="时段" />
        <el-table-column prop="status" label="状态">
          <template #default="{row}">
            <el-tag :type="row.status==='已执行'?'success':'warning'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div v-else>今日无点检计划</div>
    </el-card>

    <!-- 第八行：保养信息 -->
    <el-card class="full-width-card" header="今日保养信息">
      <div style="margin-bottom:8px">
        <el-button @click="refreshMaintain">刷新</el-button>
      </div>
      <el-table v-if="maintainList.length" :data="maintainList" stripe style="width:100%">
        <el-table-column prop="time" label="时间" />
        <el-table-column prop="deviceCode" label="设备编码" />
        <el-table-column prop="deviceName" label="设备名称" />
        <el-table-column prop="content" label="保养内容" />
        <el-table-column prop="areaId" label="区域ID" />
        <el-table-column prop="maintainer" label="保养人" />
        <el-table-column prop="status" label="状态">
          <template #default="{row}">
            <el-tag type="success">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div v-else>今日无保养计划</div>
    </el-card>

    <!-- 弹窗：说明书/图纸 -->
    <el-dialog
        v-model="docVisible"
        width="70%"
        :title="docTitle"
        destroy-on-close
    >
      <img v-if="docType==='drawing'" :src="docImage" style="width:100%" />
      <div v-else v-html="docContent" />
    </el-dialog>

    <!-- 验收弹窗 -->
    <el-dialog v-model="acceptVisible" title="验收" width="500">
      <el-form>
        <el-form-item label="验收结果">
          <el-radio-group v-model="acceptForm.result">
            <el-radio label="合格">合格</el-radio>
            <el-radio label="不合格">不合格</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="验收意见">
          <el-input type="textarea" v-model="acceptForm.opinion" />
        </el-form-item>
        <el-form-item label="发起人">
          <el-input v-model="acceptForm.initiator" disabled />
        </el-form-item>
        <el-form-item label="日期">
          <el-input v-model="acceptForm.date" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="acceptVisible=false">取消</el-button>
        <el-button type="primary" @click="submitAccept">提交</el-button>
      </template>
    </el-dialog>

    <!-- 转移弹窗 -->
    <el-dialog v-model="transferVisible" title="转移" width="500">
      <el-form>
        <el-form-item label="目标区域">
          <el-input v-model="transferForm.targetArea" placeholder="请输入区域ID" />
        </el-form-item>
        <el-form-item label="转移原因">
          <el-input type="textarea" v-model="transferForm.reason" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="transferVisible=false">取消</el-button>
        <el-button type="primary" @click="submitTransfer">提交</el-button>
      </template>
    </el-dialog>

    <!-- 维修弹窗 -->
    <el-dialog v-model="repairVisible" title="维修" width="600">
      <el-form>
        <el-form-item label="设备名称/编号">
          <el-input :value="`${device.model} / ${device.code}`" disabled />
        </el-form-item>
        <el-form-item label="发起人">
          <el-input :value="loginUser" disabled />
        </el-form-item>
        <el-form-item label="日期">
          <el-input :value="today" disabled />
        </el-form-item>
        <el-form-item label="故障类型">
          <el-input v-model="repairForm.faultType" />
        </el-form-item>
        <el-form-item label="故障图片">
          <el-upload
              v-model:file-list="repairForm.images"
              list-type="picture-card"
              multiple
              :limit="5"
              accept="image/*"
              :before-upload="beforeImg"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="repairVisible=false">取消</el-button>
        <el-button type="primary" @click="submitRepair">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import vueQr from 'vue-qr/src/packages/vue-qr.vue'
import html2canvas from 'html2canvas'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Picture, Plus } from '@element-plus/icons-vue'

/* 查询条件 */
const query = reactive({
  workshop: 'C4车间',
  code: 'C4-51-12'
})

/* 设备对象 */
const device = reactive({
  imageUrl: 'https://via.placeholder.com/300x180?text=C4-51-12',
  status: '待机',
  code: '',
  workshop: '',
  model: '',
  vendor: '',
  inDate: '',
  owner: '',
  station: '',
  qrText: ''
})

/* 表格数据 */
const bomList = ref([])
const mouldList = ref([])
const lifeCycleList = ref([])
const repairList = ref([])
const checkList = ref([])
const maintainList = ref([])

/* 说明书/图纸弹窗 */
const docVisible = ref(false)
const docTitle = ref('')
const docType = ref('')
const docImage = ref('')
const docContent = ref('')

/* 验收弹窗 */
const acceptVisible = ref(false)
const acceptForm = reactive({
  result: '合格',
  opinion: '',
  initiator: '',
  date: ''
})

/* 转移弹窗 */
const transferVisible = ref(false)
const transferForm = reactive({
  targetArea: '',
  reason: ''
})

/* 维修弹窗 */
const repairVisible = ref(false)
const repairForm = reactive({
  faultType: '',
  images: []
})

/* 二维码 ref */
const qrRef = ref()

/* 静态信息 */
const loginUser = 'admin'
const today = new Date().toLocaleDateString()

/* 状态 tag 颜色 */
const statusTagType = computed(() => {
  const map = { 运行中: 'success', 待机: 'info', 闲置: 'warning', 报废: 'danger' }
  return map[device.status] || ''
})

/* 搜索设备 */
function searchDevice () {
  loadDeviceDetail(query.code)
}

/* 加载详情（mock） */
function loadDeviceDetail (code) {
  Object.assign(device, {
    code,
    workshop: 'C4车间',
    model: '深圳序佑盖板全自动',
    vendor: '序佑',
    inDate: '2023-04-12',
    owner: '李工',
    station: '绑定段',
    status: '待机',
    qrText: `http://asset.example.com/device/${code}`
  })

  bomList.value = [
    { deviceCode: code, deviceName: '盖板全自动', areaId: 'A01', spareCode: 'SP001', spareName: '电机' },
    { deviceCode: code, deviceName: '盖板全自动', areaId: 'A01', spareCode: 'SP002', spareName: '轴承' }
  ]

  mouldList.value = [
    { deviceCode: code, deviceName: '盖板全自动', areaId: 'A01', mouldCode: 'M001', mouldName: '上模' },
    { deviceCode: code, deviceName: '盖板全自动', areaId: 'A01', mouldCode: 'M002', mouldName: '下模' }
  ]

  lifeCycleList.value = [
    { time: '2025-08-12 09:00', stage: '入库', areaId: 'A01', submitter: '张采购', approver: '王经理', remark: '新购入库' },
    { time: '2023-04-12 10:30', stage: '验收阶段', areaId: 'A01', submitter: '张采购', approver: '王经理', remark: '验收合格' }
  ].sort((a, b) => new Date(b.time) - new Date(a.time))

  repairList.value = [
    { date: '2025-07-28', problem: '电机异响', method: '更换电机', oldSpare: 'SP001', newSpare: 'SP001-N', repairer: '赵师傅' }
  ]

  checkList.value = [
    { time: '08:00-08:30', deviceCode: code, deviceName: '盖板全自动', content: '检查电机温度', areaId: 'A01', checker: '刘工', period: '早班', status: '待执行' }
  ]

  maintainList.value = [
    { time: '14:00-15:00', deviceCode: code, deviceName: '盖板全自动', content: '润滑保养', areaId: 'A01', maintainer: '王技师', status: '已保养' }
  ]
}

/* 说明书/图纸弹窗 */
function showDoc (type) {
  docType.value = type
  docTitle.value = type === 'manual' ? '设备说明书' : '设备图纸'
  if (type === 'drawing') {
    docImage.value = 'https://via.placeholder.com/800x600?text=Drawing'
  } else {
    docContent.value = `
      <h3>设备说明书</h3>
      <p>设备编码：${device.code}</p>
      <p>型号：${device.model}</p>
      <p>厂商：${device.vendor}</p>
    `
  }
  docVisible.value = true
}

/* 导出二维码 */
function downloadQR () {
  html2canvas(qrRef.value).then(canvas => {
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `qrcode_${device.code}.png`
    a.click()
  })
}

/* 打开弹窗 */
function openAcceptDialog () {
  Object.assign(acceptForm, {
    result: '合格',
    opinion: '',
    initiator: loginUser,
    date: today
  })
  acceptVisible.value = true
}
function openTransferDialog () {
  transferForm.targetArea = ''
  transferForm.reason = ''
  transferVisible.value = true
}
function openRepairDialog () {
  repairForm.faultType = ''
  repairForm.images = []
  repairVisible.value = true
}

/* 图片上传限制 */
function beforeImg (file) {
  const max = 2 * 1024 * 1024
  if (file.size > max) {
    ElMessage.error('图片不能大于2M')
    return false
  }
  return true
}

/* 状态变更 */
function setIdle () {
  device.status = '闲置'
  createAuditTask('闲置申请')
}
function setScrap () {
  device.status = '报废'
  createAuditTask('报废申请')
}

/* 提交事件 */
function submitAccept () {
  createAuditTask('验收任务')
  acceptVisible.value = false
}
function submitTransfer () {
  createAuditTask('转移申请')
  transferVisible.value = false
}
function submitRepair () {
  createAuditTask('维修申请')
  repairVisible.value = false
}

/* 创建审核任务（本地存储模拟） */
function createAuditTask (taskName) {
  const id = 'T' + Date.now()
  const list = JSON.parse(localStorage.getItem('checkTask') || '[]')
  list.unshift({
    id,
    deviceCode: device.code,
    deviceName: device.model,
    taskName,
    auditor: '待分配',
    auditTime: '',
    status: '待审核'
  })
  localStorage.setItem('checkTask', JSON.stringify(list))
  ElMessage.success('已提交审核任务')
}

/* 刷新点检/保养（演示用） */
function refreshCheck () {
  checkList.value.forEach(r => {
    r.status = Math.random() > 0.5 ? '已执行' : '待执行'
  })
}
function refreshMaintain () {
  if (Math.random() > 0.5) {
    maintainList.value = []
  } else {
    maintainList.value = [
      { time: '18:00-19:00', deviceCode: device.code, deviceName: '盖板全自动', content: '深度清洁', areaId: 'A01', maintainer: '张技师', status: '已保养' }
    ]
  }
}

onMounted(() => {
  loadDeviceDetail(query.code)
})
</script>

<style scoped>
.device-detail {
  padding: 16px;
  background-color: #f5f5f5;
}
.full-width-card {
  margin-bottom: 16px;
}
.top-bar {
  margin-bottom: 16px;
}
</style>
