<template>
  <div class="device-detail">
    <!-- 第一行：查询条件 + 功能按钮 + 说明书/图纸 -->
    <el-row justify="space-between" align="middle" class="top-bar">
      <!-- 查询 -->
      <el-col :span="8">
        <el-form inline>
          <el-form-item label="车间" style="width:100%">
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
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import vueQr from 'vue-qr/src/packages/vue-qr.vue'
import html2canvas from 'html2canvas'
import { ElMessage } from 'element-plus'
import { Document, Picture } from '@element-plus/icons-vue'
import { deviceAPI } from '@/api/ckAPI'

const router = useRouter()
const route = useRoute()

/* 查询条件 */
const query = reactive({
  workshop: route.query.workshop || 'C4车间', // 从URL参数获取workshop，如果没有则为默认
  code: route.query.code || 'C4-51-12' // 从URL参数获取code，如果没有则为默认
})

/* 设备对象 */
const device = reactive({
  imageUrl: '',
  status: '',
  assetCode: '',
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
  const map = { 运行中: 'success', 待机: 'info', 闲置: 'warning', 报废: 'danger', '转移中': 'primary' }
  return map[device.status] || ''
})

/* 区域级联选择器选项 - 支持选择车间、车间+产线、车间+产线+工段三级 */
const areaOptions = [
  {
    value: 'C2车间',
    label: 'C2车间',
    children: Array.from({ length: 6 }, (_, i) => ({
      value: `C2车间${31+i}产线`,
      label: `${31+i}产线`,
      children: [
        { value: `C2车间${31+i}产线CFOG段`, label: 'CFOG段' },
        { value: `C2车间${31+i}产线贴合段`, label: '贴合段' },
        { value: `C2车间${31+i}产线组装段`, label: '组装段' },
        { value: `C2车间${31+i}产线30米线`, label: '30米线' }
      ]
    }))
  },
  {
    value: 'C3车间',
    label: 'C3车间',
    children: Array.from({ length: 6 }, (_, i) => ({
      value: `C3车间${41+i}产线`,
      label: `${41+i}产线`,
      children: [
        { value: `C3车间${41+i}产线CFOG段`, label: 'CFOG段' },
        { value: `C3车间${41+i}产线贴合段`, label: '贴合段' },
        { value: `C3车间${41+i}产线组装段`, label: '组装段' },
        { value: `C3车间${41+i}产线30米线`, label: '30米线' }
      ]
    }))
  },
  {
    value: 'C4车间',
    label: 'C4车间',
    children: Array.from({ length: 6 }, (_, i) => ({
      value: `C4车间${51+i}产线`,
      label: `${51+i}产线`,
      children: [
        { value: `C4车间${51+i}产线CFOG段`, label: 'CFOG段' },
        { value: `C4车间${51+i}产线贴合段`, label: '贴合段' },
        { value: `C4车间${51+i}产线组装段`, label: '组装段' },
        { value: `C4车间${51+i}产线30米线`, label: '30米线' }
      ]
    }))
  },
  {
    value: 'C5车间',
    label: 'C5车间',
    children: Array.from({ length: 6 }, (_, i) => ({
      value: `C5车间${61+i}产线`,
      label: `${61+i}产线`,
      children: [
        { value: `C5车间${61+i}产线CFOG段`, label: 'CFOG段' },
        { value: `C5车间${61+i}产线贴合段`, label: '贴合段' },
        { value: `C5车间${61+i}产线组装段`, label: '组装段' },
        { value: `C5车间${61+i}产线30米线`, label: '30米线' }
      ]
    }))
  },
  {
    value: 'C6车间',
    label: 'C6车间',
    children: Array.from({ length: 6 }, (_, i) => ({
      value: `C6车间${71+i}产线`,
      label: `${71+i}产线`,
      children: [
        { value: `C6车间${71+i}产线CFOG段`, label: 'CFOG段' },
        { value: `C6车间${71+i}产线贴合段`, label: '贴合段' },
        { value: `C6车间${71+i}产线组装段`, label: '组装段' },
        { value: `C6车间${71+i}产线30米线`, label: '30米线' }
      ]
    }))
  }
]

const cascaderProps = {
  expandTrigger: 'hover',
  checkStrictly: true // 允许选择任意一级选项
}

/* 搜索设备 */
async function searchDevice () {
  if (!query.code) {
    ElMessage.warning('请输入设备编码')
    return
  }
  await loadDeviceDetail(query.code)
}

/* 加载详情 */
async function loadDeviceDetail (code) {
  try {
    // 获取设备基本信息
    const deviceRes = await deviceAPI.getDeviceDetail(code)
    if (deviceRes.success) {
      Object.assign(device, deviceRes.data)
    }

    // 获取设备相关列表
    const listsRes = await deviceAPI.getDeviceLists(code)
    if (listsRes.success) {
      const { bomList: bom, mouldList: mould, lifeCycleList: life, checkList: check, maintainList: maintain } = listsRes.data
      bomList.value = bom
      mouldList.value = mould
      lifeCycleList.value = life
      checkList.value = check
      maintainList.value = maintain
    }
  } catch (error) {
    ElMessage.error('加载设备信息失败')
    console.error(error)
  }
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
const beforeUpload = (file) => {
  // TODO: 文件上传需要后端的服务器，纯前端是做不到的
  const validTypes = ['image/jpeg', 'image/png', 'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf'];
  const isLt10M = file.size / 1024 / 1024 < 10;

  if (!validTypes.includes(file.type)) {
    ElMessage.error('只能上传图片、Word或PDF文件!');
    return false;
  }

  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!');
    return false;
  }

  return true;
};

/* 跳转到详情页面 */
function goToInspectionList() {
  router.push('/inspection/manage/TaskList')
}

function goToMaintenanceList() {
  router.push('/maintenance/manage/ApprovalList')
}

/* 提交事件 */
async function submitAccept() {
  try {
    const params = {
      taskType: '验收',
      taskName: '设备验收',
      deviceCode: device.code,
      deviceName: device.name,
      result: acceptForm.result,
      opinion: acceptForm.opinion,
      initiator: loginUser,
      date: today,
      attachments: acceptForm.attachments.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file.raw)
      }))
    };

    const res = await deviceAPI.submitAcceptTask(params);
    if (res.success) {
      ElMessage.success('验收申请已提交，等待审核');
      acceptVisible.value = false;
    }
  } catch (error) {
    ElMessage.error('提交失败');
    console.error(error);
  }
}

async function submitTransfer() {
  if (!transferForm.targetArea || transferForm.targetArea.length === 0) {
    ElMessage.warning('请选择目标区域');
    return;
  }

  try {
    const targetArea = transferForm.targetArea.join(' > ');
    const params = {
      taskType: '转移',
      taskName: '设备转移',
      deviceCode: device.code,
      deviceName: device.name,
      targetArea,
      reason: transferForm.reason,
      attachments: transferForm.attachments.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file.raw)
      }))
    };

    const res = await deviceAPI.submitTransferTask(params);
    if (res.success) {
      ElMessage.success('转移申请已提交，等待审核');
      transferVisible.value = false;
      await loadDeviceDetail(device.code);
    }
  } catch (error) {
    ElMessage.error('提交失败');
    console.error(error);
  }
}

async function submitIdle() {
  if (!idleForm.description) {
    ElMessage.warning('请填写申请说明')
    return
  }

  try {
    const params = {
      deviceCode: device.code,
      deviceName: device.name,
      ...idleForm
    }

    const res = await deviceAPI.submitIdleTask(params)
    if (res.success) {
      ElMessage.success('闲置申请已提交，等待审核')
      idleVisible.value = false
    }
  } catch (error) {
    ElMessage.error('提交失败')
    console.error(error)
  }
}

async function submitScrap() {
  if (!scrapForm.description) {
    ElMessage.warning('请填写申请说明')
    return
  }

  try {
    const params = {
      deviceCode: device.code,
      deviceName: device.name,
      ...scrapForm
    }

    const res = await deviceAPI.submitScrapTask(params)
    if (res.success) {
      ElMessage.success('报废申请已提交，等待审核')
      scrapVisible.value = false
    }
  } catch (error) {
    ElMessage.error('提交失败')
    console.error(error)
  }
}

/* 刷新点检/保养 */
async function refreshCheck () {
  try {
    const res = await deviceAPI.refreshCheckTasks(device.code)
    if (res.success) {
      checkList.value = res.data
      ElMessage.success('点检任务已刷新')
    }
  } catch (error) {
    ElMessage.error('刷新失败')
    console.error(error)
  }
}

async function refreshMaintain () {
  try {
    const res = await deviceAPI.refreshMaintainTasks(device.code)
    if (res.success) {
      maintainList.value = res.data
      ElMessage.success('保养信息已刷新')
    }
  } catch (error) {
    ElMessage.error('刷新失败')
    console.error(error)
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
