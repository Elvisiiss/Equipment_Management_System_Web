<template>
  <el-card>
    <template #header><span>维护与点检</span></template>
    <el-table :data="tasks" border>
      <el-table-column prop="toolCode" label="治具编号"/>
      <el-table-column prop="taskType" label="任务类型"/>
      <el-table-column prop="nextDate" label="计划日期"/>
      <el-table-column label="操作" width="120">
        <template #default="{row}">
          <el-button size="small" type="primary" @click="openCheck(row)">点检</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="showDlg" title="日常点检" width="400px">
      <el-form :model="checkForm">
        <el-form-item label="外观"><el-checkbox v-model="checkForm.item1"/></el-form-item>
        <el-form-item label="功能"><el-checkbox v-model="checkForm.item2"/></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDlg=false">取消</el-button>
        <el-button type="primary" @click="submitCheck">提交</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
const tasks = ref([
  {toolCode:'JZ0001', taskType:'日点检', nextDate:'2025-08-05'},
  {toolCode:'JZ0002', taskType:'周保养', nextDate:'2025-08-07'},
])
const showDlg = ref(false)
const checkForm = ref({item1:false, item2:false})
const openCheck = () => { showDlg.value = true }
const submitCheck = () => {
  ElMessage.success('点检完成')
  showDlg.value = false
}
</script>
