<template>
  <div class="detail-container">
    <!-- 第一行：查询条件 + 按钮 + 图标 -->
    <el-card class="top-card">
      <el-row :gutter="16">
        <!-- 左侧查询条件 -->
        <el-col :span="14">
          <el-form :inline="true" :model="query" class="query-form">
            <el-form-item label="模治具编码">
              <el-input v-model="query.code" placeholder="请输入" style="width: 140px" />
            </el-form-item>
            <el-form-item label="模治具名称">
              <el-input v-model="query.name" placeholder="请输入" style="width: 140px" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="getDetail">查询</el-button>
              <el-button @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>

        <!-- 右侧按钮和图标 -->
        <el-col :span="10" class="top-right">
          <div class="button-group-container">
            <el-button type="success" @click="openUseDialog" class="action-btn"
                       :disabled="isHeld || !canOperate">领用</el-button>
            <el-button type="primary" @click="handleInstall" class="action-btn"
                       :disabled="isHeld || !canOperate || !isBorrowed">安装</el-button>
            <el-button type="warning" @click="handleUninstall" class="action-btn"
                       :disabled="isHeld || !canOperate || !isInstalled">卸载</el-button>
            <el-button type="info" @click="openReturnDialog" class="action-btn"
                       :disabled="isHeld || !canOperate || !isUninstalled">归还</el-button>
            <el-button type="danger" @click="openHoldDialog" class="action-btn"
                       :disabled="isHeld">HOLD</el-button>
            <el-button type="primary" @click="handleReleaseHold" class="action-btn"
                       :disabled="!isHeld || holdType === '报废'">解除HOLD</el-button>
          </div>

          <!-- 图标 -->
          <div class="icons">
            <el-tooltip content="说明书">
              <el-button type="primary" :icon="Document" circle @click="downloadManual" :disabled="isHeld" />
            </el-tooltip>
            <el-tooltip content="图纸">
              <el-button type="primary" :icon="Picture" circle @click="openDrawingsDialog" :disabled="isHeld" />
            </el-tooltip>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 第二行：模治具信息卡片 -->
    <el-card class="info-card">
      <div class="card-header" @click="expandInfo = !expandInfo">
        <span>模治具信息</span>
        <el-icon><component :is="expandInfo ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
      </div>
      <div v-show="expandInfo">
        <el-row :gutter="16">
          <!-- 左侧图片 -->
          <el-col :span="4">
            <img class="mold-img" :src="detail.image || '@/assets/mold-placeholder.png'" alt="模治具图片" />
          </el-col>

          <!-- 中间信息 -->
          <el-col :span="16">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="状态">
                <el-tag :type="statusTagType(detail.status)">{{ detail.status }}{{ holdType ? `(${holdType})` : '' }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="模治具编码">{{ detail.code }}</el-descriptions-item>
              <el-descriptions-item label="模治具名称">{{ detail.name }}</el-descriptions-item>
              <el-descriptions-item label="类别">{{ detail.category }}</el-descriptions-item>
              <el-descriptions-item label="厂商">{{ detail.vendor }}</el-descriptions-item>
              <el-descriptions-item label="寿命上限次数">{{ detail.lifeLimit }}</el-descriptions-item>
              <el-descriptions-item label="管理">{{ detail.manager }}</el-descriptions-item>
            </el-descriptions>
          </el-col>

          <!-- 右侧二维码 -->
          <el-col :span="4" class="qr-col">
            <vue-qr :text="qrText" :size="120" class="qr-img" ref="qrRef" />
            <div class="qr-txt">{{ detail.code }}<br />{{ detail.name }}</div>
            <el-button size="small" @click="downloadQr" :disabled="isHeld">导出二维码</el-button>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 第三行：全生命周期履历 -->
    <el-card class="section-card">
      <div class="card-header" @click="expandLife = !expandLife">
        <span>全生命周期履历</span>
        <el-icon><component :is="expandLife ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
      </div>
      <div v-show="expandLife">
        <el-table :data="lifeRecords" stripe style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="stage" label="阶段" />
          <el-table-column prop="remark" label="备注" />
          <el-table-column prop="lifeLimit" label="寿命上限次数" />
          <el-table-column prop="usedTimes" label="已使用次数" />
          <el-table-column prop="borrowDate" label="领用日期" />
          <el-table-column prop="borrower" label="领用人" />
          <el-table-column prop="borrowOutManager" label="领出负责人" />
          <el-table-column prop="returnDate" label="归还日期" />
          <el-table-column prop="returner" label="归还人" />
          <el-table-column prop="returnManager" label="归还负责人" />
          <el-table-column prop="deviceName" label="设备名称" />
          <el-table-column prop="productModel" label="产品型号" />
        </el-table>
        <el-pagination
            v-model:current-page="lifePage.currentPage"
            v-model:page-size="lifePage.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="lifePage.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleLifeSizeChange"
            @current-change="handleLifeCurrentChange"
            :disabled="isHeld"
        />
      </div>
    </el-card>

    <!-- 第四行：维修信息 -->
    <el-card class="section-card">
      <div class="card-header" @click="expandRepair = !expandRepair">
        <span>维修信息</span>
        <el-icon><component :is="expandRepair ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
      </div>
      <div v-show="expandRepair">
        <el-table :data="repairRecords" stripe style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="date" label="日期" />
          <el-table-column prop="problem" label="问题描述" />
          <el-table-column prop="method" label="维修方法" />
          <el-table-column prop="repairer" label="维修人姓名" />
        </el-table>
        <el-pagination
            v-model:current-page="repairPage.currentPage"
            v-model:page-size="repairPage.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="repairPage.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleRepairSizeChange"
            @current-change="handleRepairCurrentChange"
            :disabled="isHeld"
        />
      </div>
    </el-card>

    <!-- 第五行：当日保养信息 -->
    <el-card class="section-card">
      <div class="card-header" @click="expandMaintain = !expandMaintain">
        <span>当日保养信息</span>
        <el-icon><component :is="expandMaintain ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
      </div>
      <div v-show="expandMaintain">
        <div class="maintain-header">
          <el-button icon="Refresh" @click="refreshMaintain" :disabled="isHeld">刷新</el-button>
        </div>
        <div v-if="maintainList.length === 0" class="empty">今日无保养计划</div>
        <el-table v-else :data="maintainList" stripe style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="time" label="时间" />
          <el-table-column prop="code" label="模治具编码" />
          <el-table-column prop="name" label="模治具名称" />
          <el-table-column prop="content" label="保养内容" />
          <el-table-column prop="person" label="保养人" />
          <el-table-column prop="status" label="状态" />
        </el-table>
        <el-pagination
            v-model:current-page="maintainPage.currentPage"
            v-model:page-size="maintainPage.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="maintainPage.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleMaintainSizeChange"
            @current-change="handleMaintainCurrentChange"
            :disabled="isHeld"
        />
      </div>
    </el-card>

    <!-- 领用弹窗 -->
    <el-dialog v-model="useDialogVisible" title="领用确认" width="460px">
      <el-form :inline="true" label-width="100px" class="dialog-form">
        <el-form-item label="领用人：" style="width:100%">
          <el-input v-model="loginUser" readonly />
        </el-form-item>
        <el-form-item label="领用时间：" style="width:100%">
          <el-input :value="now" readonly />
        </el-form-item>
        <el-form-item label="领用负责人：" style="width:100%">
          <el-input v-model="useManager" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="useDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmUse">确认领用</el-button>
      </template>
    </el-dialog>

    <!-- 归还弹窗 -->
    <el-dialog v-model="returnDialogVisible" title="归还确认" width="460px">
      <el-form :inline="true" label-width="100px" class="dialog-form">
        <el-form-item label="归还人：" style="width:100%">
          <el-input v-model="loginUser" readonly />
        </el-form-item>
        <el-form-item label="归还时间：" style="width:100%">
          <el-input :value="now" readonly />
        </el-form-item>
        <el-form-item label="归还负责人：" style="width:100%">
          <el-input v-model="returnManager" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="returnDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmReturn">确认归还</el-button>
      </template>
    </el-dialog>

    <!-- HOLD弹窗 -->
    <el-dialog v-model="holdDialogVisible" title="HOLD确认" width="460px">
      <el-form :inline="true" label-width="100px" class="dialog-form">
        <el-form-item label="HOLD类型：" style="width:100%">
          <el-select v-model="selectedHoldType" placeholder="请选择">
            <el-option label="维修" value="维修" />
            <el-option label="保养" value="保养" />
            <el-option label="报废" value="报废" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="holdDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmHold">确认HOLD</el-button>
      </template>
    </el-dialog>

    <!-- 图纸预览弹窗 -->
    <el-dialog v-model="drawingsVisible" title="模治具图纸" width="60%">
      <el-carousel v-if="drawingList.length" height="400px">
        <el-carousel-item v-for="(url, idx) in drawingList" :key="idx">
          <img :src="url" style="width:100%;height:100%;object-fit:contain;" />
        </el-carousel-item>
      </el-carousel>
      <div v-else class="empty">暂无图纸</div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import VueQr from 'vue-qr/src/packages/vue-qr.vue'
import { Document, Picture, ArrowUp, ArrowDown, Refresh } from '@element-plus/icons-vue'

const route = useRoute()

/* 模拟登录账号：实际请替换为真实获取逻辑 */
const loginUser = 'admin'

/* 查询参数 */
const query = reactive({
  code: route.query.id || '',
  name: ''
})

function resetQuery() {
  query.code = ''
  query.name = ''
}

/* 模治具详情 */
const detail = reactive({
  id: 1,
  code: 'M001',
  name: '注塑模具A',
  status: '闲置',
  category: '注塑类',
  vendor: 'XX 制造',
  lifeLimit: 100000,
  manager: '张三',
  image: ''
})

/* 操作状态 */
const isBorrowed = ref(false)      // 是否已领用
const isInstalled = ref(false)     // 是否已安装
const isUninstalled = ref(false)   // 是否已卸载
const isHeld = ref(false)          // 是否HOLD状态
const holdType = ref('')           // HOLD类型

/* 是否可操作（非HOLD状态） */
const canOperate = computed(() => !isHeld.value)

/* 卡片展开状态 */
const expandInfo = ref(true)
const expandLife = ref(true)
const expandRepair = ref(true)
const expandMaintain = ref(true)

/* 分页信息 */
const lifePage = reactive({ currentPage: 1, pageSize: 10, total: 0 })
const repairPage = reactive({ currentPage: 1, pageSize: 10, total: 0 })
const maintainPage = reactive({ currentPage: 1, pageSize: 10, total: 0 })

function handleLifeSizeChange(val) { lifePage.pageSize = val; fetchLifeRecords() }
function handleLifeCurrentChange(val) { lifePage.currentPage = val; fetchLifeRecords() }
function handleRepairSizeChange(val) { repairPage.pageSize = val; fetchRepairRecords() }
function handleRepairCurrentChange(val) { repairPage.currentPage = val; fetchRepairRecords() }
function handleMaintainSizeChange(val) { maintainPage.pageSize = val; refreshMaintain() }
function handleMaintainCurrentChange(val) { maintainPage.currentPage = val; refreshMaintain() }

/* 状态对应 tag 颜色 */
function statusTagType(status) {
  const map = { 闲置: 'info', 使用中: 'success', HOLD: 'danger', 维修: 'warning', 保养: 'primary' }
  return map[status] || ''
}

/* 安装操作 */
function handleInstall() {
  // 这里应该实现安装到设备的逻辑，比如扫码绑定设备
  ElMessageBox.confirm('请扫描设备二维码完成安装', '安装确认', {
    confirmButtonText: '安装成功',
    cancelButtonText: '安装失败',
    type: 'warning'
  }).then(() => {
    isInstalled.value = true
    ElMessage.success('安装成功')
  }).catch(() => {
    ElMessage.error('安装失败')
  })
}

/* 卸载操作 */
function handleUninstall() {
  ElMessageBox.confirm('确认要卸载模具吗？', '卸载确认', {
    confirmButtonText: '卸载成功',
    cancelButtonText: '卸载失败',
    type: 'warning'
  }).then(() => {
    isInstalled.value = false
    isUninstalled.value = true
    ElMessage.success('卸载成功')
  }).catch(() => {
    ElMessage.error('卸载失败')
  })
}

/* HOLD操作 */
const holdDialogVisible = ref(false)
const selectedHoldType = ref('')

function openHoldDialog() {
  selectedHoldType.value = ''
  holdDialogVisible.value = true
}

function confirmHold() {
  if (!selectedHoldType.value) {
    ElMessage.warning('请选择HOLD类型')
    return
  }

  isHeld.value = true
  holdType.value = selectedHoldType.value
  detail.status = 'HOLD'
  holdDialogVisible.value = false
  ElMessage.success('已设为HOLD状态')
}

/* 解除HOLD操作 */
function handleReleaseHold() {
  if (holdType.value === '报废') {
    ElMessage.warning('报废类型的HOLD不可解除')
    return
  }

  isHeld.value = false
  holdType.value = ''
  detail.status = isBorrowed.value ? '使用中' : '闲置'
  ElMessage.success('已解除HOLD状态')
}

/* 生命周期履历 */
const lifeRecords = ref([])
function fetchLifeRecords() {
  const data = [
    {
      stage: '使用中', remark: '正常生产', lifeLimit: 100000, usedTimes: 1234,
      borrowDate: '2023-05-01 09:00', borrower: loginUser, borrowOutManager: '王五',
      returnDate: '', returner: '', returnManager: '', deviceName: '注塑机 #1', productModel: 'ABC-123'
    },
    {
      stage: '闲置', remark: '待生产', lifeLimit: 100000, usedTimes: 1200,
      borrowDate: '', borrower: '', borrowOutManager: '',
      returnDate: '2023-04-30 18:00', returner: loginUser, returnManager: '王五', deviceName: '', productModel: ''
    }
  ]
  const start = (lifePage.currentPage - 1) * lifePage.pageSize
  lifeRecords.value = data.slice(start, start + lifePage.pageSize)
  lifePage.total = data.length
}

/* 维修信息 */
const repairRecords = ref([])
function fetchRepairRecords() {
  const data = [{ date: '2023-04-25', problem: '型腔划伤', method: '抛光修复', repairer: '赵六' }]
  const start = (repairPage.currentPage - 1) * repairPage.pageSize
  repairRecords.value = data.slice(start, start + repairPage.pageSize)
  repairPage.total = data.length
}

/* 当日保养信息 */
const maintainList = ref([])
function refreshMaintain() {
  const data = Math.random() > 0.5
      ? [{ time: '09:30', code: detail.code, name: detail.name, content: '清洁模面', person: '周七', status: '保养' }]
      : []
  const start = (maintainPage.currentPage - 1) * maintainPage.pageSize
  maintainList.value = data.slice(start, start + maintainPage.pageSize)
  maintainPage.total = data.length
}

/* 二维码下载 */
const qrText = computed(() => `${detail.code}|${detail.name}`)
const qrRef = ref(null)
function downloadQr() {
  nextTick(() => {
    const canvas = qrRef.value.$el.querySelector('canvas')
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `${detail.code}_qr.png`
    a.click()
  })
}

/* 说明书下载 / 图纸查看 */
const manuals = [{ name: '说明书1.pdf', url: '/demo/manual.pdf' }]
const drawingList = ref(['/demo/drawing1.png', '/demo/drawing2.png'])

function downloadManual() {
  if (!manuals.length) return ElMessage.warning('暂无说明书')
  const a = document.createElement('a')
  a.href = manuals[0].url
  a.download = manuals[0].name
  a.click()
}
function openDrawingsDialog() {
  drawingsVisible.value = true
}

/* 领用/归还弹窗 */
const useDialogVisible = ref(false)
const returnDialogVisible = ref(false)
const useManager = ref('')
const returnManager = ref('')
const now = computed(() => new Date().toLocaleString())

function openUseDialog() {
  if (detail.status !== '闲置') return ElMessage.warning('当前状态不可领用')
  useManager.value = ''
  useDialogVisible.value = true
}
function confirmUse() {
  if (!useManager.value) return ElMessage.warning('请输入领用负责人')
  detail.status = '使用中'
  isBorrowed.value = true
  useDialogVisible.value = false
  ElMessage.success('领用成功')
  fetchLifeRecords()
}

function openReturnDialog() {
  if (detail.status !== '使用中') return ElMessage.warning('当前状态不可归还')
  returnManager.value = ''
  returnDialogVisible.value = true
}
function confirmReturn() {
  if (!returnManager.value) return ElMessage.warning('请输入归还负责人')
  detail.status = '闲置'
  isBorrowed.value = false
  isInstalled.value = false
  isUninstalled.value = false
  returnDialogVisible.value = false
  ElMessage.success('归还成功')
  fetchLifeRecords()
}

const drawingsVisible = ref(false)

/* 获取详情 */
function getDetail() {
  Object.assign(detail, {
    id: 1,
    code: query.code || 'M001',
    name: query.name || '注塑模具A',
    status: '闲置',
    category: '注塑类',
    vendor: 'XX 制造',
    lifeLimit: 100000,
    manager: '张三',
    image: ''
  })

  // 重置操作状态
  isBorrowed.value = false
  isInstalled.value = false
  isUninstalled.value = false
  isHeld.value = false
  holdType.value = ''

  fetchLifeRecords()
  fetchRepairRecords()
  refreshMaintain()
}

onMounted(() => {
  getDetail()
})
</script>

<style scoped>
.detail-container {
  padding:20px;
  background:#f5f5f5
}
.top-card{margin-bottom:16px}
.query-form{display:flex;align-items:center;flex-wrap:wrap;gap:10px}
.top-right{display:flex;align-items:center;justify-content:flex-end;gap:16px}
.button-group-container{display:flex;gap:8px}
.action-btn{min-width:60px;margin:0}
.icons{display:flex;gap:12px;align-items:center}
.info-card,.section-card{margin-bottom:16px}
.card-header{display:flex;justify-content:space-between;align-items:center;padding:0 0 12px 0;cursor:pointer;font-weight:bold}
.mold-img{width:100%;height:auto;border-radius:4px}
.qr-col{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px}
.qr-img{border:1px solid #ebeef5}
.qr-txt{text-align:center;font-size:12px;line-height:1.4}
.maintain-header{display:flex;justify-content:flex-end;margin-bottom:8px}
.empty{text-align:center;color:#999;padding:40px 0}
.el-pagination{margin-top:16px;justify-content:flex-end}
:deep(.el-tag--primary){background:#f9f0ff;border-color:#d3adf7;color:#722ed1}
/* 弹窗内文字与输入框一行展示 */
.dialog-form{display:flex;flex-direction:column;gap:8px}
.dialog-form .el-form-item{margin:0}
</style>
