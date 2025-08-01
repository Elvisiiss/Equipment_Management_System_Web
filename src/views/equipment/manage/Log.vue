
  状态维护
  │　├─ 3.1 状态列表（7类）
  │　├─ 3.2 手动切换
  │　└─ 3.3 自动切换日志
  <template>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>设备状态维护</span>
          <el-button type="primary" @click="openDialog">手动切换</el-button>
        </div>
      </template>

      <el-table :data="devices" border>
        <el-table-column prop="code"  label="设备编号"/>
        <el-table-column prop="state" label="当前状态">
          <template #default="{ row }">
            <el-tag :type="stateColor(row.state)">{{ row.state }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastUpdate" label="更新时间"/>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" @click="openDialog(row)">切换</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 弹窗 -->
      <el-dialog v-model="visible" :title="`切换状态 - ${current.code}`" width="380px">
        <el-form label-width="80px">
          <el-form-item label="目标状态">
            <el-select v-model="targetState" :disabled="!canSwitch(current.state)">
              <el-option v-for="s in states" :key="s" :label="s" :value="s"
                         :disabled="!canSwitch(current.state, s)"/>
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="visible=false">取消</el-button>
          <el-button type="primary" :disabled="!targetState" @click="doSwitch">确认</el-button>
        </template>
      </el-dialog>
    </el-card>
  </template>

  <script setup>
  import { ref, computed } from 'vue'
  import { ElMessage } from 'element-plus'

  const states = ['运行中', '宕机', '闲置', '无排程', '保养', '转机', '待生产部门确认']
  const rules = {
    '运行中':  ['宕机', '闲置', '无排程', '转机'],
    '宕机':    ['闲置', '待生产部门确认'],
    '闲置':    ['运行中', '保养', '无排程', '转机'],
    '无排程':  ['闲置', '运行中', '保养'],
    '保养':    ['闲置', '待生产部门确认'],
    '转机':    ['闲置', '运行中'],
    '待生产部门确认': ['闲置', '宕机']
  }

  const devices = ref([
    { code: 'EQ-001', state: '运行中', lastUpdate: '2025-08-01 10:20' },
    { code: 'EQ-002', state: '保养',   lastUpdate: '2025-08-01 09:15' }
  ])

  const visible   = ref(false)
  const current   = ref({})
  const targetState = ref('')

  function openDialog (row) {
    current.value = row
    targetState.value = ''
    visible.value = true
  }

  function canSwitch (from, to) {
    if (!to) return true
    return rules[from]?.includes(to) ?? false
  }

  function doSwitch () {
    if (!canSwitch(current.value.state, targetState.value)) {
      ElMessage.warning('不允许的切换')
      return
    }
    current.value.state = targetState.value
    current.value.lastUpdate = new Date().toLocaleString()
    visible.value = false
    ElMessage.success('状态已切换')
  }

  function stateColor (state) {
    const map = {
      '运行中': 'success',
      '宕机':   'danger',
      '闲置':   'info',
      '无排程': 'warning',
      '保养':   'primary',
      '转机':   'warning',
      '待生产部门确认': 'danger'
    }
    return map[state] || ''
  }
  </script>
