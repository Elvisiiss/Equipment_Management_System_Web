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
            <el-tag :type="row.status === '正常' ? 'success' : 'danger'">
              {{ row.status === '正常' ? '正常' : '异常' }}
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

      <!-- 分页组件 -->
      <el-pagination
          style="margin-top: 20px"
          background
          layout="prev, pager, next, sizes, total"
          :total="total"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          @current-change="getFirstTable"
          @size-change="handleSizeChange"
      />
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
            <el-radio label="正常">正常</el-radio>
            <el-radio label="异常">异常</el-radio>
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
import {
  getDictsPage,
  createDict,
  updateDict,
  deleteDict,
  getDictItems,
  createDictItem,
  updateDictItem,
  deleteDictItem
} from '@/api/system/dictAPI'

/* ========= 第一层 ========= */
const firstTableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const firstDialogVisible = ref(false)
const firstForm = reactive({
  id: null,
  dictName: '',
  dictType: '',
  status: '0',
  remark: ''
})

// 分页查询字典列表
function getFirstTable() {
  const params = {
    page: currentPage.value - 1,
    size: pageSize.value
  }

  getDictsPage(params).then(res => {
    if (res.status === 200) {
      firstTableData.value = res.data.data.records
      total.value = res.data.data.total
    }
  }).catch(error => {
    ElMessage.error('获取字典列表失败: ' + (error.message || error))
  })
}

// 重置表单
function resetFirstForm() {
  Object.assign(firstForm, { id: null, dictName: '', dictType: '', status: '0', remark: '' })
}

// 打开弹窗
function openFirstDialog(row = null) {
  if (row) {
    Object.assign(firstForm, row)
  }
  firstDialogVisible.value = true
}

// 提交表单
function submitFirst() {
  if (!firstForm.dictName || !firstForm.dictType) {
    ElMessage.warning('请填写完整')
    return
  }

  const submitPromise = firstForm.id
      ? updateDict(firstForm)
      : createDict(firstForm)

  submitPromise.then(() => {
    ElMessage.success(firstForm.id ? '修改成功' : '新增成功')
    firstDialogVisible.value = false
    getFirstTable()
  }).catch(error => {
    ElMessage.error('操作失败: ' + (error.message || error))
  })
}

// 删除字典
function handleFirstDelete(id) {
  deleteDict(id).then(() => {
    ElMessage.success('删除成功')
    getFirstTable()
  }).catch(error => {
    ElMessage.error('删除失败: ' + (error.message || error))
  })
}

// 分页大小变化
function handleSizeChange(val) {
  pageSize.value = val
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
  remark: '',
  dictType: '' // 新增字典类型字段
})

// 进入第二层
function toSecondLayer(dictType) {
  currentDictType.value = dictType
  showSecond.value = true
  getSecondTable()
}

// 获取字典项列表
function getSecondTable() {
  getDictItems(currentDictType.value).then(res => {
    if (res.status === 200) {
      console.log(res.data.data)
      secondTableData.value = res.data.data
    }
  }).catch(error => {
    ElMessage.error('获取字典项失败: ' + (error.message || error))
  })
}

// 重置表单
function resetSecondForm() {
  Object.assign(secondForm, { id: null, label: '', value: '', sort: 0, remark: '' })
}

// 打开弹窗
function openSecondDialog(row = null) {
  if (row) {
    Object.assign(secondForm, row)
    secondForm.dictType = currentDictType.value // 设置字典类型
  } else {
    // 新增时设置字典类型
    secondForm.dictType = currentDictType.value
  }
  secondDialogVisible.value = true
}

// 提交表单
function submitSecond() {
  if (!secondForm.label || !secondForm.value) {
    ElMessage.warning('请填写完整')
    return
  }

  const submitPromise = secondForm.id
      ? updateDictItem(secondForm)
      : createDictItem(secondForm)

  submitPromise.then(() => {
    ElMessage.success(secondForm.id ? '修改成功' : '新增成功')
    secondDialogVisible.value = false
    getSecondTable()
  }).catch(error => {
    ElMessage.error('操作失败: ' + (error.message || error))
  })
}

// 删除字典项
function handleSecondDelete(id) {
  deleteDictItem(id).then(() => {
    ElMessage.success('删除成功')
    getSecondTable()
  }).catch(error => {
    ElMessage.error('删除失败: ' + (error.message || error))
  })
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
