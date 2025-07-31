<template>
  <div class="config-page">
    <!-- 顶部标题 -->
    <div class="toolbar">
      <span class="title">基础数据配置</span>
    </div>

    <!-- 顶部 Tab -->
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="点检周期"  name="period"  />
      <el-tab-pane label="点检项目"  name="project" />
      <el-tab-pane label="点检类型"  name="type"    />
    </el-tabs>

    <!-- 新增按钮 -->
    <div style="margin: 0 0 12px 0">
      <el-button type="primary" @click="openAdd">新增{{ currentTitle }}</el-button>
    </div>

    <!-- 列表 -->
    <el-table :data="currentList" stripe style="width: 100%">
      <el-table-column prop="name" label="名称" />
      <el-table-column label="操作" width="160">
        <template #default="{ $index }">
          <el-button size="small" @click="openEdit($index)">编辑</el-button>
          <el-button size="small" type="danger" @click="remove($index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog
        v-model="visible"
        :title="isEdit ? `编辑${currentTitle}` : `新增${currentTitle}`"
        width="400px"
    >
      <el-form :model="form" label-width="90px">
        <el-form-item label="名称">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

/* ---------------- 数据 ---------------- */
const periodList  = ref([{ name: '每日' }, { name: '每周' }, { name: '每月' }])
const projectList = ref([{ name: '设备主轴' }, { name: '液压系统' }])
const typeList    = ref([{ name: '日点检' }, { name: '周点检' }, { name: '月点检' }])

/* ---------------- Tab 控制 ---------------- */
const activeTab = ref('period')
const tabMap = {
  period : { list: periodList,  title: '点检周期' },
  project: { list: projectList, title: '点检项目' },
  type   : { list: typeList,    title: '点检类型' }
}

const currentList  = computed(() => tabMap[activeTab.value].list.value)
const currentTitle = computed(() => tabMap[activeTab.value].title)

/* ---------------- 弹窗逻辑 ---------------- */
const visible = ref(false)
const isEdit  = ref(false)
let editIndex = -1

const form = ref({ name: '' })

function openAdd() {
  isEdit.value  = false
  form.value.name = ''
  visible.value = true
}
function openEdit(idx) {
  isEdit.value  = true
  editIndex     = idx
  form.value.name = currentList.value[idx].name
  visible.value = true
}
function submit() {
  if (!form.value.name.trim()) {
    ElMessage.warning('请输入名称')
    return
  }
  const target = currentList.value
  const item   = { name: form.value.name.trim() }
  if (isEdit.value) {
    target[editIndex] = item
    ElMessage.success('修改成功')
  } else {
    target.unshift(item)
    ElMessage.success('新增成功')
  }
  visible.value = false
}
function remove(idx) {
  currentList.value.splice(idx, 1)
  ElMessage.success('已删除')
}
</script>

<style scoped>
.config-page { padding: 18px; }
.toolbar { margin-bottom: 14px; }
.title { font-size: 20px; font-weight: 600; }
</style>
