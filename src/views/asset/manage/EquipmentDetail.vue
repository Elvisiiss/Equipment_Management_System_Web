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
        <el-button type="primary" @click="openTransferDialog">转移</el-button>
        <el-button @click="openIdleDialog">闲置</el-button>
        <el-button type="danger" @click="openScrapDialog">报废</el-button>
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
            <el-descriptions-item label="资产编码">{{ device.assetCode }}</el-descriptions-item>
            <el-descriptions-item label="设备编码">{{ device.code }}</el-descriptions-item>
            <el-descriptions-item label="设备名称">{{ device.name }}</el-descriptions-item>
            <el-descriptions-item label="设备类别">{{ device.category }}</el-descriptions-item>
            <el-descriptions-item label="型号">{{ device.model }}</el-descriptions-item>
            <el-descriptions-item label="车间">{{ device.workshop }}</el-descriptions-item>
            <el-descriptions-item label="产线">{{ device.line }}</el-descriptions-item>
            <el-descriptions-item label="工段">{{ device.section }}</el-descriptions-item>
            <el-descriptions-item label="责任人">{{ device.owner }}</el-descriptions-item>
            <el-descriptions-item label="厂商">{{ device.vendor }}</el-descriptions-item>
            <el-descriptions-item label="进场日期">{{ device.inDate }}</el-descriptions-item>
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
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="spareCode" label="备件编码" />
        <el-table-column prop="spareName" label="备件名称" />
        <el-table-column prop="usage" label="用量" width="80" />
        <el-table-column prop="stock" label="库存数量" width="100" />
        <el-table-column prop="areaName" label="区域名称" />
      </el-table>
    </el-card>

    <!-- 第四行：模治具清单 -->
    <el-card class="full-width-card" header="模治具清单">
      <el-table :data="mouldList" stripe style="width:100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="mouldCode" label="模具编码" />
        <el-table-column prop="mouldName" label="模具名称" />
        <el-table-column prop="usage" label="用量" width="80" />
        <el-table-column prop="stock" label="库存数量" width="100" />
        <el-table-column prop="productModel" label="产品型号" />
        <el-table-column prop="areaName" label="区域名称" />
      </el-table>
    </el-card>

    <!-- 第五行：生命周期履历 -->
    <el-card class="full-width-card" header="设备全生命周期履历">
      <el-table :data="lifeCycleList" stripe style="width:100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="stage" label="阶段" />
        <el-table-column prop="submitter" label="提交人" />
        <el-table-column prop="submitTime" label="提交时间" sortable />
        <el-table-column prop="approver" label="审批人" />
        <el-table-column prop="approveTime" label="审批时间" sortable />
        <el-table-column prop="remark" label="备注" />
        <el-table-column prop="areaName" label="区域名称" />
      </el-table>
    </el-card>

    <!-- 第六行：点检任务 -->
    <el-card class="full-width-card" header="今日点检任务">
      <div style="margin-bottom:8px">
        <el-button @click="refreshCheck">刷新</el-button>
        <el-button @click="goToInspectionList">详情</el-button>
      </div>
      <el-table v-if="checkList.length" :data="checkList" stripe style="width:100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="time" label="时间" />
        <el-table-column prop="content" label="点检内容" />
        <el-table-column prop="checker" label="点检人" />
        <el-table-column prop="period" label="时段" />
        <el-table-column prop="status" label="状态">
          <template #default="{row}">
            <el-tag :type="row.status==='已执行'?'success':'warning'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="areaName" label="区域名称" />
      </el-table>
      <div v-else>今日无点检计划</div>
    </el-card>

    <!-- 第七行：保养信息 -->
    <el-card class="full-width-card" header="今日保养信息">
      <div style="margin-bottom:8px">
        <el-button @click="refreshMaintain">刷新</el-button>
        <el-button @click="goToMaintenanceList">详情</el-button>
      </div>
      <el-table v-if="maintainList.length" :data="maintainList" stripe style="width:100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="date" label="日期" />
        <el-table-column prop="content" label="保养内容" />
        <el-table-column prop="maintainer" label="保养人" />
        <el-table-column prop="status" label="状态">
          <template #default="{row}">
            <el-tag type="success">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="areaName" label="区域名称" />
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
        <el-form-item label="附件">
          <el-upload
              v-model:file-list="acceptForm.attachments"
              multiple
              :limit="5"
              :before-upload="beforeUpload"
          >
            <el-button type="primary">上传文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持上传图片、Word、PDF文件，单个文件不超过10MB</div>
            </template>
          </el-upload>
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
          <el-cascader
              v-model="transferForm.targetArea"
              :options="areaOptions"
              :props="cascaderProps"
              placeholder="请选择目标区域"
              clearable
              style="width:100%"
          />
        </el-form-item>
        <el-form-item label="转移原因">
          <el-input type="textarea" v-model="transferForm.reason" />
        </el-form-item>
        <el-form-item label="附件">
          <el-upload
              v-model:file-list="transferForm.attachments"
              multiple
              :limit="5"
              :before-upload="beforeUpload"
          >
            <el-button type="primary">上传文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持上传图片、Word、PDF文件，单个文件不超过10MB</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="transferVisible=false">取消</el-button>
        <el-button type="primary" @click="submitTransfer">提交</el-button>
      </template>
    </el-dialog>

    <!-- 闲置弹窗 -->
    <el-dialog v-model="idleVisible" title="闲置申请" width="600">
      <el-form>
        <el-form-item label="申请说明">
          <el-input type="textarea" v-model="idleForm.description" rows="4" />
        </el-form-item>
        <el-form-item label="附件">
          <el-upload
              v-model:file-list="idleForm.attachments"
              multiple
              :limit="5"
              :before-upload="beforeUpload"
          >
            <el-button type="primary">上传文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持上传图片、Word、PDF文件，单个文件不超过10MB</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="idleVisible=false">取消</el-button>
        <el-button type="primary" @click="submitIdle">提交</el-button>
      </template>
    </el-dialog>

    <!-- 报废弹窗 -->
    <el-dialog v-model="scrapVisible" title="报废申请" width="600">
      <el-form>
        <el-form-item label="申请说明">
          <el-input type="textarea" v-model="scrapForm.description" rows="4" />
        </el-form-item>
        <el-form-item label="附件">
          <el-upload
              v-model:file-list="scrapForm.attachments"
              multiple
              :limit="5"
              :before-upload="beforeUpload"
          >
            <el-button type="primary">上传文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持上传图片、Word、PDF文件，单个文件不超过10MB</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scrapVisible=false">取消</el-button>
        <el-button type="primary" @click="submitScrap">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import vueQr from 'vue-qr/src/packages/vue-qr.vue'
import html2canvas from 'html2canvas'
import { ElMessage } from 'element-plus'
import { Document, Picture } from '@element-plus/icons-vue'

const router = useRouter()

/* 查询条件 */
const query = reactive({
  workshop: 'C4车间',
  code: 'C4-51-12'
})

/* 设备对象 */
const device = reactive({
  imageUrl: 'https://via.placeholder.com/300x180?text=C4-51-12',
  status: '待机',
  assetCode: 'ASSET-2023-001',
  code: '',
  name: '',
  workshop: '',
  line: '',
  category: '',
  model: '',
  vendor: '',
  inDate: '',
  owner: '',
  section: '',
  qrText: ''
})

/* 表格数据 */
const bomList = ref([])
const mouldList = ref([])
const lifeCycleList = ref([])
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
  date: '',
  attachments: []
})

/* 转移弹窗 */
const transferVisible = ref(false)
const transferForm = reactive({
  targetArea: [],
  reason: '',
  attachments: []
})

/* 闲置弹窗 */
const idleVisible = ref(false)
const idleForm = reactive({
  description: '',
  attachments: []
})

/* 报废弹窗 */
const scrapVisible = ref(false)
const scrapForm = reactive({
  description: '',
  attachments: []
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

/* 区域映射表 */
const areaMap = {
  1: 'C2车间',
  2: 'C2车间31产线',
  3: 'C2车间31产线CFOG段',
  4: 'C2车间31产线贴合段',
  5: 'C2车间31产线组装段',
  6: 'C2车间31产线30米线段',
  7: 'C2车间32产线',
  8: 'C2车间32产线CFOG段',
  9: 'C2车间32产线贴合段',
  10: 'C2车间32产线组装段',
  11: 'C2车间32产线30米线段',
  12: 'C2车间33产线',
  13: 'C2车间33产线CFOG段',
  14: 'C2车间33产线贴合段',
  15: 'C2车间33产线组装段',
  16: 'C2车间33产线30米线段',
  17: 'C2车间34产线',
  18: 'C2车间34产线CFOG段',
  19: 'C2车间34产线贴合段',
  20: 'C2车间34产线组装段',
  21: 'C2车间34产线30米线段',
  22: 'C2车间35产线',
  23: 'C2车间35产线CFOG段',
  24: 'C2车间35产线贴合段',
  25: 'C2车间35产线组装段',
  26: 'C2车间35产线30米线段',
  27: 'C2车间36产线',
  28: 'C2车间36产线CFOG段',
  29: 'C2车间36产线贴合段',
  30: 'C2车间36产线组装段',
  31: 'C2车间36产线30米线段',
  32: 'C3车间',
  33: 'C3车间41产线',
  34: 'C3车间41产线CFOG段',
  35: 'C3车间41产线贴合段',
  36: 'C3车间41产线组装段',
  37: 'C3车间41产线30米线段',
  38: 'C4车间',
  39: 'C4车间51产线',
  40: 'C4车间51产线CFOG段',
  41: 'C4车间51产线贴合段',
  42: 'C4车间51产线组装段',
  43: 'C4车间51产线30米线段',
  44: 'C5车间',
  45: 'C5车间61产线',
  46: 'C5车间61产线CFOG段',
  47: 'C5车间61产线贴合段',
  48: 'C5车间61产线组装段',
  49: 'C5车间61产线30米线段',
  50: 'C6车间',
  51: 'C6车间71产线',
  52: 'C6车间71产线CFOG段',
  53: 'C6车间71产线贴合段',
  54: 'C6车间71产线组装段',
  55: 'C6车间71产线30米线段'
}

/* 区域级联选择器选项 */
const areaOptions = [
  {
    value: 'C2',
    label: 'C2车间',
    children: Array.from({ length: 6 }, (_, i) => ({
      value: `31${i+1}`,
      label: `3${i+1}产线`,
      children: [
        { value: 'CFOG段', label: 'CFOG段' },
        { value: '贴合段', label: '贴合段' },
        { value: '组装段', label: '组装段' },
        { value: '30米线', label: '30米线' }
      ]
    }))
  },
  {
    value: 'C3',
    label: 'C3车间',
    children: Array.from({ length: 6 }, (_, i) => ({
      value: `41${i+1}`,
      label: `4${i+1}产线`,
      children: [
        { value: 'CFOG段', label: 'CFOG段' },
        { value: '贴合段', label: '贴合段' },
        { value: '组装段', label: '组装段' },
        { value: '30米线', label: '30米线' }
      ]
    }))
  },
  {
    value: 'C4',
    label: 'C4车间',
    children: Array.from({ length: 6 }, (_, i) => ({
      value: `51${i+1}`,
      label: `5${i+1}产线`,
      children: [
        { value: 'CFOG段', label: 'CFOG段' },
        { value: '贴合段', label: '贴合段' },
        { value: '组装段', label: '组装段' },
        { value: '30米线', label: '30米线' }
      ]
    }))
  },
  {
    value: 'C5',
    label: 'C5车间',
    children: Array.from({ length: 6 }, (_, i) => ({
      value: `61${i+1}`,
      label: `6${i+1}产线`,
      children: [
        { value: 'CFOG段', label: 'CFOG段' },
        { value: '贴合段', label: '贴合段' },
        { value: '组装段', label: '组装段' },
        { value: '30米线', label: '30米线' }
      ]
    }))
  },
  {
    value: 'C6',
    label: 'C6车间',
    children: Array.from({ length: 6 }, (_, i) => ({
      value: `71${i+1}`,
      label: `7${i+1}产线`,
      children: [
        { value: 'CFOG段', label: 'CFOG段' },
        { value: '贴合段', label: '贴合段' },
        { value: '组装段', label: '组装段' },
        { value: '30米线', label: '30米线' }
      ]
    }))
  }
]

const cascaderProps = {
  expandTrigger: 'hover'
}

/* 搜索设备 */
function searchDevice () {
  loadDeviceDetail(query.code)
}

/* 加载详情（mock） */
function loadDeviceDetail (code) {
  Object.assign(device, {
    code,
    assetCode: `ASSET-${code}`,
    name: '盖板全自动设备',
    workshop: 'C4车间',
    line: '51产线',
    category: '清洗机',
    model: '深圳序佑盖板全自动',
    vendor: '序佑',
    inDate: '2023-04-12',
    owner: '李工',
    section: 'CFOG段',
    status: '待机',
    qrText: `http://asset.example.com/device/${code}`
  })

  // 模拟设备转移后的区域变化
  const currentAreaId = device.status === '转移中' ? 42 : 40

  bomList.value = [
    { areaId: currentAreaId, spareCode: 'SP001', spareName: '电机', usage: 2, stock: 15 },
    { areaId: currentAreaId, spareCode: 'SP002', spareName: '轴承', usage: 4, stock: 32 }
  ].map(item => ({
    ...item,
    areaName: areaMap[item.areaId] || `未知区域(${item.areaId})`
  }))

  mouldList.value = [
    { areaId: currentAreaId, mouldCode: 'M001', mouldName: '上模', usage: 1, stock: 8, productModel: 'P-1001' },
    { areaId: currentAreaId, mouldCode: 'M002', mouldName: '下模', usage: 1, stock: 6, productModel: 'P-1002' }
  ].map(item => ({
    ...item,
    areaName: areaMap[item.areaId] || `未知区域(${item.areaId})`
  }))

  lifeCycleList.value = [
    { stage: '入库', areaId: 38, submitter: '张采购', submitTime: '2025-08-12 09:00',
      approver: '王经理', approveTime: '2025-08-12 10:00', remark: '新购入库' },
    { stage: '验收阶段', areaId: currentAreaId, submitter: '李工', submitTime: '2023-04-12 10:30',
      approver: '王经理', approveTime: '2023-04-12 11:30', remark: '验收合格' }
  ].map(item => ({
    ...item,
    areaName: areaMap[item.areaId] || `未知区域(${item.areaId})`
  }))

  checkList.value = [
    { time: '08:00-08:30', areaId: currentAreaId, content: '检查电机温度', checker: '刘工', period: '早班', status: '待执行' }
  ].map(item => ({
    ...item,
    areaName: areaMap[item.areaId] || `未知区域(${item.areaId})`
  }))

  maintainList.value = [
    { date: '2023-06-15', areaId: currentAreaId, content: '润滑保养', maintainer: '王技师', status: '已保养' }
  ].map(item => ({
    ...item,
    areaName: areaMap[item.areaId] || `未知区域(${item.areaId})`
  }))
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
    date: today,
    attachments: []
  })
  acceptVisible.value = true
}
function openTransferDialog () {
  transferForm.targetArea = []
  transferForm.reason = ''
  transferForm.attachments = []
  transferVisible.value = true
}
function openIdleDialog() {
  idleForm.description = ''
  idleForm.attachments = []
  idleVisible.value = true
}
function openScrapDialog() {
  scrapForm.description = ''
  scrapForm.attachments = []
  scrapVisible.value = true
}

/* 文件上传处理 */
function beforeUpload(file) {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf']
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!validTypes.includes(file.type)) {
    ElMessage.error('只能上传图片、Word或PDF文件!')
    return false
  }

  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!')
    return false
  }

  return true
}

/* 跳转到详情页面 */
function goToRepairList() {
  router.push('/repair/manage/KnowledgeBase')
}
function goToInspectionList() {
  router.push('/inspection/manage/TaskList')
}
function goToMaintenanceList() {
  router.push('/maintenance/manage/ApprovalList')
}

/* 提交事件 */
function submitAccept () {
  createAuditTask('验收任务', {
    attachments: acceptForm.attachments
  })
  acceptVisible.value = false
}
function submitTransfer () {
  device.status = '转移中'
  createAuditTask('转移申请', {
    targetArea: transferForm.targetArea.join(' > '),
    attachments: transferForm.attachments
  })
  // 刷新设备详情以更新区域信息
  loadDeviceDetail(device.code)
  transferVisible.value = false
}
function submitIdle() {
  device.status = '闲置'
  createAuditTask('闲置申请', {
    description: idleForm.description,
    attachments: idleForm.attachments
  })
  idleVisible.value = false
}
function submitScrap() {
  device.status = '报废'
  createAuditTask('报废申请', {
    description: scrapForm.description,
    attachments: scrapForm.attachments
  })
  scrapVisible.value = false
}

/* 创建审核任务（本地存储模拟） */
function createAuditTask(taskName, extraData = {}) {
  const id = 'T' + Date.now()
  const list = JSON.parse(localStorage.getItem('checkTask') || '[]')

  const task = {
    id,
    deviceCode: device.code,
    deviceName: device.name,
    taskName,
    auditor: '待分配',
    auditTime: '',
    status: '待审核',
    ...extraData
  }

  list.unshift(task)
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
      { date: '2023-07-20', areaId: 40, content: '深度清洁', maintainer: '张技师', status: '已保养' }
    ].map(item => ({
      ...item,
      areaName: areaMap[item.areaId] || `未知区域(${item.areaId})`
    }))
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
.el-upload__tip {
  font-size: 12px;
  color: #606266;
  margin-top: 7px;
}
</style>
