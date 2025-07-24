<template>
  <el-dialog v-model="visible" title="支持文档" width="800px">
    <el-table :data="documents" border style="width: 100%">
      <el-table-column prop="name" label="文档名称" />
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button link type="primary" @click="downloadDocument(scope.row)">下载</el-button>
          <el-button link type="primary" @click="previewDocument(scope.row)">预览</el-button>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { ref, watch } from 'vue'
import {ElMessage} from "element-plus";

export default {
  props: {
    modelValue: Boolean,
    documents: Array
  },

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const visible = ref(false)

    watch(() => props.modelValue, (val) => {
      visible.value = val
    })

    watch(visible, (val) => {
      emit('update:modelValue', val)
    })

    const downloadDocument = (doc) => {
      ElMessage.info(`开始下载: ${doc}`)
    }

    const previewDocument = (doc) => {
      ElMessage.info(`预览文档: ${doc}`)
    }

    return {
      visible,
      downloadDocument,
      previewDocument
    }
  }
}
</script>
