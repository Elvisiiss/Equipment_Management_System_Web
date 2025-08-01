<template>
  <div class="repair-form-container">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <h2>设备维修申请表</h2>
          <el-tag type="warning" v-if="formData.status === 5">待维修</el-tag>
        </div>
      </template>

      <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="120px"
          label-position="top"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="报修设备" prop="equipmentName">
              <el-input v-model="formData.equipmentName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备编号" prop="equipmentNumber">
              <el-input v-model="formData.equipmentNumber" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="填写人" prop="reporter">
              <el-input v-model="formData.reporter" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="formData.phone" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="故障类型" prop="faultType">
          <el-select v-model="formData.faultType" placeholder="请选择故障类型" style="width: 100%">
            <el-option label="机械故障" value="mechanical" />
            <el-option label="电气故障" value="electrical" />
            <el-option label="控制系统故障" value="control" />
            <el-option label="软件故障" value="software" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="故障描述" prop="faultDescription">
          <el-input
              v-model="formData.faultDescription"
              type="textarea"
              :rows="4"
              placeholder="请详细描述故障现象"
          />
        </el-form-item>

        <el-form-item label="故障图片" prop="images">
          <el-upload
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :on-change="handleImageChange"
              :file-list="fileList"
              :limit="3"
              multiple
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">最多上传3张图片，每张不超过5MB</div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitting">提交申请</el-button>
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import equipmentAPI from '@/api/equipment'
import repairAPI from '@/api/repair'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const formRef = ref(null)
const submitting = ref(false)
const fileList = ref([])

// 表单数据
const formData = reactive({
  equipmentId: '',
  equipmentName: '',
  equipmentNumber: '',
  reporter: authStore.user?.name || '张三',
  phone: authStore.user?.phone || '13800138000',
  faultType: '',
  faultDescription: '',
  images: [],
  status: 5 // 待维修状态
})

// 表单验证规则
const formRules = {
  faultType: [{ required: true, message: '请选择故障类型', trigger: 'change' }],
  faultDescription: [{ required: true, message: '请输入故障描述', trigger: 'blur' }]
}

// 处理图片上传
const handleImageChange = (file) => {
  if (file.raw) {
    formData.images.push(URL.createObjectURL(file.raw))
  }
}

// 提交表单
const submitForm = async () => {
  await formRef.value.validate()

  submitting.value = true
  try {
    // 1. 更新设备状态为待维修
    await equipmentAPI.updateEquipmentStatus(formData.equipmentId, 5)

    // 2. 创建维修申请
    const repairData = {
      equipmentId: formData.equipmentId,
      equipmentName: formData.equipmentName,
      equipmentNumber: formData.equipmentNumber,
      reporter: formData.reporter,
      phone: formData.phone,
      faultType: formData.faultType,
      faultDescription: formData.faultDescription,
      images: formData.images,
      status: 'pending' // 待处理
    }

    await repairAPI.createRepairOrder(repairData)

    ElMessage.success('维修申请已提交，等待管理员处理')
    router.push('/equipment/EquipmentManage')
  } catch (error) {
    ElMessage.error('提交失败: ' + error.message)
  } finally {
    submitting.value = false
  }
}

// 初始化表单数据
onMounted(() => {
  if (route.query.id) {
    formData.equipmentId = route.query.id
    formData.equipmentName = route.query.name || '未知设备'
    formData.equipmentNumber = route.query.number || '未知编号'
  }
})
</script>

<style scoped>
.repair-form-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.form-card {
  max-width: 900px;
  margin: 0 auto;
  border-radius: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.el-form-item {
  margin-bottom: 22px;
}
</style>
