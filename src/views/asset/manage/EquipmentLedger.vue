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
      </el-col>
    </el-row>

    <!-- 主体卡片 -->
    <el-card shadow="never" style="margin-bottom:16px">
      <!-- 查询区 -->
      <el-form :model="queryForm" inline label-width="80">
        <el-form-item label="设备类型">
          <el-select v-model="queryForm.deviceType" clearable>
            <el-option v-for="t in dict.deviceType" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="功能类型">
          <el-select v-model="queryForm.functionType" clearable>
            <el-option v-for="t in dict.functionType" :key="t" :label="t" :value="t" />
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
        <el-table-column prop="functionType" label="功能类型" width="100" />
        <el-table-column prop="location" label="位置信息" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link @click="openDialog('edit', row)">编辑</el-button>
            <el-button link @click="openTransfer(row)">转移</el-button>
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
        <el-tab-pane label="设备基本信息" name="base">
          <el-form :model="form" label-width="120" ref="baseForm">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="设备编号" prop="code" required>
                  <el-input v-model="form.code" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="设备名称" prop="name" required>
                  <el-input v-model="form.name" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="设备类型" prop="deviceType">
                  <el-select v-model="form.deviceType" clearable>
                    <el-option v-for="t in dict.deviceType" :key="t" :label="t" :value="t" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="功能类型" prop="functionType">
                  <el-select v-model="form.functionType" clearable>
                    <el-option v-for="t in dict.functionType" :key="t" :label="t" :value="t" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="规格型号">
              <el-input v-model="form.spec" />
            </el-form-item>
            <el-form-item label="出厂编号">
              <el-input v-model="form.serialNo" />
            </el-form-item>
            <el-form-item label="制造商">
              <el-input v-model="form.manufacturer" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="位置信息" name="location">
          <el-form :model="form" label-width="120">
            <el-form-item label="所属组织">
              <el-cascader
                  v-model="form.org"
                  :options="orgTree"
                  :props="{ checkStrictly: true }"
                  clearable
              />
            </el-form-item>
            <el-form-item label="安装位置">
              <el-input v-model="form.location" />
            </el-form-item>
            <el-form-item label="房间号">
              <el-input v-model="form.room" />
            </el-form-item>
            <el-form-item label="坐标">
              <el-input v-model="form.coordinate" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="采购信息" name="purchase">
          <el-form :model="form" label-width="120">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="采购日期">
                  <el-date-picker v-model="form.purchaseDate" type="date" style="width:100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="供应商">
                  <el-input v-model="form.supplier" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="采购合同">
                  <el-input v-model="form.contractNo" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="采购订单">
                  <el-input v-model="form.orderNo" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="保修期限">
              <el-input v-model="form.warrantyPeriod" placeholder="如：3 年">
                <template #append>年</template>
              </el-input>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="财务信息" name="finance">
          <el-form :model="form" label-width="120">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="资产原值">
                  <el-input-number v-model="form.originalValue" :precision="2" :min="0" style="width:100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="折旧年限">
                  <el-input-number v-model="form.depreciationYears" :min="0" style="width:100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="折旧方法">
                  <el-select v-model="form.depreciationMethod" clearable>
                    <el-option label="直线法" value="straight" />
                    <el-option label="双倍余额递减法" value="double" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="残值率">
                  <el-input-number v-model="form.residualRate" :precision="2" :max="100" style="width:100%">
                    <template #append>%</template>
                  </el-input-number>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="售后信息" name="service">
          <el-form :model="form" label-width="120">
            <el-form-item label="服务厂商">
              <el-input v-model="form.serviceProvider" />
            </el-form-item>
            <el-form-item label="服务热线">
              <el-input v-model="form.servicePhone" />
            </el-form-item>
            <el-form-item label="服务邮箱">
              <el-input v-model="form.serviceEmail" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="form.serviceRemark" type="textarea" rows="3" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="客户信息" name="customer">
          <el-form :model="form" label-width="120">
            <el-form-item label="客户名称">
              <el-input v-model="form.customerName" />
            </el-form-item>
            <el-form-item label="客户联系人">
              <el-input v-model="form.customerContact" />
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input v-model="form.customerPhone" />
            </el-form-item>
            <el-form-item label="联系地址">
              <el-input v-model="form.customerAddress" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="设备属性" name="property">
          <el-button type="primary" @click="addProperty">添加属性</el-button>
          <el-table :data="form.properties" style="margin-top:8px">
            <el-table-column prop="key" label="属性名">
              <template #default="{ row }">
                <el-input v-model="row.key" />
              </template>
            </el-table-column>
            <el-table-column prop="value" label="属性值">
              <template #default="{ row }">
                <el-input v-model="row.value" />
              </template>
            </el-table-column>
            <el-table-column width="80">
              <template #default="{ $index }">
                <el-button link type="danger" @click="removeProperty($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="设备连线信息" name="connection">
          <el-button type="primary" @click="addConnection">添加连线</el-button>
          <el-table :data="form.connections" style="margin-top:8px">
            <el-table-column prop="device" label="连接设备">
              <template #default="{ row }">
                <el-select v-model="row.device" filterable>
                  <el-option v-for="d in allDevices" :key="d.id" :label="d.name" :value="d.id" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="port" label="端口">
              <template #default="{ row }">
                <el-input v-model="row.port" />
              </template>
            </el-table-column>
            <el-table-column width="80">
              <template #default="{ $index }">
                <el-button link type="danger" @click="removeConnection($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="其他信息" name="other">
          <el-form :model="form" label-width="120">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" rows="4" />
            </el-form-item>
            <el-form-item label="附件">
              <el-upload
                  v-model:file-list="form.attachments"
                  action="#"
                  multiple
                  :limit="5"
                  :http-request="uploadFile"
              >
                <el-button type="primary">上传附件</el-button>
              </el-upload>
            </el-form-item>
          </el-form>
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
        <el-form-item label="目标位置">
          <el-input v-model="transferForm.toLocation" />
        </el-form-item>
        <el-form-item label="转移原因">
          <el-input v-model="transferForm.reason" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="transferVisible=false">取消</el-button>
        <el-button type="primary" @click="submitTransfer">确认</el-button>
      </template>
    </el-dialog>

    <!-- 标签打印预览 -->
    <el-dialog v-model="labelVisible" title="标签打印" width="400">
      <div ref="labelRef" style="border:1px dashed #ccc;padding:16px;text-align:center">
        <div style="font-size:20px;font-weight:bold">{{ labelDevice?.name }}</div>
        <div style="margin:8px 0">
          <Barcode :value="labelDevice?.code" :options="{ width: 2, height: 60, displayValue: false }" />
        </div>
        <div>{{ labelDevice?.code }}</div>
      </div>
      <template #footer>
        <el-button @click="labelVisible=false">关闭</el-button>
        <el-button type="primary" @click="printLabel">打印</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Barcode from '@chenfengyuan/vue-barcode'

/* 字典 */
const dict = {
  deviceType: ['服务器', '交换机', '路由器', '存储', 'UPS'],
  functionType: ['计算', '网络', '存储', '电源', '安全']
}

/* 查询 */
const queryForm = reactive({
  deviceType: '',
  functionType: '',
  keyword: ''
})
const resetQuery = () => {
  Object.assign(queryForm, { deviceType: '', functionType: '', keyword: '' })
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
    location: `A座${i + 1}F机房`
  }))
  pagination.total = 50
  loading.value = false
}
getList()

/* 新增/编辑 */
const dialogVisible = ref(false)
const dialogType = ref('add')
const activeTab = ref('base')
const baseForm = ref()
const form = reactive({
  id: null,
  code: '',
  name: '',
  deviceType: '',
  functionType: '',
  spec: '',
  serialNo: '',
  manufacturer: '',
  org: [],
  location: '',
  room: '',
  coordinate: '',
  purchaseDate: '',
  supplier: '',
  contractNo: '',
  orderNo: '',
  warrantyPeriod: '',
  originalValue: 0,
  depreciationYears: 5,
  depreciationMethod: 'straight',
  residualRate: 5,
  serviceProvider: '',
  servicePhone: '',
  serviceEmail: '',
  serviceRemark: '',
  customerName: '',
  customerContact: '',
  customerPhone: '',
  customerAddress: '',
  properties: [],
  connections: [],
  remark: '',
  attachments: []
})

const openDialog = (type, row = {}) => {
  dialogType.value = type
  activeTab.value = 'base'
  if (type === 'edit') {
    Object.assign(form, row)
  } else {
    Object.keys(form).forEach(k => {
      if (Array.isArray(form[k])) form[k] = []
      else if (typeof form[k] === 'number') form[k] = 0
      else form[k] = ''
    })
  }
  dialogVisible.value = true
}

const submit = () => {
  baseForm.value.validate(valid => {
    if (!valid) return
    // 模拟提交
    ElMessage.success(dialogType.value === 'add' ? '新增成功' : '修改成功')
    dialogVisible.value = false
    getList()
  })
}

/* 设备转移 */
const transferVisible = ref(false)
const transferDevice = ref()
const transferForm = reactive({ toLocation: '', reason: '' })
const openTransfer = row => {
  transferDevice.value = row
  transferForm.toLocation = ''
  transferForm.reason = ''
  transferVisible.value = true
}
const submitTransfer = () => {
  ElMessage.success('转移成功')
  transferVisible.value = false
  getList()
}

/* 删除 */
const handleDelete = row => {
  ElMessageBox.confirm('确定删除该设备？', '提示').then(() => {
    ElMessage.success('删除成功')
    getList()
  })
}

/* 标签打印 */
const labelVisible = ref(false)
const labelDevice = ref()
const labelRef = ref()
const handlePrintLabel = () => {
  labelDevice.value = tableData.value[0]
  labelVisible.value = true
}
const printLabel = () => {
  const printWindow = window.open('', '_blank')
  printWindow.document.write(labelRef.value.innerHTML)
  printWindow.print()
  printWindow.close()
}

/* 属性动态增删 */
const addProperty = () => form.properties.push({ key: '', value: '' })
const removeProperty = idx => form.properties.splice(idx, 1)

/* 连线动态增删 */
const allDevices = ref(tableData)
const addConnection = () => form.connections.push({ device: '', port: '' })
const removeConnection = idx => form.connections.splice(idx, 1)

/* 上传附件 */
const uploadFile = ({ file, onSuccess }) => {
  // 模拟上传
  setTimeout(() => onSuccess(), 500)
}

/* 组织树模拟数据 */
const orgTree = [
  { value: '总部', label: '总部', children: [
      { value: '信息中心', label: '信息中心' },
      { value: '研发中心', label: '研发中心' }
    ]}
]
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
