<template>
  <div class="policy-config-container">
    <div class="header">
      <h2>点检策略配置</h2>
      <div class="actions">
        <el-button type="primary" @click="handleAddPolicy">
          <el-icon><Plus /></el-icon>
          新增策略
        </el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="策略列表" name="list">
        <el-table :data="policyList" border style="width: 100%">
          <el-table-column prop="name" label="策略名称" width="180" />
          <el-table-column prop="scene" label="适用场景" width="120">
            <template #default="{row}">
              <el-tag :type="sceneTagType(row.scene)">
                {{ formatScene(row.scene) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="deviceTypes" label="适用设备类型">
            <template #default="{row}">
              <el-tag
                v-for="type in row.deviceTypes"
                :key="type"
                style="margin-right: 5px"
              >
                {{ type }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{row}">
              <el-switch
                v-model="row.status"
                :active-value="1"
                :inactive-value="0"
                @change="handleStatusChange(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template #default="{row}">
              <el-button size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="策略模板" name="template">
        <div class="template-list">
          <el-card
            v-for="template in templates"
            :key="template.id"
            class="template-card"
            shadow="hover"
            @click="handleUseTemplate(template)"
          >
            <div class="template-content">
              <h4>{{ template.name }}</h4>
              <p>{{ template.description }}</p>
              <div class="template-tags">
                <el-tag
                  v-for="tag in template.tags"
                  :key="tag"
                  size="small"
                  type="info"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 策略编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="80%"
      destroy-on-close
    >
      <FormConfigurator
        v-if="dialogVisible"
        ref="formConfigurator"
        v-model="currentPolicy.formItems"
      />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import FormConfigurator from './components/FormConfigurator.vue'
import { getPolicyList, createPolicy, updatePolicy, deletePolicy } from '@/api/inspection'

// 策略列表
const policyList = ref([])
const activeTab = ref('list')
const dialogVisible = ref(false)
const dialogTitle = ref('新增策略')
const currentPolicy = ref({
  id: '',
  name: '',
  scene: '',
  deviceTypes: [],
  formItems: []
})
const formConfigurator = ref(null)

// 模板数据
const templates = ref([
  {
    id: 'tpl-001',
    name: '设备日常点检',
    description: '适用于设备日常点检场景，包含设备状态、温度等基础检查项',
    tags: ['设备检', '日常']
  },
  {
    id: 'tpl-002',
    name: '开工检查',
    description: '适用于生产开工前的检查，包含工单确认、首件检查等项',
    tags: ['开工检', '生产']
  }
])

// 场景标签类型
const sceneTagType = (scene) => {
  const types = {
    EQUIPMENT: 'success',
    STARTUP: 'warning',
    QUALITY: 'danger'
  }
  return types[scene] || ''
}

// 格式化场景显示
const formatScene = (scene) => {
  const scenes = {
    EQUIPMENT: '设备检',
    STARTUP: '开工检',
    QUALITY: '品质检'
  }
  return scenes[scene] || scene
}

// 获取策略列表
const fetchPolicyList = async () => {
  try {
    const res = await getPolicyList()
    policyList.value = res.data
  } catch (error) {
    console.error('获取策略列表失败:', error)
  }
}

// 新增策略
const handleAddPolicy = () => {
  currentPolicy.value = {
    id: '',
    name: '',
    scene: 'EQUIPMENT',
    deviceTypes: [],
    formItems: []
  }
  dialogTitle.value = '新增策略'
  dialogVisible.value = true
}

// 编辑策略
const handleEdit = (policy) => {
  currentPolicy.value = { ...policy }
  dialogTitle.value = '编辑策略'
  dialogVisible.value = true
}

// 删除策略
const handleDelete = async (policy) => {
  try {
    await deletePolicy(policy.id)
    await fetchPolicyList()
  } catch (error) {
    console.error('删除策略失败:', error)
  }
}

// 状态变更
const handleStatusChange = async (policy) => {
  try {
    await updatePolicy(policy)
  } catch (error) {
    console.error('更新策略状态失败:', error)
  }
}

// 使用模板
const handleUseTemplate = (template) => {
  currentPolicy.value = {
    id: '',
    name: template.name,
    scene: 'EQUIPMENT',
    deviceTypes: [],
    formItems: []
  }
  dialogTitle.value = `使用模板: ${template.name}`
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  try {
    if (currentPolicy.value.id) {
      await updatePolicy(currentPolicy.value)
    } else {
      await createPolicy(currentPolicy.value)
    }
    dialogVisible.value = false
    await fetchPolicyList()
  } catch (error) {
    console.error('保存策略失败:', error)
  }
}

onMounted(() => {
  fetchPolicyList()
})
</script>

<style scoped lang="scss">
.policy-config-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }
  }

  .template-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    padding: 10px 0;
  }

  .template-card {
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .template-content {
      h4 {
        margin: 0 0 8px;
        font-size: 16px;
      }

      p {
        margin: 0 0 12px;
        color: #666;
        font-size: 14px;
      }

      .template-tags {
        display: flex;
        gap: 6px;
      }
    }
  }
}
</style>
