<!-- mold/manage/operation.vue -->
<template>
  <div class="detail-container">
    <!-- 第一行：查询条件 + 按钮 + 图标 -->
    <el-row class="top-row" :gutter="16">
      <el-col :span="12">
        <el-form inline>
          <el-form-item label="模治具编码">
            <el-input v-model="query.code" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="模治具名称">
            <el-input v-model="query.name" placeholder="请输入" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getDetail">查询</el-button>
          </el-form-item>
        </el-form>
      </el-col>

      <el-col :span="12" class="top-right">
        <el-button-group>
          <el-button type="success" @click="handleAction('领用')">领用</el-button>
          <el-button type="warning" @click="handleAction('归还')">归还</el-button>
          <el-button type="info" @click="handleAction('闲置')">闲置</el-button>
          <el-button type="danger" @click="handleAction('维修')">维修</el-button>
          <el-button @click="handleAction('保养')">保养</el-button>
        </el-button-group>

        <!-- 图标 -->
        <div class="icons">
          <el-tooltip content="说明书">
            <img
                class="icon"
                src="@/assets/manual.png"
                @click="openDoc('manual')"
            />
          </el-tooltip>
          <el-tooltip content="图纸">
            <img
                class="icon"
                src="@/assets/drawing.png"
                @click="openDoc('drawing')"
            />
          </el-tooltip>
        </div>
      </el-col>
    </el-row>

    <!-- 第二行：模治具信息卡片 -->
    <el-card class="info-card">
      <el-row :gutter="16">
        <!-- 左侧图片 -->
        <el-col :span="4">
          <img
              class="mold-img"
              :src="detail.image || '@/assets/mold-placeholder.png'"
              alt="模治具图片"
          />
        </el-col>

        <!-- 中间信息 -->
        <el-col :span="16">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="状态">
              <el-tag :type="statusTagType(detail.status)">
                {{ detail.status }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="模治具编码">
              {{ detail.code }}
            </el-descriptions-item>
            <el-descriptions-item label="模治具名称">
              {{ detail.name }}
            </el-descriptions-item>
            <el-descriptions-item label="类别">
              {{ detail.category }}
            </el-descriptions-item>
            <el-descriptions-item label="厂商">
              {{ detail.vendor }}
            </el-descriptions-item>
            <el-descriptions-item label="寿命上限次数">
              {{ detail.lifeLimit }}
            </el-descriptions-item>
            <el-descriptions-item label="管理">
              {{ detail.manager }}
            </el-descriptions-item>
          </el-descriptions>
        </el-col>

        <!-- 右侧二维码 -->
        <el-col :span="4" class="qr-col">
          <vue-qr
              :text="qrText"
              :size="120"
              class="qr-img"
              ref="qrRef"
          />
          <div class="qr-txt">{{ detail.code }}<br />{{ detail.name }}</div>
          <el-button size="small" @click="downloadQr">导出二维码</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 第三行：全生命周期履历 -->
    <el-card class="section-card" header="全生命周期履历">
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
    </el-card>

    <!-- 第四行：维修信息 -->
    <el-card class="section-card" header="维修信息">
      <el-table :data="repairRecords" stripe style="width: 100%">
        <el-table-column prop="date" label="日期" />
        <el-table-column prop="problem" label="问题描述" />
        <el-table-column prop="method" label="维修方法" />
        <el-table-column prop="repairer" label="维修人姓名" />
      </el-table>
    </el-card>

    <!-- 第五行：当日保养信息 -->
    <el-card class="section-card" header="当日保养信息">
        <el-button icon="Refresh" @click="refreshMaintain">刷新</el-button>
      <div v-if="maintainList.length === 0" class="empty">今日无保养计划</div>
      <el-table v-else :data="maintainList" stripe style="width: 100%">
        <el-table-column prop="time" label="时间" />
        <el-table-column prop="code" label="模治具编码" />
        <el-table-column prop="name" label="模治具名称" />
        <el-table-column prop="content" label="保养内容" />
        <el-table-column prop="person" label="保养人" />
        <el-table-column prop="status" label="状态" />
      </el-table>
    </el-card>

    <!-- 弹窗：说明书 / 图纸 -->
    <el-dialog
        v-model="docVisible"
        :title="docTitle"
        width="70%"
        top="5vh"
        destroy-on-close
    >
      <!-- 说明书 -->
      <iframe
          v-if="docType === 'manual'"
          :src="docUrl"
          style="width: 100%; height: 70vh"
      />
      <!-- 图纸 -->
      <img v-else :src="docUrl" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import VueQr from 'vue-qr/src/packages/vue-qr.vue'

const route = useRoute()

/* 查询参数 */
const query = reactive({
  code: route.query.id || '',
  name: ''
})

/* 模治具详情 */
const detail = reactive({
  id: 1,
  code: 'M001',
  name: '注塑模具A',
  status: '使用中',
  category: '注塑类',
  vendor: 'XX 制造',
  lifeLimit: 100000,
  manager: '张三',
  image: ''
})

/* 根据状态返回 tag 类型 */
function statusTagType(status) {
  const map = {
    闲置: 'info',
    使用中: 'success',
    维修: 'danger',
    保养: 'warning'
  }
  return map[status] || ''
}

/* 按钮事件：状态流转 */
function handleAction(action) {
  switch (action) {
    case '领用':
      if (detail.status !== '闲置') {
        ElMessage.warning('当前状态不可领用')
        return
      }
      detail.status = '使用中'
      // 调用接口记录履历
      break
    case '归还':
      if (detail.status !== '使用中') {
        ElMessage.warning('当前状态不可归还')
        return
      }
      detail.status = '闲置'
      break
    case '闲置':
      detail.status = '闲置'
      break
    case '维修':
      detail.status = '维修'
      break
    case '保养':
      detail.status = '保养'
      break
  }
  ElMessage.success(`已设为${action}`)
  // 刷新履历表格
  fetchLifeRecords()
}

/* 生命周期履历 */
const lifeRecords = ref([])
function fetchLifeRecords() {
  // 模拟接口
  lifeRecords.value = [
    {
      stage: '使用中',
      remark: '正常生产',
      lifeLimit: 100000,
      usedTimes: 1234,
      borrowDate: '2023-05-01 09:00',
      borrower: '李四',
      borrowOutManager: '王五',
      returnDate: '',
      returner: '',
      returnManager: '',
      deviceName: '注塑机 #1',
      productModel: 'ABC-123'
    },
    {
      stage: '闲置',
      remark: '待生产',
      lifeLimit: 100000,
      usedTimes: 1200,
      borrowDate: '',
      borrower: '',
      borrowOutManager: '',
      returnDate: '2023-04-30 18:00',
      returner: '李四',
      returnManager: '王五',
      deviceName: '',
      productModel: ''
    }
  ]
}

/* 维修信息 */
const repairRecords = ref([])
function fetchRepairRecords() {
  repairRecords.value = [
    {
      date: '2023-04-25',
      problem: '型腔划伤',
      method: '抛光修复',
      repairer: '赵六'
    }
  ]
}

/* 当日保养信息 */
const maintainList = ref([])
function refreshMaintain() {
  // 模拟：随机返回或空
  if (Math.random() > 0.5) {
    maintainList.value = [
      {
        time: '09:30',
        code: detail.code,
        name: detail.name,
        content: '清洁模面',
        person: '周七',
        status: '保养'
      }
    ]
  } else {
    maintainList.value = []
  }
}

/* 二维码 */
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

/* 说明书 / 图纸弹窗 */
const docVisible = ref(false)
const docTitle = ref('')
const docType = ref('') // manual | drawing
const docUrl = ref('')

function openDoc(type) {
  docType.value = type
  docTitle.value = type === 'manual' ? '模治具说明书' : '模治具图纸'
  // 真实项目中替换为远程地址
  docUrl.value =
      type === 'manual'
          ? '/demo/manual.pdf'
          : '/demo/drawing.png'
  docVisible.value = true
}

/* 获取详情 */
function getDetail() {
  // 根据 query.code / query.name 调接口
  // 以下为演示，直接写死
  Object.assign(detail, {
    id: 1,
    code: query.code || 'M001',
    name: query.name || '注塑模具A',
    status: '使用中',
    category: '注塑类',
    vendor: 'XX 制造',
    lifeLimit: 100000,
    manager: '张三',
    image: ''
  })
}

onMounted(() => {
  getDetail()
  fetchLifeRecords()
  fetchRepairRecords()
  refreshMaintain()
})
</script>

<style scoped>
.detail-container {
  padding: 20px;
  background: #f5f5f5;
}

.top-row {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.top-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
}

.icons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.icon {
  width: 32px;
  height: 32px;
  cursor: pointer;
}

.info-card,
.section-card {
  margin-bottom: 16px;
}

.mold-img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.qr-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.qr-img {
  border: 1px solid #ebeef5;
}

.qr-txt {
  text-align: center;
  font-size: 12px;
  line-height: 1.4;
}

.maintain-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.empty {
  text-align: center;
  color: #999;
  padding: 40px 0;
}
</style>
