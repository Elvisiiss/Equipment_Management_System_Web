<!-- EquipmentStatus.vue -->
<template>
  <el-container>
    <el-header height="60px">
      <h2>设备实时监控与状态管理中心</h2>
    </el-header>

    <el-main>
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 实时监控 -->
<!--        <el-tab-pane label="实时监控" name="monitor">-->
<!--          <el-row :gutter="12">-->
<!--            <el-col-->
<!--                v-for="d in devices"-->
<!--                :key="d.id"-->
<!--                :span="6"-->
<!--                style="margin-bottom:16px"-->
<!--            >-->
<!--              <DeviceCard :device="d" @manual="manualSwitch" />-->
<!--            </el-col>-->
<!--          </el-row>-->
<!--        </el-tab-pane>-->

        <!-- 策略配置 -->
        <el-tab-pane label="策略配置" name="policy">
          <el-form label-width="220px" style="max-width:800px">
            <el-form-item label="系统启动后设备默认状态">
              <el-select v-model="policy.bootState">
                <el-option
                    v-for="s in statusList"
                    :key="s.value"
                    :label="s.label"
                    :value="s.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="产品变更报警">
              <el-switch v-model="policy.productChangeAlert" />
            </el-form-item>

            <el-form-item label="设备初始化原则">
              <el-radio-group v-model="policy.initRule">
                <el-radio label="none">不干预</el-radio>
                <el-radio label="idle">置为闲置</el-radio>
                <el-radio label="bootState">按"系统启动状态"处理</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="savePolicy">保存策略</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 规则管理 -->
        <el-tab-pane label="规则管理" name="rule">
          <el-table :data="rules" border>
            <el-table-column prop="from" label="源状态">
              <template #default="{ row }">
                {{ statusMap[row.from] }}
              </template>
            </el-table-column>
            <el-table-column prop="toList" label="允许切换到的状态">
              <template #default="{ row }">
                <el-tag
                    v-for="t in row.toList"
                    :key="t"
                    style="margin-right:4px"
                >{{ statusMap[t] }}</el-tag
                >
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ $index }">
                <el-button size="small" @click="editRule($index)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-dialog v-model="ruleDialog" title="编辑规则" width="400px">
            <el-form label-width="80px">
              <el-form-item label="源状态">
                <el-tag>{{ statusMap[editingRule.from] }}</el-tag>
              </el-form-item>
              <el-form-item label="允许到">
                <el-checkbox-group v-model="editingRule.toList">
                  <el-checkbox
                      v-for="s in statusList"
                      :key="s.value"
                      :label="s.value"
                      :disabled="s.value === editingRule.from"
                  >{{ s.label }}</el-checkbox
                  >
                </el-checkbox-group>
              </el-form-item>
            </el-form>
            <template #footer>
              <el-button @click="ruleDialog = false">取消</el-button>
              <el-button type="primary" @click="saveRule">确定</el-button>
            </template>
          </el-dialog>
        </el-tab-pane>

        <!-- 报警日志 -->
        <el-tab-pane label="报警日志" name="alert">
          <el-timeline>
            <el-timeline-item
                v-for="a in alerts"
                :key="a.id"
                :timestamp="a.time"
                :type="a.level"
            >
              {{ a.content }}
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
      </el-tabs>
    </el-main>
  </el-container>

  <!-- 语音广播 -->
  <audio ref="audioRef" src="/alert.mp3" preload="auto"></audio>
</template>

<script setup>
/* ---------------- 依赖 ---------------- */
import { ref, reactive, computed, nextTick } from 'vue'
import { ElNotification } from 'element-plus'

/* ---------------- 状态枚举 ---------------- */
const statusList = [
  { value: 'running', label: '运行中' },
  { value: 'down', label: '宕机' },
  { value: 'idle', label: '闲置' },
  { value: 'noSchedule', label: '无排程' },
  { value: 'maintenance', label: '保养' },
  { value: 'changeover', label: '转机' },
  { value: 'pending', label: '待生产部门确认' }
]
const statusMap = statusList.reduce((p, c) => ((p[c.value] = c.label), p), {})

/* ---------------- 实时设备 ---------------- */
const devices = ref([
  { id: 'M01', name: '注塑机-01', status: 'running', lastUpdate: Date.now() },
  { id: 'M02', name: '注塑机-02', status: 'idle', lastUpdate: Date.now() },
  { id: 'M03', name: '冲压机-01', status: 'down', lastUpdate: Date.now() }
])

/* 模拟实时推送 */
setInterval(() => {
  const d = devices.value[Math.floor(Math.random() * devices.value.length)]
  autoSwitch(d)
}, 5000)

/* ---------------- 策略 ---------------- */
const policy = reactive({
  bootState: 'idle',
  productChangeAlert: true,
  initRule: 'bootState'
})
function savePolicy() {
  addAlert('策略已更新', 'success')
}

/* ---------------- 规则 ---------------- */
const rules = ref([])
function initRules() {
  const defaultMap = {
    running: ['down', 'pending'],
    down: ['idle', 'maintenance', 'pending'],
    idle: ['running', 'down', 'maintenance', 'changeover', 'noSchedule'],
    noSchedule: ['idle'],
    maintenance: ['idle', 'pending'],
    changeover: ['running', 'idle'],
    pending: ['idle', 'running', 'down', 'maintenance', 'changeover']
  }
  rules.value = Object.entries(defaultMap).map(([from, toList]) => ({
    from,
    toList
  }))
}
initRules()

function canSwitch(from, to) {
  const r = rules.value.find(r => r.from === from)
  return r && r.toList.includes(to)
}

/* ---------------- 规则编辑弹窗 ---------------- */
const ruleDialog = ref(false)
const editingRule = reactive({ from: '', toList: [] })
function editRule(index) {
  const r = rules.value[index]
  editingRule.from = r.from
  editingRule.toList = [...r.toList]
  ruleDialog.value = true
}
function saveRule() {
  const r = rules.value.find(r => r.from === editingRule.from)
  if (r) r.toList = [...editingRule.toList]
  ruleDialog.value = false
  addAlert(`规则 ${statusMap[editingRule.from]} 已更新`, 'success')
}

/* ---------------- 状态切换 ---------------- */
function manualSwitch(device, to) {
  if (!canSwitch(device.status, to)) {
    ElNotification.error(
        `不允许从 ${statusMap[device.status]} 切换到 ${statusMap[to]}`
    )
    return
  }
  device.status = to
  device.lastUpdate = Date.now()
  addAlert(
      `设备 ${device.name} 手动切换为 ${statusMap[to]}`,
      'warning',
      true
  )
  linkage(device, to)
}

function autoSwitch(device) {
  const candidates = rules.value.find(r => r.from === device.status)?.toList
  if (!candidates || !candidates.length) return
  const to = candidates[Math.floor(Math.random() * candidates.length)]
  if (!canSwitch(device.status, to)) return
  device.status = to
  device.lastUpdate = Date.now()
  addAlert(
      `设备 ${device.name} 自动切换为 ${statusMap[to]}`,
      'info',
      true
  )
  linkage(device, to)
}

function linkage(srcDev, to) {
  const prefix = srcDev.id.slice(0, 2)
  devices.value.forEach(d => {
    if (d.id !== srcDev.id && d.id.startsWith(prefix)) {
      if (canSwitch(d.status, to)) {
        d.status = to
        d.lastUpdate = Date.now()
        addAlert(`联动：${d.name} -> ${statusMap[to]}`, 'info')
      }
    }
  })
}

/* ---------------- 报警 ---------------- */
const alerts = ref([])
const audioRef = ref(null)
function addAlert(content, level = 'info', broadcast = false) {
  const id = Date.now() + Math.random()
  alerts.value.unshift({ id, content, time: new Date().toLocaleString(), level })
  // ElNotification({ title: '提示', message: content, type: level })
  if (broadcast && policy.productChangeAlert) {   //启用了 productChangeAlert，会播放音频提醒（alert.mp3）。
    nextTick(() => audioRef.value?.play().catch(() => {}))
  }
}

/* ---------------- Tab 控制 ---------------- */
const activeTab = ref('monitor')

/* ---------------- 子组件：DeviceCard ---------------- */
const statusColor = {
  running: 'success',
  down: 'danger',
  idle: '',
  noSchedule: 'info',
  maintenance: 'warning',
  changeover: 'warning',
  pending: ''
}

const DeviceCard = {
  props: ['device'],
  emits: ['manual'],
  setup(props, { emit }) {
    const statusMap = {
      running: '运行中',
      down: '宕机',
      idle: '闲置',
      noSchedule: '无排程',
      maintenance: '保养',
      changeover: '转机',
      pending: '待生产部门确认'
    }
    const statusColor = {
      running: 'success',
      down: 'danger',
      idle: '',
      noSchedule: 'info',
      maintenance: 'warning',
      changeover: 'warning',
      pending: ''
    }
    return { statusMap, statusColor, emit }
  },
  template: `
    <el-card
      :body-style="{ padding: '12px' }"
      shadow="hover"
      :class="'device-'+device.status"
    >
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span>{{ device.name }}</span>
        <el-tag :type="statusColor[device.status]">
          {{ statusMap[device.status] }}
        </el-tag>
      </div>
      <div style="font-size:12px;color:#999;margin-top:6px">
        更新：{{ new Date(device.lastUpdate).toLocaleTimeString() }}
      </div>

      <el-divider style="margin:8px 0" />

      <div style="display:flex;flex-wrap:wrap;gap:4px">
        <el-button
          v-for="s in [
            { value: 'running', label: '运行中' },
            { value: 'down', label: '宕机' },
            { value: 'idle', label: '闲置' },
            { value: 'noSchedule', label: '无排程' },
            { value: 'maintenance', label: '保养' },
            { value: 'changeover', label: '转机' },
            { value: 'pending', label: '待生产部门确认' }
          ]"
          :key="s.value"
          size="small"
          :disabled="!$parent.canSwitch(device.status, s.value)"
          @click="$emit('manual', device, s.value)"
        >
          到{{ s.label }}
        </el-button>
      </div>
    </el-card>
  `
}
</script>

<style scoped>
.device-running {
  border-left: 4px solid #67c23a;
}
.device-down {
  border-left: 4px solid #f56c6c;
}
.device-maintenance,
.device-changeover {
  border-left: 4px solid #e6a23c;
}
</style>
