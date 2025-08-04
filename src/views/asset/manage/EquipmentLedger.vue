<!-- EquipmentLedger.vue -->
<template>
  <div class="equipment-ledger">
    <!-- 顶部标题 -->
    <el-row class="page-header" align="middle">
      <el-col>
        <h2>设备台账（资产管理）</h2>
      </el-col>
      <el-col style="text-align:right">
        <el-button type="primary" @click="handlePrintLabel">标签打印</el-button>
        <el-button @click="handleInventory">台账盘点</el-button>
        <el-button @click="showScrapDialog">资产报废</el-button>
      </el-col>
    </el-row>

    <!-- 主体卡片 -->
    <el-card shadow="never" style="margin-bottom:16px">
      <!-- 查询区 -->
      <el-form :model="queryForm" inline label-width="80">
        <el-form-item label="设备状态">
          <el-select v-model="queryForm.status" clearable>
            <el-option label="全部" value="" />
            <el-option label="闲置" value="idle" />
            <el-option label="使用中" value="using" />
            <el-option label="维修中" value="repairing" />
            <el-option label="报废" value="scrapped" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select v-model="queryForm.deviceType" clearable>
            <el-option v-for="t in dict.deviceType" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model="queryForm.keyword" placeholder="设备名称/编号" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getList">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表 -->
    <el-card shadow="never">
      <template #header>
        <el-row justify="space-between" align="middle">
          <span>设备列表</span>
          <el-button type="primary" @click="openDialog('add')">新增设备</el-button>
        </el-row>
      </template>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column type="selection" width="50" />
        <el-table-column prop="code" label="设备编号" width="120" />
        <el-table-column prop="name" label="设备名称" />
        <el-table-column prop="deviceType" label="设备类型" width="100" />
        <el-table-column label="设备状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="位置信息" />
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button link @click="openDialog('edit', row)">编辑</el-button>
            <el-button link @click="openTransfer(row)">转移</el-button>
            <el-button link @click="openBorrowDialog(row)">借用</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
          v-model:current-page="pagination.page"
          :page-size="pagination.size"
          :total="pagination.total"
          layout="prev, pager, next, jumper, total"
          @current-change="getList"
          style="margin-top:16px;text-align:right"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增设备' : '编辑设备'"
        width="60%"
        top="5vh"
    >
      <el-tabs v-model="activeTab" tab-position="left" style="height:60vh">
        <!-- 原有标签页保持不变 -->
        <!-- 新增维护记录标签页 -->
        <el-tab-pane label="维护记录" name="maintenance">
          <el-button type="primary" @click="openMaintenanceDialog">新增维护记录</el-button>
          <el-table :data="form.maintenanceRecords" style="margin-top:8px">
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                {{ getMaintenanceTypeText(row.type) }}
              </template>
            </el-table-column>
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="content" label="内容" />
            <el-table-column prop="result" label="结果" width="120" />
            <el-table-column prop="operator" label="操作人" width="100" />
            <el-table-column label="操作" width="80">
              <template #default="{ $index }">
                <el-button link type="danger" @click="removeMaintenance($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="submit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 设备转移弹窗 -->
    <el-dialog v-model="transferVisible" title="设备转移" width="500">
      <el-form :model="transferForm" label-width="100">
        <el-form-item label="转移设备">
          <el-input :model-value="transferDevice?.name" disabled />
        </el-form-item>
        <el-form-item label="目标位置" required>
          <el-input v-model="transferForm.toLocation" />
        </el-form-item>
        <el-form-item label="转移原因" required>
          <el-input v-model="transferForm.reason" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="transferVisible=false">取消</el-button>
        <el-button type="primary" @click="submitTransfer">确认</el-button>
      </template>
    </el-dialog>

    <!-- 设备借用弹窗 -->
    <el-dialog v-model="borrowVisible" title="设备借用申请" width="500">
      <el-form :model="borrowForm" label-width="100">
        <el-form-item label="借用设备">
          <el-input :model-value="borrowDevice?.name" disabled />
        </el-form-item>
        <el-form-item label="借用人" required>
          <el-input v-model="borrowForm.borrower" />
        </el-form-item>
        <el-form-item label="借用部门" required>
          <el-input v-model="borrowForm.department" />
        </el-form-item>
        <el-form-item label="预计归还" required>
          <el-date-picker v-model="borrowForm.returnDate" type="date" />
        </el-form-item>
        <el-form-item label="借用原因" required>
          <el-input v-model="borrowForm.reason" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="borrowVisible=false">取消</el-button>
        <el-button type="primary" @click="submitBorrow">提交申请</el-button>
      </template>
    </el-dialog>

    <!-- 资产报废弹窗 -->
    <el-dialog v-model="scrapVisible" title="资产报废申请" width="500">
      <el-form :model="scrapForm" label-width="100">
        <el-form-item label="报废设备" required>
          <el-select v-model="scrapForm.deviceId" filterable>
            <el-option
                v-for="d in tableData"
                :key="d.id"
                :label="`${d.code} - ${d.name}`"
                :value="d.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="报废原因" required>
          <el-input v-model="scrapForm.reason" type="textarea" />
        </el-form-item>
        <el-form-item label="报废附件">
          <el-upload
              v-model:file-list="scrapForm.attachments"
              action="#"
              multiple
              :limit="3"
          >
            <el-button type="primary">上传附件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scrapVisible=false">取消</el-button>
        <el-button type="primary" @click="submitScrap">提交申请</el-button>
      </template>
    </el-dialog>

    <!-- 维护记录弹窗 -->
    <el-dialog v-model="maintenanceVisible" title="维护记录" width="500">
      <el-form :model="maintenanceForm" label-width="100">
        <el-form-item label="维护类型" required>
          <el-select v-model="maintenanceForm.type">
            <el-option label="巡检" value="inspection" />
            <el-option label="保养" value="maintenance" />
            <el-option label="维修" value="repair" />
          </el-select>
        </el-form-item>
        <el-form-item label="维护日期" required>
          <el-date-picker v-model="maintenanceForm.date" type="date" />
        </el-form-item>
        <el-form-item label="维护内容" required>
          <el-input v-model="maintenanceForm.content" type="textarea" />
        </el-form-item>
        <el-form-item label="维护结果" required>
          <el-input v-model="maintenanceForm.result" />
        </el-form-item>
        <el-form-item label="操作人" required>
          <el-input v-model="maintenanceForm.operator" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="maintenanceVisible=false">取消</el-button>
        <el-button type="primary" @click="submitMaintenance">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

/* 字典 */
const dict = {
  deviceType: ['服务器', '交换机', '路由器', '存储', 'UPS'],
  functionType: ['计算', '网络', '存储', '电源', '安全'],
  maintenanceType: {
    inspection: '巡检',
    maintenance: '保养',
    repair: '维修'
  }
}

/* 状态文本和样式 */
const getStatusText = (status) => {
  return {
    idle: '闲置',
    using: '使用中',
    repairing: '维修中',
    scrapped: '已报废'
  }[status] || '未知'
}

const getStatusTagType = (status) => {
  return {
    idle: 'info',
    using: 'success',
    repairing: 'warning',
    scrapped: 'danger'
  }[status] || ''
}

const getMaintenanceTypeText = (type) => {
  return dict.maintenanceType[type] || type
}

/* 查询 */
const queryForm = reactive({
  status: '',
  deviceType: '',
  keyword: ''
})

const resetQuery = () => {
  Object.assign(queryForm, { status: '', deviceType: '', keyword: '' })
  getList()
}

/* 表格 */
const loading = ref(false)
const tableData = ref([])
const pagination = reactive({ page: 1, size: 10, total: 0 })
const getList = async () => {
  loading.value = true
  // 模拟接口
  await new Promise(r => setTimeout(r, 600))
  tableData.value = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    code: `EQ${1000 + i}`,
    name: `设备${i + 1}`,
    deviceType: dict.deviceType[i % dict.deviceType.length],
    functionType: dict.functionType[i % dict.functionType.length],
    location: `A座${i + 1}F机房`,
    status: ['idle', 'using', 'repairing', 'scrapped'][i % 4],
    maintenanceRecords: []
  }))
  pagination.total = 50
  loading.value = false
}
getList()

/* 新增/编辑表单 */
const form = reactive({
  // 原有字段保持不变
  maintenanceRecords: [] // 新增维护记录字段
})

/* 转移功能 */
const transferVisible = ref(false)
const transferDevice = ref()
const transferForm = reactive({
  toLocation: '',
  reason: ''
})

const openTransfer = (row) => {
  transferDevice.value = row
  transferForm.toLocation = ''
  transferForm.reason = ''
  transferVisible.value = true
}

const submitTransfer = () => {
  if (!transferForm.toLocation || !transferForm.reason) {
    ElMessage.warning('请填写完整转移信息')
    return
  }
  ElMessage.success('转移申请已提交')
  transferVisible.value = false
}

/* 借用功能 */
const borrowVisible = ref(false)
const borrowDevice = ref()
const borrowForm = reactive({
  borrower: '',
  department: '',
  returnDate: '',
  reason: ''
})

const openBorrowDialog = (row) => {
  borrowDevice.value = row
  Object.keys(borrowForm).forEach(k => borrowForm[k] = '')
  borrowVisible.value = true
}

const submitBorrow = () => {
  if (!borrowForm.borrower || !borrowForm.department ||
      !borrowForm.returnDate || !borrowForm.reason) {
    ElMessage.warning('请填写完整借用信息')
    return
  }
  ElMessage.success('借用申请已提交')
  borrowVisible.value = false
}

/* 报废功能 */
const scrapVisible = ref(false)
const scrapForm = reactive({
  deviceId: '',
  reason: '',
  attachments: []
})

const showScrapDialog = () => {
  scrapForm.deviceId = ''
  scrapForm.reason = ''
  scrapForm.attachments = []
  scrapVisible.value = true
}

const submitScrap = () => {
  if (!scrapForm.deviceId || !scrapForm.reason) {
    ElMessage.warning('请选择报废设备并填写原因')
    return
  }
  ElMessage.success('报废申请已提交')
  scrapVisible.value = false
}

/* 维护记录功能 */
const maintenanceVisible = ref(false)
const maintenanceForm = reactive({
  type: 'inspection',
  date: '',
  content: '',
  result: '',
  operator: ''
})

const openMaintenanceDialog = () => {
  Object.keys(maintenanceForm).forEach(k => {
    if (k === 'type') maintenanceForm[k] = 'inspection'
    else maintenanceForm[k] = ''
  })
  maintenanceVisible.value = true
}

const submitMaintenance = () => {
  if (!maintenanceForm.date || !maintenanceForm.content ||
      !maintenanceForm.result || !maintenanceForm.operator) {
    ElMessage.warning('请填写完整维护信息')
    return
  }
  form.maintenanceRecords.push({ ...maintenanceForm })
  ElMessage.success('维护记录已添加')
  maintenanceVisible.value = false
}

const removeMaintenance = (index) => {
  form.maintenanceRecords.splice(index, 1)
  ElMessage.success('维护记录已删除')
}
</script>

<style scoped>
.equipment-ledger {
  padding: 16px;
  background: #f5f7fa;
  min-height: 100vh;
}
.page-header {
  margin-bottom: 16px;
}
</style>
