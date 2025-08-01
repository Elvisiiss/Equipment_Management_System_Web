<template>
  <div class="repair-config">
    <div class="page-header">
      <h2>维修配置管理</h2>
    </div>

    <el-tabs v-model="activeTab" type="border-card">
      <!-- 故障升级配置 -->
      <el-tab-pane label="故障升级配置" name="escalation">
        <div class="config-section">
          <div class="section-header">
            <h3>升级规则设置</h3>
            <el-button type="primary" @click="addEscalationRule">新增规则</el-button>
          </div>

          <el-table :data="escalationRules" border>
            <el-table-column prop="level" label="升级级别" width="100">
              <template #default="{ row }">
                <el-tag :type="levelColors[row.level-1]">级别 {{ row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="delay" label="延迟时间(分钟)" width="120" />
            <el-table-column label="通知方式">
              <template #default="{ row }">
                <el-tag v-for="type in row.notifyType" :key="type" size="small" style="margin-right: 5px">
                  {{ notifyTypeMap[type] }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="recipients" label="通知人员">
              <template #default="{ row }">
                <span>{{ row.recipients.join('、') }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row, $index }">
                <el-button type="primary" size="small" @click="editEscalationRule(row, $index)">
                  编辑
                </el-button>
                <el-button type="danger" size="small" @click="deleteEscalationRule($index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 工单类型配置 -->
      <el-tab-pane label="工单类型配置" name="types">
        <div class="config-section">
          <div class="section-header">
            <h3>维修类型设置</h3>
            <el-button type="primary" @click="addRepairType">添加类型</el-button>
          </div>

          <el-table :data="repairTypes" border>
            <el-table-column prop="name" label="类型名称" />
            <el-table-column prop="description" label="描述" />
            <el-table-column label="操作" width="100">
              <template #default="{ $index }">
                <el-button type="danger" size="small" @click="deleteRepairType($index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="config-section">
          <div class="section-header">
            <h3>优先级设置</h3>
            <el-button type="primary" @click="addPriorityLevel">添加级别</el-button>
          </div>

          <el-table :data="priorityLevels" border>
            <el-table-column prop="name" label="优先级名称" />
            <el-table-column prop="color" label="颜色">
              <template #default="{ row }">
                <el-color-picker v-model="row.color" disabled />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ $index }">
                <el-button type="danger" size="small" @click="deletePriorityLevel($index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 通知渠道配置 -->
      <el-tab-pane label="通知渠道配置" name="channels">
        <div class="config-section">
          <h3>通知渠道管理</h3>
          <el-form :model="channelConfig" label-width="120px">
            <el-form-item label="APP推送">
              <el-switch v-model="channelConfig.app.enabled" />
              <el-input v-if="channelConfig.app.enabled" v-model="channelConfig.app.config" placeholder="配置信息" style="margin-left: 20px; width: 300px" />
            </el-form-item>

            <el-form-item label="企业微信">
              <el-switch v-model="channelConfig.wechat.enabled" />
              <el-input v-if="channelConfig.wechat.enabled" v-model="channelConfig.wechat.webhook" placeholder="Webhook地址" style="margin-left: 20px; width: 300px" />
            </el-form-item>

            <el-form-item label="邮件通知">
              <el-switch v-model="channelConfig.email.enabled" />
              <el-input v-if="channelConfig.email.enabled" v-model="channelConfig.email.smtp" placeholder="SMTP服务器" style="margin-left: 20px; width: 300px" />
            </el-form-item>

            <el-form-item label="声光报警">
              <el-switch v-model="channelConfig.soundLight.enabled" />
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 升级规则对话框 -->
    <el-dialog
        v-model="escalationDialog.visible"
        :title="escalationDialog.title"
        width="500px"
        @close="closeEscalationDialog"
    >
      <el-form :model="escalationForm" label-width="100px">
        <el-form-item label="升级级别">
          <el-input-number v-model="escalationForm.level" :min="1" :max="5" />
        </el-form-item>
        <el-form-item label="延迟时间(分钟)">
          <el-input-number v-model="escalationForm.delay" :min="5" :step="5" />
        </el-form-item>
        <el-form-item label="通知方式">
          <el-checkbox-group v-model="escalationForm.notifyType">
            <el-checkbox label="app">APP</el-checkbox>
            <el-checkbox label="email">邮件</el-checkbox>
            <el-checkbox label="wechat">企业微信</el-checkbox>
            <el-checkbox label="sound">声光</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="通知人员">
          <el-select v-model="escalationForm.recipients" multiple style="width: 100%">
            <el-option label="张三" value="张三" />
            <el-option label="李四" value="李四" />
            <el-option label="王经理" value="王经理" />
            <el-option label="李主管" value="李主管" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeEscalationDialog">取消</el-button>
        <el-button type="primary" @click="saveEscalationRule">保存</el-button>
      </template>
    </el-dialog>

    <!-- 保存配置按钮 -->
    <div class="footer-actions">
      <el-button type="primary" size="large" @click="saveConfig">
        保存所有配置
      </el-button>
      <el-button @click="resetConfig">恢复默认</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import repairAPI from '@/api/repairB.js'

const activeTab = ref('escalation')

// 配置数据
const escalationRules = ref([])
const repairTypes = ref([])
const priorityLevels = ref([])
const channelConfig = reactive({
  app: { enabled: true, config: '' },
  wechat: { enabled: true, webhook: '' },
  email: { enabled: true, smtp: '' },
  soundLight: { enabled: true }
})

// 对话框数据
const escalationDialog = reactive({
  visible: false,
  title: '',
  isEdit: false,
  editIndex: -1
})

const escalationForm = reactive({
  level: 1,
  delay: 30,
  notifyType: [],
  recipients: []
})

const levelColors = ['success', 'info', 'warning', 'danger', 'danger']
const notifyTypeMap = {
  app: 'APP',
  email: '邮件',
  wechat: '企业微信',
  sound: '声光'
}

// 加载配置
const loadConfig = async () => {
  try {
    const res = await repairAPI.getConfig()
    if (res.success) {
      escalationRules.value = res.data.escalationRules || []
      repairTypes.value = [
        { name: '自叫维修', description: '设备自动报警触发的维修' },
        { name: '手叫维修', description: '人工手动发起的维修' },
        ...res.data.repairTypes?.map(t => ({ name: t, description: '' })) || []
      ]
      priorityLevels.value = res.data.priorityLevels?.map((p, i) => ({
        name: p,
        color: ['#67C23A', '#E6A23C', '#F56C6C', '#909399'][i] || '#909399'
      })) || []
    }
  } catch (error) {
    console.error('加载配置失败', error)
  }
}

// 升级规则操作
const addEscalationRule = () => {
  escalationDialog.title = '新增升级规则'
  escalationDialog.isEdit = false
  escalationDialog.editIndex = -1
  Object.assign(escalationForm, {
    level: escalationRules.value.length + 1,
    delay: 30,
    notifyType: ['app'],
    recipients: []
  })
  escalationDialog.visible = true
}

const editEscalationRule = (row, index) => {
  escalationDialog.title = '编辑升级规则'
  escalationDialog.isEdit = true
  escalationDialog.editIndex = index
  Object.assign(escalationForm, row)
  escalationDialog.visible = true
}

const deleteEscalationRule = (index) => {
  ElMessageBox.confirm('确认删除此规则？', '提示', {
    type: 'warning'
  }).then(() => {
    escalationRules.value.splice(index, 1)
    ElMessage.success('删除成功')
  })
}

const saveEscalationRule = () => {
  if (escalationDialog.isEdit) {
    escalationRules.value[escalationDialog.editIndex] = { ...escalationForm }
  } else {
    escalationRules.value.push({ ...escalationForm })
  }
  closeEscalationDialog()
  ElMessage.success('保存成功')
}

const closeEscalationDialog = () => {
  escalationDialog.visible = false
}

// 维修类型操作
const addRepairType = () => {
  ElMessageBox.prompt('请输入维修类型名称', '添加类型', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(({ value }) => {
    if (value) {
      repairTypes.value.push({ name: value, description: '' })
      ElMessage.success('添加成功')
    }
  })
}

const deleteRepairType = (index) => {
  ElMessageBox.confirm('确认删除此类型？', '提示', {
    type: 'warning'
  }).then(() => {
    repairTypes.value.splice(index, 1)
    ElMessage.success('删除成功')
  })
}

// 优先级操作
const addPriorityLevel = () => {
  ElMessageBox.prompt('请输入优先级名称', '添加级别', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(({ value }) => {
    if (value) {
      const color = ['#67C23A', '#E6A23C', '#F56C6C', '#909399'][priorityLevels.value.length] || '#909399'
      priorityLevels.value.push({ name: value, color })
      ElMessage.success('添加成功')
    }
  })
}

const deletePriorityLevel = (index) => {
  ElMessageBox.confirm('确认删除此级别？', '提示', {
    type: 'warning'
  }).then(() => {
    priorityLevels.value.splice(index, 1)
    ElMessage.success('删除成功')
  })
}

// 保存和重置配置
const saveConfig = async () => {
  try {
    const config = {
      escalationRules: escalationRules.value,
      repairTypes: repairTypes.value.map(t => t.name),
      priorityLevels: priorityLevels.value.map(p => p.name),
      channelConfig
    }
    await repairAPI.updateConfig(config)
    ElMessage.success('配置保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const resetConfig = () => {
  ElMessageBox.confirm('确认恢复默认配置？此操作不可撤销', '警告', {
    type: 'warning'
  }).then(() => {
    loadConfig()
    ElMessage.success('已恢复默认配置')
  })
}

onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.repair-config {
  padding: 20px;
}

.config-section {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.footer-actions {
  margin-top: 30px;
  text-align: center;
}

.footer-actions .el-button {
  margin: 0 10px;
}

.knowledge-card {
  margin-bottom: 20px;
}

.type-tag {
  font-size: 12px;
  padding: 2px 8px;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 4px;
}

.view-count {
  font-size: 12px;
  color: #999;
}

.meta-info span {
  margin-right: 20px;
}
</style>
