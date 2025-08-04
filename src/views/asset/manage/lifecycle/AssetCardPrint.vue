<template>
  <Layout title="资产卡片打印">
    <el-space>
      <el-input v-model="keyword" placeholder="资产编码/名称" style="width:200px" />
      <el-button type="primary" @click="query">查询</el-button>
    </el-space>

    <el-table :data="tableData" style="margin-top:16px">
      <el-table-column prop="code" label="资产编码" />
      <el-table-column prop="name" label="资产名称" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button link type="primary" @click="print(row)">打印</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 打印预览 -->
    <el-dialog v-model="showPreview" title="打印预览" width="400px">
      <div ref="printArea">
        <h3 style="text-align:center">资产卡片</h3>
        <p>资产编码：{{ preview.code }}</p>
        <p>资产名称：{{ preview.name }}</p>
        <p>二维码：<canvas id="qr" /></p>
      </div>
      <template #footer>
        <el-button @click="doPrint">确认打印</el-button>
      </template>
    </el-dialog>
  </Layout>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import Layout from './Layout.vue'
import QRCode from 'qrcode'

const keyword = ref('')
const tableData = ref([
  { code: 'FA20240802001', name: '高精密车床' },
  { code: 'FA20240802002', name: '三坐标测量机' }
])

const showPreview = ref(false)
const preview = reactive({ code: '', name: '' })
const printArea = ref()

const query = () => { /* 调接口 */ }

const print = (row) => {
  Object.assign(preview, row)
  showPreview.value = true
  nextTick(() => QRCode.toCanvas(document.getElementById('qr'), row.code))
}

const doPrint = () => {
  const win = window.open('', '_blank')
  win.document.write(printArea.value.innerHTML)
  win.print()
  win.close()
  showPreview.value = false
}
</script>
