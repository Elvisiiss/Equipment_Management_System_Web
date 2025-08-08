<template>
  <div>
    <h3>1. 模具安装</h3>

    <!-- 搜索条件 -->
    <el-card shadow="never" style="margin-bottom: 20px;">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="设备名称">
          <el-input v-model="searchForm.deviceName" placeholder="设备名称" clearable />
        </el-form-item>
        <el-form-item label="设备型号">
          <el-input v-model="searchForm.deviceModel" placeholder="设备型号" clearable />
        </el-form-item>
        <el-form-item label="车间">
          <el-select v-model="searchForm.workshop" placeholder="车间" clearable>
            <el-option label="车间A" value="A" />
            <el-option label="车间B" value="B" />
            <el-option label="车间C" value="C" />
          </el-select>
        </el-form-item>
        <el-form-item label="模具状态">
          <el-select v-model="searchForm.status" placeholder="模具状态" clearable>
            <el-option label="已安装" value="installed" />
            <el-option label="未安装" value="uninstalled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="exportData">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 主表格 -->
    <el-card shadow="never">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="模具安装表" name="installation">
          <el-table
              :data="tableData"
              border
              style="width: 100%"
              @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="deviceName" label="设备名称" width="120" />
            <el-table-column prop="deviceModel" label="设备型号" width="120" />
            <el-table-column prop="modelDesc" label="型号描述" width="180" />
            <el-table-column prop="workshop" label="车间" width="100" />
            <el-table-column prop="installCount" label="累计安装模具次数" width="150" />
            <el-table-column prop="status" label="模具状态" width="100">
              <template #default="{row}">
                <el-tag :type="row.status === 'installed' ? 'success' : 'info'">
                  {{ row.status === 'installed' ? '已安装' : '未安装' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="installTime" label="安装时间" width="180" />
            <el-table-column label="操作" width="180">
              <template #default="{row}">
                <el-button
                    size="small"
                    type="primary"
                    :disabled="row.status === 'installed'"
                    @click="handleInstall(row)">
                  安装
                </el-button>
                <el-button
                    size="small"
                    type="danger"
                    :disabled="row.status !== 'installed'"
                    @click="handleUninstall(row)">
                  卸载
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="模具安装明细" name="detail">
          <el-table :data="detailData" border style="width: 100%">
            <el-table-column prop="moldName" label="模具名称" />
            <el-table-column prop="productName" label="产品名称" />
            <el-table-column prop="ratedRatio" label="额定计费比例(次/级)" />
            <el-table-column prop="actualRatio" label="实际计费比例(次/级)" />
            <el-table-column prop="status" label="提具状态" />
            <el-table-column prop="issue" label="问题" />
          </el-table>
          <div style="text-align: right; margin-top: 15px;">
            <el-button type="success" @click="exportDetailData">导出</el-button>
          </div>
        </el-tab-pane>

        <el-tab-pane label="模具产品明细" name="product">
          <el-table :data="productData" border style="width: 100%">
            <el-table-column prop="moldName" label="模具名称" />
            <el-table-column prop="productName" label="产品名称" />
            <el-table-column prop="runTime" label="运行时间" />
            <el-table-column prop="deviceOutput" label="设备产量" />
            <el-table-column prop="ratedRatio" label="额定计费比例" />
            <el-table-column prop="actualRatio" label="实际计费比例" />
            <el-table-column prop="output" label="产品产出" />
          </el-table>
          <div style="text-align: right; margin-top: 15px;">
            <el-button type="success" @click="exportProductData">导出</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 安装对话框 -->
    <el-dialog v-model="installDialogVisible" title="模具安装" width="500px">
      <el-form :model="installForm" label-width="100px">
        <el-form-item label="模具名称">
          <el-select v-model="installForm.moldName" placeholder="请选择模具" style="width: 100%">
            <el-option
                v-for="item in moldOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品名称">
          <el-input v-model="installForm.productName" disabled />
        </el-form-item>
        <el-form-item label="额定计费比例">
          <el-input v-model="installForm.ratedRatio" disabled />
        </el-form-item>
        <el-form-item label="实际计费比例">
          <el-input v-model="installForm.actualRatio" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="installDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmInstall">确定安装</el-button>
      </template>
    </el-dialog>

    <div style="text-align: right; margin-top: 20px;">
      <el-button type="primary" @click="$emit('next')">下一步</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const emit = defineEmits(['next'])

const activeTab = ref('installation')
const searchForm = reactive({
  deviceName: '',
  deviceModel: '',
  workshop: '',
  status: ''
})

const tableData = ref([
  {
    id: 1,
    deviceName: 'C4-51-01',
    deviceModel: 'CX2030',
    modelDesc: '普通设备',
    workshop: 'A',
    installCount: 5,
    status: 'installed',
    installTime: '2025-08-01 10:00:00'
  },
  {
    id: 2,
    deviceName: 'C4-51-02',
    deviceModel: 'CX2031',
    modelDesc: '高级设备',
    workshop: 'B',
    installCount: 3,
    status: 'uninstalled',
    installTime: ''
  },
  {
    id: 3,
    deviceName: 'C4-51-03',
    deviceModel: 'CX2032',
    modelDesc: '特殊设备',
    workshop: 'C',
    installCount: 8,
    status: 'installed',
    installTime: '2025-08-03 14:30:00'
  }
])

const detailData = ref([
  {
    moldName: 'CX2030',
    productName: '产品A',
    ratedRatio: '1',
    actualRatio: '1',
    status: '正常',
    issue: ''
  },
  {
    moldName: 'CX2031',
    productName: '产品B',
    ratedRatio: '1.2',
    actualRatio: '1.1',
    status: '正常',
    issue: ''
  }
])

const productData = ref([
  {
    moldName: 'CX2030',
    productName: '产品A',
    runTime: '120小时',
    deviceOutput: '5000',
    ratedRatio: '1',
    actualRatio: '1',
    output: '5000'
  },
  {
    moldName: 'CX2031',
    productName: '产品B',
    runTime: '80小时',
    deviceOutput: '3000',
    ratedRatio: '1.2',
    actualRatio: '1.1',
    output: '3300'
  }
])

const selectedRows = ref([])
const installDialogVisible = ref(false)
const installForm = reactive({
  moldName: '',
  productName: '',
  ratedRatio: '',
  actualRatio: ''
})

const moldOptions = ref([
  { value: 'CX2030', label: 'CX2030' },
  { value: 'CX2031', label: 'CX2031' },
  { value: 'CX2032', label: 'CX2032' }
])

const handleSearch = () => {
  ElMessage.success('搜索成功')
  // 实际应用中这里应该调用API获取数据
}

const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  ElMessage.success('已重置搜索条件')
}

const exportData = () => {
  ElMessage.success('导出模具安装表数据')
}

const exportDetailData = () => {
  ElMessage.success('导出模具安装明细数据')
}

const exportProductData = () => {
  ElMessage.success('导出模具产品明细数据')
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleInstall = (row) => {
  installDialogVisible.value = true
  // 模拟获取模具信息
  const mold = moldOptions.value.find(item => item.value === 'CX2030')
  if (mold) {
    installForm.moldName = mold.value
    installForm.productName = '产品A'
    installForm.ratedRatio = '1'
    installForm.actualRatio = '1'
  }
}

const handleUninstall = (row) => {
  ElMessageBox.confirm('确定要卸载该模具吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'uninstalled'
    row.installTime = ''
    ElMessage.success('卸载成功')
  }).catch(() => {
    ElMessage.info('已取消卸载')
  })
}

const confirmInstall = () => {
  installDialogVisible.value = false
  // 在实际应用中这里应该调用API进行安装
  const row = tableData.value.find(item => item.status === 'uninstalled')
  if (row) {
    row.status = 'installed'
    row.installTime = new Date().toLocaleString()
    row.installCount += 1
  }
  ElMessage.success('安装成功')
}
</script>
