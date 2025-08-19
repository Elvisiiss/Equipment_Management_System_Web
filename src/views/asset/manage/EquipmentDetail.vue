<template>
  <div class="device-detail">
    <!-- 第一行：查询条件 + 功能按钮 + 说明书/图纸 -->
    <el-row justify="space-between" align="middle" class="top-bar">
      <!-- 查询 -->
      <el-col :span="8">
        <el-form inline>
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
        <div class="action-buttons">
          <el-button type="success" @click="openAcceptDialog">验收</el-button>
          <el-button type="primary" @click="openTransferDialog">转移</el-button>
          <el-button @click="openIdleDialog">闲置</el-button>
          <el-button type="danger" @click="openScrapDialog">报废</el-button>
        </div>
      </el-col>

      <!-- 说明书/图纸 -->
      <el-col :span="8">
        <div class="doc-buttons">
          <el-button circle @click="showDoc('manual')">
            <el-icon :size="18"><Document /></el-icon>
          </el-button>
          <span>设备说明书</span>

          <el-button circle @click="showDoc('drawing')">
            <el-icon :size="18"><Picture /></el-icon>
          </el-button>
          <span>设备图纸</span>
        </div>
      </el-col>
    </el-row>

    <!-- 第二行：设备主信息 -->
    <el-card class="full-width-card">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <el-image
              src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
              fit="cover"
              style="width:100%; height:180px;border-radius:6px"
          />
        </el-col>
        <el-col :span="12">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="状态">
              <el-tag :type="statusTagType" class="status-tag">{{ device.status }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="资产编码">{{ device.assetCode }}</el-descriptions-item>
            <el-descriptions-item label="设备编码">{{ device.code }}</el-descriptions-item>
            <el-descriptions-item label="设备名称">{{ device.name }}</el-descriptions-item>
            <el-descriptions-item label="设备类别">{{ device.category }}</el-descriptions-item>
            <el-descriptions-item label="型号">{{ device.model }}</el-descriptions-item>
            <el-descriptions-item label="区域名称">{{ device.areaName }}</el-descriptions-item>
            <el-descriptions-item label="责任人">{{ device.owner }}</el-descriptions-item>
            <el-descriptions-item label="厂商">{{ device.vendor }}</el-descriptions-item>
            <el-descriptions-item label="进场日期">{{ device.inDate }}</el-descriptions-item>
          </el-descriptions>
        </el-col>
        <el-col :span="6">
          <div class="qr-container">
            <div ref="qrRef">
              <vue-qr :text="device.qrText" :size="160" />
            </div>
            <el-button @click="downloadQR" style="margin-top:15px">导出二维码</el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 第三行：BOM 备件清单 -->
    <el-card class="full-width-card">
      <template #header>
        <div class="card-header">
          <span>BOM 清单（备件）</span>
          <el-icon class="collapse-icon" @click="isBomCollapsed = !isBomCollapsed">
            <ArrowUp v-if="!isBomCollapsed" />
            <ArrowDown v-else />
          </el-icon>
        </div>
      </template>
      <div v-show="!isBomCollapsed" class="card-content">
        <el-table :data="bomList.slice((bomPage.currentPage-1)*bomPage.pageSize, bomPage.currentPage*bomPage.pageSize)" stripe style="width:100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="spareCode" label="备件编码" />
          <el-table-column prop="spareName" label="备件名称" />
          <el-table-column prop="usage" label="用量" width="80" />
          <el-table-column prop="stock" label="库存数量" width="100" />
          <el-table-column prop="areaName" label="区域名称" />
        </el-table>
        <div class="pagination-container">
          <el-pagination
              v-model:current-page="bomPage.currentPage"
              v-model:page-size="bomPage.pageSize"
              :page-sizes="[5, 10, 20]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="bomList.length"
          />
        </div>
      </div>
    </el-card>

    <!-- 第四行：模治具清单 -->
    <el-card class="full-width-card">
      <template #header>
        <div class="card-header">
          <span>模治具清单</span>
          <el-icon class="collapse-icon" @click="isMouldCollapsed = !isMouldCollapsed">
            <ArrowUp v-if="!isMouldCollapsed" />
            <ArrowDown v-else />
          </el-icon>
        </div>
      </template>
      <div v-show="!isMouldCollapsed" class="card-content">
        <el-table :data="mouldList.slice((mouldPage.currentPage-1)*mouldPage.pageSize, mouldPage.currentPage*mouldPage.pageSize)" stripe style="width:100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="mouldCode" label="模具编码" />
          <el-table-column prop="mouldName" label="模具名称" />
          <el-table-column prop="usage" label="用量" width="80" />
          <el-table-column prop="stock" label="库存数量" width="100" />
          <el-table-column prop="productModel" label="产品型号" />
          <el-table-column prop="areaName" label="区域名称" />
        </el-table>
        <div class="pagination-container">
          <el-pagination
              v-model:current-page="mouldPage.currentPage"
              v-model:page-size="mouldPage.pageSize"
              :page-sizes="[5, 10, 20]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="mouldList.length"
          />
        </div>
      </div>
    </el-card>

    <!-- 第五行：生命周期履历 -->
    <el-card class="full-width-card">
      <template #header>
        <div class="card-header">
          <span>设备全生命周期履历</span>
          <el-icon class="collapse-icon" @click="isLifeCycleCollapsed = !isLifeCycleCollapsed">
            <ArrowUp v-if="!isLifeCycleCollapsed" />
            <ArrowDown v-else />
          </el-icon>
        </div>
      </template>
      <div v-show="!isLifeCycleCollapsed" class="card-content">
        <el-table :data="lifeCycleList.slice((lifeCyclePage.currentPage-1)*lifeCyclePage.pageSize, lifeCyclePage.currentPage*lifeCyclePage.pageSize)" stripe style="width:100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="stage" label="阶段" />
          <el-table-column prop="submitter" label="提交人" />
          <el-table-column prop="submitTime" label="提交时间" sortable />
          <el-table-column prop="approver" label="审批人" />
          <el-table-column prop="approveTime" label="审批时间" sortable />
          <el-table-column prop="remark" label="备注" />
          <el-table-column prop="areaName" label="区域名称" />
        </el-table>
        <div class="pagination-container">
          <el-pagination
              v-model:current-page="lifeCyclePage.currentPage"
              v-model:page-size="lifeCyclePage.pageSize"
              :page-sizes="[5, 10, 20]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="lifeCycleList.length"
          />
        </div>
      </div>
    </el-card>

    <!-- 第六行：点检任务 -->
    <el-card class="full-width-card">
      <template #header>
        <div class="card-header">
          <span>今日点检任务</span>
          <el-icon class="collapse-icon" @click="isCheckTaskCollapsed = !isCheckTaskCollapsed">
            <ArrowUp v-if="!isCheckTaskCollapsed" />
            <ArrowDown v-else />
          </el-icon>
        </div>
      </template>
      <div v-show="!isCheckTaskCollapsed" class="card-content">
        <div style="margin-bottom:15px">
          <el-button @click="refreshCheck">刷新</el-button>
          <el-button @click="goToInspectionList">详情</el-button>
        </div>
        <el-table v-if="checkList.length" :data="checkList.slice((checkPage.currentPage-1)*checkPage.pageSize, checkPage.currentPage*checkPage.pageSize)" stripe style="width:100%">
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
        <div v-else class="no-data">今日无点检计划</div>
        <div v-if="checkList.length" class="pagination-container">
          <el-pagination
              v-model:current-page="checkPage.currentPage"
              v-model:page-size="checkPage.pageSize"
              :page-sizes="[5, 10]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="checkList.length"
          />
        </div>
      </div>
    </el-card>

    <!-- 第七行：保养信息 -->
    <el-card class="full-width-card">
      <template #header>
        <div class="card-header">
          <span>今日保养信息</span>
          <el-icon class="collapse-icon" @click="isMaintainInfoCollapsed = !isMaintainInfoCollapsed">
            <ArrowUp v-if="!isMaintainInfoCollapsed" />
            <ArrowDown v-else />
          </el-icon>
        </div>
      </template>
      <div v-show="!isMaintainInfoCollapsed" class="card-content">
        <div style="margin-bottom:15px">
          <el-button @click="refreshMaintain">刷新</el-button>
          <el-button @click="goToMaintenanceList">详情</el-button>
        </div>
        <el-table v-if="maintainList.length" :data="maintainList.slice((maintainPage.currentPage-1)*maintainPage.pageSize, maintainPage.currentPage*maintainPage.pageSize)" stripe style="width:100%">
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
        <div v-else class="no-data">今日无保养计划</div>
        <div v-if="maintainList.length" class="pagination-container">
          <el-pagination
              v-model:current-page="maintainPage.currentPage"
              v-model:page-size="maintainPage.pageSize"
              :page-sizes="[5, 10]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="maintainList.length"
          />
        </div>
      </div>
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
import { useRoute, useRouter } from 'vue-router'
import vueQr from 'vue-qr/src/packages/vue-qr.vue'
import html2canvas from 'html2canvas'
import { ElMessage } from 'element-plus'
import { Document, Picture, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { deviceAPI } from '@/api/ckAPI'

const router = useRouter()
const route = useRoute()

// 折叠状态
const isBomCollapsed = ref(false)
const isMouldCollapsed = ref(false)
const isLifeCycleCollapsed = ref(false)
const isCheckTaskCollapsed = ref(false)
const isMaintainInfoCollapsed = ref(false)

// 分页配置
const bomPage = reactive({ currentPage: 1, pageSize: 5 })
const mouldPage = reactive({ currentPage: 1, pageSize: 5 })
const lifeCyclePage = reactive({ currentPage: 1, pageSize: 5 })
const checkPage = reactive({ currentPage: 1, pageSize: 5 })
const maintainPage = reactive({ currentPage: 1, pageSize: 5 })

/* 查询条件 */
const query = reactive({
  code: route.query.code || 'C4-51-12'
})

/* 设备对象 */
const device = reactive({
  imageUrl: '',
  status: '运行中',
  assetCode: 'ZC202308001',
  code: 'C4-51-12',
  name: '自动贴片机',
  areaName: 'C4车间 / 51产线 / 贴片工段',
  category: '贴片设备',
  model: 'TPJ-5000',
  vendor: '三星电子',
  inDate: '2023-06-15',
  owner: '张工',
  qrText: '设备ID: C4-51-12 | 名称: 自动贴片机'
})

/* 表格数据 */
const bomList = ref([
  { spareCode: 'BJ001', spareName: '贴片头', usage: 2, stock: 5, areaName: '贴片区域' },
  { spareCode: 'BJ002', spareName: '传送带', usage: 1, stock: 3, areaName: '传送区域' },
  { spareCode: 'BJ003', spareName: '控制板', usage: 1, stock: 8, areaName: '控制区域' },
  { spareCode: 'BJ004', spareName: '吸嘴', usage: 12, stock: 25, areaName: '贴片区域' },
  { spareCode: 'BJ005', spareName: '传感器', usage: 4, stock: 10, areaName: '检测区域' },
  { spareCode: 'BJ006', spareName: '电机', usage: 3, stock: 7, areaName: '驱动区域' }
])

const mouldList = ref([
  { mouldCode: 'MJ001', mouldName: 'SMT模板', usage: 1, stock: 2, productModel: 'Model A', areaName: '贴片区域' },
  { mouldCode: 'MJ002', mouldName: '回流焊夹具', usage: 2, stock: 4, productModel: 'Model B', areaName: '焊接区域' },
  { mouldCode: 'MJ003', mouldName: '测试治具', usage: 1, stock: 3, productModel: 'Model C', areaName: '测试区域' },
  { mouldCode: 'MJ004', mouldName: '组装夹具', usage: 3, stock: 5, productModel: 'Model D', areaName: '组装区域' },
  { mouldCode: 'MJ005', mouldName: '包装治具', usage: 2, stock: 4, productModel: 'Model E', areaName: '包装区域' }
])

const lifeCycleList = ref([
  { stage: '采购', submitter: '采购部-李经理', submitTime: '2023-05-10', approver: '王总', approveTime: '2023-05-12', remark: '设备采购申请', areaName: '总部' },
  { stage: '验收', submitter: '设备部-张工', submitTime: '2023-06-18', approver: '赵经理', approveTime: '2023-06-20', remark: '设备验收合格', areaName: 'C4车间' },
  { stage: '安装', submitter: '设备部-张工', submitTime: '2023-06-22', approver: '赵经理', approveTime: '2023-06-22', remark: '设备安装完成', areaName: '51产线' },
  { stage: '调试', submitter: '设备部-王工', submitTime: '2023-06-25', approver: '赵经理', approveTime: '2023-06-26', remark: '设备调试完成', areaName: '51产线' },
  { stage: '运行', submitter: '生产部-刘主管', submitTime: '2023-06-28', approver: '', approveTime: '', remark: '设备投入生产', areaName: '贴片工段' },
  { stage: '保养', submitter: '设备部-张工', submitTime: '2023-08-01', approver: '赵经理', approveTime: '2023-08-01', remark: '月度保养完成', areaName: '贴片工段' }
])

const checkList = ref([
  { time: '08:00', content: '检查设备运行状态', checker: '张工', period: '早班', status: '已执行', areaName: '贴片区域' },
  { time: '12:00', content: '检查设备温度', checker: '李工', period: '中班', status: '未执行', areaName: '贴片区域' },
  { time: '16:00', content: '检查传送带', checker: '王工', period: '晚班', status: '未执行', areaName: '传送区域' }
])

const maintainList = ref([
  { date: '2023-08-18', content: '月度保养', maintainer: '张工', status: '已完成', areaName: '贴片区域' },
  { date: '2023-08-18', content: '润滑保养', maintainer: '王工', status: '进行中', areaName: '传送区域' }
])

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
  const map = {
    运行中: 'success',
    待机: 'info',
    闲置: 'warning',
    报废: 'danger',
    '转移中': 'primary'
  }
  return map[device.status] || ''
})

/* 区域级联选择器选项 */
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
  }
]

const cascaderProps = {
  expandTrigger: 'hover',
  checkStrictly: true
}

/* 搜索设备 */
async function searchDevice() {
  if (!query.code) {
    ElMessage.warning('请输入设备编码')
    return
  }
  await loadDeviceDetail(query.code)
}

/* 加载详情 */
async function loadDeviceDetail(code) {
  try {
    // 模拟API请求
    ElMessage.success(`加载设备 ${code} 信息成功`)
  } catch (error) {
    ElMessage.error('加载设备信息失败')
    console.error(error)
  }
}

/* 说明书/图纸弹窗 */
function showDoc(type) {
  docType.value = type
  docTitle.value = type === 'manual' ? '设备说明书' : '设备图纸'
  if (type === 'drawing') {
    docImage.value = 'https://images.unsplash.com/photo-1603732551681-2e91159b9dc2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  } else {
    docContent.value = `
      <h3>自动贴片机使用说明书</h3>
      <p>设备编码：${device.code}</p>
      <p>型号：${device.model}</p>
      <p>厂商：${device.vendor}</p>
      <p>出厂日期：2023年4月</p>
      <p>版本：V2.1</p>
      <hr>
      <h4>安全注意事项：</h4>
      <ul>
        <li>操作前请仔细阅读本说明书</li>
        <li>设备运行时请勿打开防护门</li>
        <li>定期检查设备接地情况</li>
        <li>非专业人员请勿拆卸设备</li>
      </ul>
      <h4>操作指南：</h4>
      <ol>
        <li>开机前检查电源连接</li>
        <li>启动设备控制软件</li>
        <li>加载生产程序</li>
        <li>执行设备自检</li>
        <li>开始生产</li>
      </ol>
    `
  }
  docVisible.value = true
}

/* 导出二维码 */
function downloadQR() {
  html2canvas(qrRef.value).then(canvas => {
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `qrcode_${device.code}.png`
    a.click()
  })
}

/* 打开弹窗 */
function openAcceptDialog() {
  Object.assign(acceptForm, {
    result: '合格',
    opinion: '',
    initiator: loginUser,
    date: today,
    attachments: []
  })
  acceptVisible.value = true
}

function openTransferDialog() {
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
function goToInspectionList() {
  router.push('/inspection/manage/TaskList')
}

function goToMaintenanceList() {
  router.push('/maintenance/manage/ApprovalList')
}

/* 提交事件 */
async function submitAccept() {
  try {
    ElMessage.success('验收申请已提交，等待审核')
    acceptVisible.value = false
  } catch (error) {
    ElMessage.error('提交失败')
    console.error(error)
  }
}

async function submitTransfer() {
  if (!transferForm.targetArea || transferForm.targetArea.length === 0) {
    ElMessage.warning('请选择目标区域')
    return
  }

  try {
    ElMessage.success('转移申请已提交，等待审核')
    transferVisible.value = false
  } catch (error) {
    ElMessage.error('提交失败')
    console.error(error)
  }
}

async function submitIdle() {
  if (!idleForm.description) {
    ElMessage.warning('请填写申请说明')
    return
  }

  try {
    ElMessage.success('闲置申请已提交，等待审核')
    idleVisible.value = false
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
    ElMessage.success('报废申请已提交，等待审核')
    scrapVisible.value = false
  } catch (error) {
    ElMessage.error('提交失败')
    console.error(error)
  }
}

/* 刷新点检/保养 */
async function refreshCheck() {
  try {
    ElMessage.success('点检任务已刷新')
  } catch (error) {
    ElMessage.error('刷新失败')
    console.error(error)
  }
}

async function refreshMaintain() {
  try {
    ElMessage.success('保养信息已刷新')
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
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.top-bar {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.full-width-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.el-card__header) {
  background-color: #f8f9fa;
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  font-weight: bold;
  font-size: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.collapse-icon {
  cursor: pointer;
  color: #606266;
  transition: transform 0.3s;
}

.card-content {
  padding: 20px;
}

.el-descriptions {
  margin: 15px 0;
}

.qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}

.status-tag {
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 15px 0;
}

.doc-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.doc-buttons span {
  font-size: 14px;
  color: #606266;
}

.el-image {
  border: 1px solid #ebeef5;
  border-radius: 6px;
}

.el-row {
  margin-bottom: 10px;
}

.el-form--inline .el-form-item {
  margin-right: 15px;
  margin-bottom: 0;
}

.no-data {
  text-align: center;
  padding: 30px;
  color: #909399;
}

:deep(.el-input) {
  width: 200px; /* 固定宽度即可 */
}
</style>
