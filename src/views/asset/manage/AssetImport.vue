<template>
  <el-card>
    <template #header><span>采购同步 & Excel 导入</span></template>

    <!-- 采购同步 -->
    <el-card shadow="never" class="mb-12">
      <template #header>
        <span>采购系统自动入库</span>
        <el-button :loading="syncLoading" type="primary" size="small"
                   style="float:right" @click="handleSync">立即同步</el-button>
      </template>
      <el-descriptions border>
        <el-descriptions-item label="上次同步">{{ lastSync }}</el-descriptions-item>
        <el-descriptions-item label="成功条数">{{ syncResult.success }}</el-descriptions-item>
        <el-descriptions-item label="失败条数">{{ syncResult.fail }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- Excel 导入 -->
    <el-upload
        class="upload-demo"
        drag
        accept=".xlsx"
        :before-upload="handleExcel">
      <i class="el-icon-upload"/>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip">
          请先下载
          <el-link type="primary" @click="downloadTemplate">模板文件</el-link>
        </div>
      </template>
    </el-upload>

    <!-- 导入结果 -->
    <el-table v-if="importResult.length" :data="importResult" class="mt-12">
      <el-table-column prop="row" label="行号"/>
      <el-table-column prop="msg" label="结果"/>
    </el-table>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

/* ========= 假数据 ========= */
const lastSync = ref('2025-08-01 10:00:00')
const syncResult = ref({ success: 0, fail: 0 })
const syncLoading = ref(false)

const importResult = ref([])

/* ========= 同步 ========= */
const handleSync = () => {
  syncLoading.value = true
  setTimeout(() => {
    syncResult.value = { success: 18, fail: 2 }
    lastSync.value = new Date().toLocaleString()
    syncLoading.value = false
    ElMessage.success('同步完成')
  }, 1000)
}

/* ========= Excel 导入 ========= */
const handleExcel = (file) => {
  // 简单模拟：随机成功/失败
  importResult.value = [
    { row: 2, msg: '导入成功' },
    { row: 3, msg: '编号已存在' }
  ]
  ElMessage.success('导入完成')
  return false // 阻止真实上传
}

const downloadTemplate = () => {
  // 实际项目中用 window.open('/template.xlsx')
  ElMessage.info('模板下载已触发')
}
</script>
