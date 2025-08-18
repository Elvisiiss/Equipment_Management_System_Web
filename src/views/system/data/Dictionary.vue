<template>
  <div class="app-container">
    <!-- ====================== 第一层 ====================== -->
    <el-card v-show="!showSecond">
      <template #header>
        <div class="clearfix">
          <span>字典管理</span>
          <el-button style="float: right" type="primary" @click="openFirstDialog()">新增</el-button>
        </div>
      </template>

      <el-table :data="firstTableData" border>
        <el-table-column label="序号" type="index" width="60" />
        <el-table-column label="字典名称" prop="dictName" />
        <el-table-column label="字典类型" prop="dictType">
          <template #default="{ row }">
            <el-link type="primary" @click="toSecondLayer(row.dictType)">
              {{ row.dictType }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === '0' ? 'success' : 'danger'">
              {{ row.status === '0' ? '正常' : '异常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" />
        <el-table-column label="创建时间" prop="createTime" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="mini" type="text" @click="openFirstDialog(row)">修改</el-button>
            <el-popconfirm title="确定删除吗？" @confirm="handleFirstDelete(row.id)">
              <template #reference>
                <el-button size="mini" type="text" style="color:#f56c6c">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- ====================== 第二层 ====================== -->
    <el-card v-show="showSecond">
      <template #header>
        <div class="clearfix">
          <el-button @click="showSecond=false">返回</el-button>
          <span style="margin-left:20px">
            字典类型【{{ currentDictType }}】标签值列表
          </span>
          <el-button style="float:right" type="primary" @click="openSecondDialog()">新增</el-button>
        </div>
      </template>

      <el-table :data="secondTableData" border>
        <el-table-column label="序号" type="index" width="60" />
        <el-table-column label="标签" prop="label" />
        <el-table-column label="标签值" prop="value" />
        <el-table-column label="排序" prop="sort" />
        <el-table-column label="备注" prop="remark" />
        <el-table-column label="创建时间" prop="createTime" />
        <el-table-column label="操作" width="180">
          <template #default="{row}">
            <el-button size="mini" type="text" @click="openSecondDialog(row)">修改</el-button>
            <el-popconfirm title="确定删除吗？" @confirm="handleSecondDelete(row.id)">
              <template #reference>
                <el-button size="mini" type="text" style="color:#f56c6c">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- ====================== 第一层弹窗 ====================== -->
    <el-dialog
        :title="firstForm.id ? '修改字典' : '新增字典'"
        v-model="firstDialogVisible"
        width="500px"
        @close="resetFirstForm">
      <el-form :model="firstForm" label-width="80px" @submit.native.prevent>
        <el-form-item label="字典名称" required>
          <el-input v-model="firstForm.dictName" />
        </el-form-item>
        <el-form-item label="字典类型" required>
          <el-input v-model="firstForm.dictType" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="firstForm.status">
            <el-radio label="0">正常</el-radio>
            <el-radio label="1">异常</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="firstForm.remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="firstDialogVisible=false">取 消</el-button>
        <el-button type="primary" native-type="submit" @click="submitFirst">确 定</el-button>
      </template>
    </el-dialog>

    <!-- ====================== 第二层弹窗 ====================== -->
    <el-dialog
        :title="secondForm.id ? '修改标签' : '新增标签'"
        v-model="secondDialogVisible"
        width="500px"
        @close="resetSecondForm">
      <el-form :model="secondForm" label-width="80px" @submit.native.prevent>
        <el-form-item label="标签" required>
          <el-input v-model="secondForm.label" />
        </el-form-item>
        <el-form-item label="标签值" required>
          <el-input v-model="secondForm.value" />
        </el-form-item>
        <el-form-item label="排序" required>
          <el-input-number v-model="secondForm.sort" :min="0" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="secondForm.remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="secondDialogVisible=false">取 消</el-button>
        <el-button type="primary" native-type="submit" @click="submitSecond">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

/* ========= 假数据 ========= */
const firstMock = ref([
  {
    id: 1,
    dictName: '用户状态',
    dictType: 'sys_user_status',
    status: '0',
    remark: '用户账户状态字典',
    createTime: '2025-08-18 10:00:00'
  },
  {
    id: 2,
    dictName: '性别',
    dictType: 'sys_user_sex',
    status: '0',
    remark: '',
    createTime: '2025-08-18 10:05:00'
  }
])

const secondMock = reactive({
  sys_user_status: [
    { id: 1, label: '正常', value: '0', sort: 1, remark: '', createTime: '2025-08-18 10:00:00' },
    { id: 2, label: '停用', value: '1', sort: 2, remark: '', createTime: '2025-08-18 10:00:00' }
  ],
  sys_user_sex: [
    { id: 3, label: '男', value: '0', sort: 1, remark: '', createTime: '2025-08-18 10:05:00' },
    { id: 4, label: '女', value: '1', sort: 2, remark: '', createTime: '2025-08-18 10:05:00' }
  ]
})

/* ========= 第一层 ========= */
const firstTableData = ref([])
const firstDialogVisible = ref(false)
const firstForm = reactive({
  id: null,
  dictName: '',
  dictType: '',
  status: '0',
  remark: ''
})

function getFirstTable () {
  firstTableData.value = firstMock.value
}
function resetFirstForm () {
  Object.assign(firstForm, { id: null, dictName: '', dictType: '', status: '0', remark: '' })
}
function openFirstDialog (row = null) {
  if (row) Object.assign(firstForm, row)
  firstDialogVisible.value = true
}
function submitFirst () {
  if (!firstForm.dictName || !firstForm.dictType) {
    ElMessage.warning('请填写完整')
    return
  }
  if (firstForm.id) {
    // 修改
    const idx = firstMock.value.findIndex(v => v.id === firstForm.id)
    Object.assign(firstMock.value[idx], { ...firstForm })
  } else {
    // 新增
    firstMock.value.push({
      ...firstForm,
      id: Date.now(),
      createTime: new Date().toLocaleString()
    })
    // 自动初始化第二层空数组，防止 undefined
    secondMock[firstForm.dictType] = secondMock[firstForm.dictType] || []
  }
  firstDialogVisible.value = false
  getFirstTable()
}
function handleFirstDelete (id) {
  const idx = firstMock.value.findIndex(v => v.id === id)
  if (idx === -1) return
  const dictType = firstMock.value[idx].dictType
  firstMock.value.splice(idx, 1)
  delete secondMock[dictType]
  getFirstTable()
}

/* ========= 第二层 ========= */
const showSecond = ref(false)
const currentDictType = ref('')
const secondTableData = ref([])
const secondDialogVisible = ref(false)
const secondForm = reactive({
  id: null,
  label: '',
  value: '',
  sort: 0,
  remark: ''
})

function toSecondLayer (dictType) {
  currentDictType.value = dictType
  showSecond.value = true
  getSecondTable()
}
function getSecondTable () {
  secondTableData.value = secondMock[currentDictType.value] || []
}
function resetSecondForm () {
  Object.assign(secondForm, { id: null, label: '', value: '', sort: 0, remark: '' })
}
function openSecondDialog (row = null) {
  if (row) Object.assign(secondForm, row)
  secondDialogVisible.value = true
}
function submitSecond () {
  if (!secondForm.label || !secondForm.value) {
    ElMessage.warning('请填写完整')
    return
  }
  const list = secondMock[currentDictType.value]
  if (secondForm.id) {
    const idx = list.findIndex(v => v.id === secondForm.id)
    Object.assign(list[idx], { ...secondForm })
  } else {
    list.push({
      ...secondForm,
      id: Date.now(),
      createTime: new Date().toLocaleString()
    })
  }
  secondDialogVisible.value = false
  getSecondTable()
}
function handleSecondDelete (id) {
  const list = secondMock[currentDictType.value]
  const idx = list.findIndex(v => v.id === id)
  list.splice(idx, 1)
  getSecondTable()
}

onMounted(() => {
  getFirstTable()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}
</style>
