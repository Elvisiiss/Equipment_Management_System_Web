<template>
  <div class="repair-order-container">
    <el-card class="order-card">
      <template #header>
        <div class="card-header">
          <h2>维修工单 #{{ orderData.id }}</h2>
          <el-tag :type="getStatusTag(orderData.status)" size="large">
            {{ getStatusLabel(orderData.status) }}
          </el-tag>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 报修信息 -->
        <el-tab-pane label="报修信息" name="report">
          <div class="info-section">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="设备名称">{{ orderData.equipmentName }}</el-descriptions-item>
              <el-descriptions-item label="设备编号">{{ orderData.equipmentNumber }}</el-descriptions-item>
              <el-descriptions-item label="故障类型">{{ getFaultTypeLabel(orderData.faultType) }}</el-descriptions-item>
              <el-descriptions-item label="报修人">{{ orderData.reporter }}</el-descriptions-item>
              <el-descriptions-item label="报修时间">{{ orderData.reportTime }}</el-descriptions-item>
              <el-descriptions-item label="联系电话">{{ orderData.phone }}</el-descriptions-item>
            </el-descriptions>

            <div class="fault-description">
              <h3>故障描述</h3>
              <p>{{ orderData.faultDescription }}</p>
            </div>

            <div class="fault-images" v-if="orderData.images && orderData.images.length">
              <h3>故障图片</h3>
              <div class="image-list">
                <el-image
                    v-for="(img, index) in orderData.images"
                    :key="index"
                    :src="img"
                    fit="cover"
                    class="fault-image"
                    :preview-src-list="orderData.images"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 派单信息 -->
        <el-tab-pane label="派单信息" name="assign">
          <div class="info-section" v-if="orderData.assignInfo">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="派单时间">{{ orderData.assignInfo.assignTime }}</el-descriptions-item>
              <el-descriptions-item label="派单人">{{ orderData.assignInfo.assigner }}</el-descriptions-item>
              <el-descriptions-item label="维修师傅">{{ orderData.assignInfo.workerName }}</el-descriptions-item>
              <el-descriptions-item label="联系电话">{{ orderData.assignInfo.workerPhone }}</el-descriptions-item>
              <el-descriptions-item label="要求完成时间">{{ orderData.assignInfo.deadline }}</el-descriptions-item>
              <el-descriptions-item label="派单备注">{{ orderData.assignInfo.remark || '无' }}</el-descriptions-item>
            </el-descriptions>
          </div>
          <div v-else class="no-data">
            <el-empty description="暂无派单信息" />
          </div>
        </el-tab-pane>

        <!-- 维修信息 -->
        <el-tab-pane label="维修信息" name="repair">
          <div class="info-section" v-if="orderData.repairInfo">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="开始维修时间">{{ orderData.repairInfo.startTime }}</el-descriptions-item>
              <el-descriptions-item label="完成维修时间">{{ orderData.repairInfo.endTime }}</el-descriptions-item>
              <el-descriptions-item label="维修耗时">
                {{ orderData.repairInfo.duration || '计算中...' }}
              </el-descriptions-item>
              <el-descriptions-item label="维修状态">
                <el-tag :type="orderData.repairInfo.status === 'completed' ? 'success' : 'warning'">
                  {{ orderData.repairInfo.status === 'completed' ? '已完成' : '维修中' }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>

            <el-form :model="repairForm" label-width="100px" v-if="!orderData.repairInfo.endTime">
              <el-form-item label="维修问题">
                <el-input v-model="repairForm.problem" type="textarea" :rows="3" />
              </el-form-item>
              <el-form-item label="解决方法">
                <el-input v-model="repairForm.solution" type="textarea" :rows="3" />
              </el-form-item>
              <el-form-item label="维修描述">
                <el-input v-model="repairForm.description" type="textarea" :rows="4" />
              </el-form-item>
              <el-form-item label="维修图片">
                <el-upload
                    action="#"
                    list-type="picture-card"
                    :auto-upload="false"
                    :on-change="handleRepairImageChange"
                    :file-list="repairFileList"
                    :limit="3"
                    multiple
                >
                  <el-icon><Plus /></el-icon>
                </el-upload>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="startRepair" v-if="!repairStarted">
                  开始维修
                </el-button>
                <el-button type="success" @click="completeRepair" v-if="repairStarted">
                  完成维修
                </el-button>
              </el-form-item>
            </el-form>

            <div v-else>
              <div class="repair-result">
                <h3>维修问题</h3>
                <p>{{ orderData.repairInfo.problem }}</p>
              </div>
              <div class="repair-result">
                <h3>解决方法</h3>
                <p>{{ orderData.repairInfo.solution }}</p>
              </div>
              <div class="repair-result">
                <h3>维修描述</h3>
                <p>{{ orderData.repairInfo.description }}</p>
              </div>
              <div class="repair-images" v-if="orderData.repairInfo.images && orderData.repairInfo.images.length">
                <h3>维修图片</h3>
                <div class="image-list">
                  <el-image
                      v-for="(img, index) in orderData.repairInfo.images"
                      :key="index"
                      :src="img"
                      fit="cover"
                      class="repair-image"
                      :preview-src-list="orderData.repairInfo.images"
                  />
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-data">
            <el-empty description="暂无维修信息" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import repairAPI from '@/api/repair'

const route = useRoute()
const activeTab = ref('report')
const repairStarted = ref(false)
const repairFileList = ref([])

// 工单数据
const orderData = ref({
  id: route.params.id,
  equipmentName: '立式加工中心',
  equipmentNumber: 'MC-0001',
  faultType: 'mechanical',
  reporter: '张三',
  phone: '13800138000',
  reportTime: '2023-06-15 10:30:25',
  faultDescription: '设备主轴异常振动，伴有异常噪音，加工精度下降。',
  images: [
    'https://via.placeholder.com/300x200?text=Fault+Image+1',
    'https://via.placeholder.com/300x200?text=Fault+Image+2'
  ],
  status: 'assigned',
  assignInfo: {
    assignTime: '2023-06-15 11:15:42',
    assigner: '管理员',
    workerName: '张师傅',
    workerPhone: '13800138001',
    deadline: '2023-06-16 18:00:00',
    remark: '请尽快处理，此设备为关键生产设备'
  },
  repairInfo: null
})

// 维修表单
const repairForm = reactive({
  problem: '',
  solution: '',
  description: '',
  images: []
})

// 状态标签
const getStatusTag = (status) => {
  const tags = {
    pending: 'warning',
    assigned: 'primary',
    repairing: 'danger',
    completed: 'success'
  }
  return tags[status] || 'info'
}

// 状态文本
const getStatusLabel = (status) => {
  const labels = {
    pending: '待处理',
    assigned: '已派单',
    repairing: '维修中',
    completed: '已完成'
  }
  return labels[status] || '未知状态'
}

// 故障类型文本
const getFaultTypeLabel = (type) => {
  const labels = {
    mechanical: '机械故障',
    electrical: '电气故障',
    control: '控制系统故障',
    software: '软件故障',
    other: '其他故障'
  }
  return labels[type] || '未知故障'
}

// 处理维修图片上传
const handleRepairImageChange = (file) => {
  if (file.raw) {
    repairForm.images.push(URL.createObjectURL(file.raw))
  }
}

// 开始维修
const startRepair = async () => {
  if (!repairForm.problem) {
    ElMessage.warning('请填写维修问题')
    return
  }

  try {
    await repairAPI.startRepair(orderData.value.id)
    repairStarted.value = true
    orderData.value.status = 'repairing'
    orderData.value.repairInfo = {
      startTime: new Date().toLocaleString(),
      status: 'repairing'
    }
    ElMessage.success('维修已开始')
  } catch (error) {
    ElMessage.error('开始维修失败: ' + error.message)
  }
}

// 完成维修
const completeRepair = async () => {
  if (!repairForm.solution) {
    ElMessage.warning('请填写解决方法')
    return
  }

  try {
    await repairAPI.completeRepair(orderData.value.id, {
      problem: repairForm.problem,
      solution: repairForm.solution,
      description: repairForm.description,
      images: repairForm.images
    })

    orderData.value.status = 'completed'
    orderData.value.repairInfo = {
      ...orderData.value.repairInfo,
      endTime: new Date().toLocaleString(),
      status: 'completed',
      problem: repairForm.problem,
      solution: repairForm.solution,
      description: repairForm.description,
      images: repairForm.images
    }

    ElMessage.success('维修已完成')
  } catch (error) {
    ElMessage.error('完成维修失败: ' + error.message)
  }
}

onMounted(() => {
  // 模拟加载工单数据
  setTimeout(() => {
    // 实际项目中应从API获取数据
  }, 500)
})
</script>

<style scoped>
.repair-order-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.order-card {
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-section {
  padding: 20px;
}

.fault-description, .repair-result {
  margin-top: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.fault-images, .repair-images {
  margin-top: 20px;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
}

.fault-image, .repair-image {
  width: 200px;
  height: 150px;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.no-data {
  padding: 40px 0;
  text-align: center;
}
</style>
