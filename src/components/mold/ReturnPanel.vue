<template>
  <el-card>
    <template #header>模具归还作业</template>
    <el-upload
        class="avatar-uploader"
        action="#"
        :show-file-list="false"
        :before-upload="beforeUpload">
      <img v-if="imageUrl" :src="imageUrl" class="avatar" />
      <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
    </el-upload>
    <el-button type="primary" @click="submitReturn">归还</el-button>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
const imageUrl = ref('')
const beforeUpload = (file: File)=>{
  imageUrl.value = URL.createObjectURL(file)
  return false
}
const submitReturn = ()=>ElMessage.success('归还成功')
</script>

<style>
.avatar-uploader .avatar{width:178px;height:178px;display:block}
</style>
