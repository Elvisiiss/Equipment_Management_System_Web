<template>
  <div class="device-detail">
    <!-- 第一行：查询条件 + 说明书/图纸 -->
    <el-row justify="space-between" align="middle" class="top-bar">
      <el-col :span="12">
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

      <el-col :span="12" style="text-align:right">
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

    <!-- 第二行：设备主信息卡片 -->
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
              <el-tag :type="device.status==='运行中'?'success':'info'">
                {{ device.status }}
              </el-tag>
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

    <!-- 第三行：BOM 清单 -->
    <el-card class="full-width-card" header="BOM 清单（含备件/模具追溯）">
      <el-table :data="bomList" stripe style="width:100%">
        <el-table-column prop="deviceCode" label="设备编码" />
        <el-table-column prop="deviceName" label="设备名称" />
        <el-table-column prop="areaId" label="区域ID" />
        <el-table-column prop="spareCode" label="备件编码" />
        <el-table-column prop="spareName" label="备件名称" />
        <el-table-column prop="mouldCode" label="模具编码" />
        <el-table-column prop="mouldName" label="模具名称" />
      </el-table>
    </el-card>

    <!-- 第四行：全生命周期履历 -->
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

    <!-- 第五行：维修信息 -->
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

    <!-- 第六行：当天点检任务 -->
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
            <el-tag :type="row.status==='已执行'?'success':'warning'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div v-else>今日无点检计划</div>
    </el-card>

    <!-- 第七行：当天保养信息 -->
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
        v-model="dialogVisible"
        width="70%"
        :title="dialogTitle"
        destroy-on-close
    >
      <img v-if="dialogType==='drawing'" :src="dialogImage" style="width:100%" />
      <div v-else v-html="dialogContent" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import vueQr from 'vue-qr/src/packages/vue-qr.vue'
import { Document, Picture } from '@element-plus/icons-vue'
import html2canvas from 'html2canvas'

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
const lifeCycleList = ref([])
const repairList = ref([])
const checkList = ref([])
const maintainList = ref([])

/* 弹窗相关 */
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogType = ref('')
const dialogImage = ref('')
const dialogContent = ref('')

/* 二维码 ref */
const qrRef = ref()

/* 搜索设备 */
function searchDevice () {
  loadDeviceDetail(query.code)
}

/* 加载设备详情（mock） */
function loadDeviceDetail (code) {
  /* 这里可以换成 axios 真实调用 */
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

  /* 以下为 mock 数据 */
  bomList.value = [
    { deviceCode: code, deviceName: '盖板全自动', areaId: 'A01', spareCode: 'SP001', spareName: '电机', mouldCode: 'M001', mouldName: '上模' },
    { deviceCode: code, deviceName: '盖板全自动', areaId: 'A01', spareCode: 'SP002', spareName: '轴承', mouldCode: 'M002', mouldName: '下模' }
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

/* 展示说明书/图纸 */
function showDoc (type) {
  dialogType.value = type
  dialogTitle.value = type === 'manual' ? '设备说明书' : '设备图纸'
  if (type === 'drawing') {
    dialogImage.value = 'https://via.placeholder.com/800x600?text=Drawing'
  } else {
    dialogContent.value = `
      <h3>设备说明书</h3>
      <p>设备编码：${device.code}</p>
      <p>型号：${device.model}</p>
      <p>厂商：${device.vendor}</p>
      <p>更多内容请下载 PDF...</p>
    `
  }
  dialogVisible.value = true
}

/* 下载二维码 */
function downloadQR () {
  html2canvas(qrRef.value).then(canvas => {
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `qrcode_${device.code}.png`
    a.click()
  })
}

/* 刷新点检 & 保养（模拟） */
function refreshCheck () {
  // 随机切换状态
  checkList.value.forEach(r => {
    r.status = Math.random() > 0.5 ? '已执行' : '待执行'
  })
}

function refreshMaintain () {
  // 模拟随机有无保养
  if (Math.random() > 0.5) {
    maintainList.value = []
  } else {
    maintainList.value = [
      { time: '18:00-19:00', deviceCode: device.code, deviceName: '盖板全自动', content: '深度清洁', areaId: 'A01', maintainer: '张技师', status: '已保养' }
    ]
  }
}

/* 初始化 */
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
