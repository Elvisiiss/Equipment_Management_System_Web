<template>
  <div class="page">
    <!-- ================= 第一行：查询条件 ================= -->
    <el-row :gutter="16" class="query-row">
      <el-col :span="8">
        <el-select v-model="query.workshop" placeholder="车间" clearable style="width:100%">
          <el-option label="车间A" value="A"/>
          <el-option label="车间B" value="B"/>
        </el-select>
      </el-col>
      <el-col :span="8">
        <el-select v-model="query.line" placeholder="产线" clearable style="width:100%">
          <el-option label="产线1" value="1"/>
          <el-option label="产线2" value="2"/>
        </el-select>
      </el-col>
      <el-col :span="8">
        <el-input v-model="query.deviceName" placeholder="设备名称" clearable/>
      </el-col>
    </el-row>

    <!-- ================= 第二行：设备主信息 ================= -->
    <el-card>
      <el-row :gutter="20" align="middle">
        <!-- 1. 设备图 -->
        <el-col :span="6">
          <el-image
              src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              fit="cover"
              style="width:100%;height:180px;border-radius:6px"
          />
        </el-col>

        <!-- 2. 关键信息 一行排列 -->
        <el-col :span="12">
          <div class="info-row">
            <div class="info-item"><span class="label">状态：</span>{{ device.status }}</div>
            <div class="info-item"><span class="label">设备编码：</span>{{ device.code }}</div>
            <div class="info-item"><span class="label">设备名称：</span>{{ device.name }}</div>
            <div class="info-item"><span class="label">设备类别：</span>{{ device.type }}</div>
            <div class="info-item"><span class="label">型号：</span>{{ device.model }}</div>
            <div class="info-item"><span class="label">区域名称：</span>{{ device.area }}</div>
            <div class="info-item"><span class="label">厂商：</span>{{ device.vendor }}</div>
            <div class="info-item"><span class="label">责任人：</span>{{ device.owner }}</div>
            <div class="info-item"><span class="label">进场日期：</span>{{ device.inDate }}</div>
          </div>
        </el-col>

        <!-- 3. 二维码 -->
        <el-col :span="6" class="qr-zone">
          <div ref="qrRef">
            <vue-qr :text="device.qrText" :size="160"/>
          </div>
          <el-button @click="downloadQR" style="margin-top:12px">导出二维码</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- ================= 第三行：稼动率卡片 ================= -->
    <el-card>
      <el-row :gutter="20">
        <!-- 左侧 总稼动率 & 净稼动率 -->
        <el-col :span="8" class="rate-left">
          <div class="rate-date">
            <el-date-picker v-model="rateDate" type="date" placeholder="选择日期"/>
            <el-select v-model="rateShift" style="margin-left:8px">
              <el-option label="全部" value="all"/>
              <el-option label="白班" value="day"/>
              <el-option label="晚班" value="night"/>
            </el-select>
          </div>

          <div class="rate-box">
            <!-- 总稼动率 -->
            <div class="ring-wrapper">
              <div class="ring" :style="ringStyle(63.64)"></div>
              <div class="ring-center">
                <div class="big">63.64%</div>
                <div class="small">运行时间/开机时间</div>
              </div>
            </div>

            <!-- 净解决率 -->
            <div class="ring-wrapper">
              <div class="ring" :style="ringStyle(100)"></div>
              <div class="ring-center">
                <div class="big">100%</div>
                <div class="small">运行时间/开机时间-交接班计划停机</div>
              </div>
            </div>
          </div>
        </el-col>

        <!-- 中间 状态饼图 -->
        <el-col :span="8" class="rate-middle">
          <div class="big-ring">
            <div class="ring" :style="multiRingStyle"></div>
            <div class="ring-center">
              <div class="big">状态分布</div>
              <div class="sub running">运行 31.22%</div>
              <div class="sub standby">待机 27.78%</div>
              <div class="sub offline">离线 0%</div>
              <div class="sub fault">故障 0%</div>
            </div>
          </div>
        </el-col>

        <!-- 右侧 状态表格 -->
        <el-col :span="8" class="rate-right">
          <el-table :data="stateTable" stripe style="width:100%">
            <el-table-column prop="state" label="状态" width="80"/>
            <el-table-column prop="time" label="时间"/>
            <el-table-column prop="percent" label="比例(%)"/>
          </el-table>
        </el-col>
      </el-row>
    </el-card>

    <!-- ================= 第四行：时间块图 ================= -->
    <el-card>
      <div class="timeline-header">
        <span>设备状态时间分布</span>
        <div>
          <el-date-picker v-model="timelineDate" type="date"/>
          <el-select v-model="timelineStart" style="margin-left:8px">
            <el-option label="7:30" value="7:30"/>
            <el-option label="0:00" value="0:00"/>
          </el-select>
        </div>
      </div>

      <!-- 时间块图 -->
      <div class="time-block-chart">
        <!-- 时间刻度 -->
        <div class="time-scale">
          <div v-for="time in timeScale" :key="time" class="time-tick">
            {{ time }}
          </div>
        </div>

        <!-- 状态图例 -->
        <div class="state-legend">
          <div v-for="state in stateTypes" :key="state.value" class="legend-item">
            <div class="color-box" :style="{backgroundColor: state.color}"></div>
            <span>{{ state.label }}</span>
          </div>
        </div>

        <!-- 时间块图主体 -->
        <div class="time-blocks">
          <div
              v-for="(block, index) in timeBlockData"
              :key="index"
              class="time-block"
              :style="{
              left: block.startPercent + '%',
              width: block.widthPercent + '%',
              backgroundColor: block.color
            }"
              :title="`${block.stateLabel}: ${block.startTime} - ${block.endTime}`"
          ></div>
        </div>
      </div>
    </el-card>

    <!-- ================= 第五行：预警 / 推送 ================= -->
    <el-card>
      <el-tabs v-model="activeTable" type="card">
        <el-tab-pane label="预警" name="warning">
          <el-table :data="warningTable" stripe>
            <el-table-column prop="index" label="序号" width="60"/>
            <el-table-column prop="param" label="参数名称"/>
            <el-table-column prop="value" label="当前值"/>
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-tag :type="scope.row.statusType">{{scope.row.status}}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="upper" label="上限"/>
            <el-table-column prop="lower" label="下限"/>
            <el-table-column prop="unit" label="单位"/>
            <el-table-column prop="updateTime" label="更新时间"/>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="推送" name="push">
          <el-table :data="pushTable" stripe>
            <el-table-column prop="index" label="序号" width="60"/>
            <el-table-column prop="param" label="参数名称"/>
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-tag :type="scope.row.statusType">{{scope.row.status}}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="时间"/>
            <el-table-column prop="desc" label="事项"/>
            <el-table-column prop="sender" label="推送人"/>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import VueQr from 'vue-qr/src/packages/vue-qr.vue'

/* 查询条件 */
const query = ref({ workshop:'', line:'', deviceName:'' })

/* 设备主信息 */
const device = ref({
  status:'运行中',
  code:'C4-51-12',
  name:'自动贴片机',
  type:'贴片设备',
  model:'TPJ-5000',
  area:'C4车间 / 51产线 / 贴片工段',
  vendor:'三星电子',
  owner:'张工',
  inDate:'2023-06-15',
  qrText:'设备编码：C4-51-12\n设备名称：自动贴片机'
})

/* 二维码导出 */
const qrRef = ref()
function downloadQR(){
  const canvas = qrRef.value.querySelector('canvas')
  const url = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = 'device-qr.png'
  a.click()
}

/* 第三行稼动率 */
const rateDate = ref(new Date())
const rateShift = ref('all')
const stateTable = [
  { state:'运行', time:'27分41秒', percent:'31.22' },
  { state:'待机', time:'2小时19分49秒', percent:'27.78' },
  { state:'闲置', time:'0', percent:'0' },
  { state:'离线', time:'0', percent:'0' }
]
/* 环形进度条：单值 */
function ringStyle(percent){
  return {
    background:`conic-gradient(#409eff 0% ${percent}%, #e9ecef ${percent}% 100%)`
  }
}
/* 多色状态饼图 */
const multiRingStyle = computed(()=>{
  /* 运行 31.22 待机 27.78 离线 0 故障 0 */
  return {
    background:`conic-gradient(
      #67c23a 0% 31.22%,
      #e6a23c 31.22% 59%,
      #f56c6c 59% 59%,
      #909399 59% 100%)`
  }
})

/* 第四行时间块图 */
const timelineDate = ref(new Date())
const timelineStart = ref('7:30')

// 定义状态类型和颜色
const stateTypes = ref([
  { value: 'running', label: '运行中', color: '#67c23a' },
  { value: 'standby', label: '待机', color: '#909399' },
  { value: 'fault', label: '故障', color: '#e6a23c' },
  { value: 'offline', label: '离线', color: '#f56c6c' }
])

// 时间刻度 (07:30 - 18:30)
const timeScale = computed(() => {
  const times = []
  for (let i = 7; i <= 18; i++) {
    if (i === 7) {
      times.push('07:30')
    } else {
      times.push(`${i.toString().padStart(2, '0')}:00`)
    }
  }
  times.push('18:30')
  return times
})

// 生成模拟的时间块数据
const timeBlockData = computed(() => {
  const blocks = []
  const startMinutes = 7 * 60 + 30 // 07:30
  const endMinutes = 18 * 60 + 30 // 18:30
  const totalMinutes = endMinutes - startMinutes

  // 生成随机状态块
  let currentTime = startMinutes
  while (currentTime < endMinutes) {
    const stateIndex = Math.floor(Math.random() * stateTypes.value.length)
    const state = stateTypes.value[stateIndex]

    // 随机生成本次状态的持续时间 (15-120分钟)
    const duration = Math.floor(Math.random() * 105) + 15
    const endTime = Math.min(currentTime + duration, endMinutes)

    const startPercent = ((currentTime - startMinutes) / totalMinutes) * 100
    const widthPercent = ((endTime - currentTime) / totalMinutes) * 100

    // 格式化时间显示
    const formatTime = (minutes) => {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
    }

    blocks.push({
      state: state.value,
      stateLabel: state.label,
      color: state.color,
      startTime: formatTime(currentTime),
      endTime: formatTime(endTime),
      startPercent: startPercent,
      widthPercent: widthPercent
    })

    currentTime = endTime
  }

  return blocks
})

/* 第五行表格 */
const activeTable = ref('warning')
const warningTable = [
  { index:1, param:'温度', value:'85', status:'超上限', statusType:'danger', upper:80, lower:20, unit:'℃', updateTime:'2025-08-19 09:30' },
  { index:2, param:'压力', value:'0.2', status:'超下限', statusType:'warning', upper:1.0, lower:0.5, unit:'MPa', updateTime:'2025-08-19 09:32' }
]
const pushTable = [
  { index:1, param:'温度', status:'已推送', statusType:'success', time:'2025-08-19 09:31', desc:'温度超过上限，可能导致设备过热', sender:'系统' },
  { index:2, param:'压力', status:'未推送', statusType:'info', time:'2025-08-19 09:33', desc:'压力低于下限，可能影响产品质量', sender:'设备负责人' }
]
</script>

<style scoped>
.page{
  padding:16px;
  background:#f5f7fa;
}
.query-row{
  margin-bottom:16px;
}
.el-card{
  margin-bottom:16px;
}

/* 第二行 一行排列关键信息 */
.info-row{
  display:flex;
  flex-wrap:wrap;
  gap:16px 32px;
  font-size:14px;
}
.info-item .label{
  font-weight:bold;
  color:#333;
}

/* 第三行 环形饼图 */
.rate-left{
  display:flex;
  flex-direction:column;
}
.rate-date{
  margin-bottom:12px;
}
.rate-box{
  display:flex;
  gap:40px;
  align-items:center;
  justify-content: center;
}
.ring-wrapper{
  position:relative;
  width:120px;
  height:120px;
}
.ring{
  width:100%;
  height:100%;
  border-radius:50%;
}
.ring-center{
  position:absolute;
  top:50%;
  left:50%;
  transform:translate(-50%,-50%);
  text-align:center;
}
.big{
  font-size:20px;
  font-weight:bold;
  color:#409eff;
}
.small{
  font-size:10px;
  color:#606266;
  margin-top:4px;
  line-height:1.2;
}

/* 中间区域饼图 */
.rate-middle {
  display: flex;
  justify-content: center;
  align-items: center;
}
.big-ring{
  position:relative;
  width:180px;
  height:180px;
}
.ring-center .big {
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}
.sub{
  font-size:12px;
  color:#606266;
  margin-top:2px;
}
.running {
  color: #67c23a;
}
.standby {
  color: #e6a23c;
}
.offline {
  color: #f56c6c;
}
.fault {
  color: #909399;
}

/* 右侧表格区域 */
.rate-right {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 第四行 时间块图 */
.timeline-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:12px;
}

/* 时间块图样式 */
.time-block-chart {
  position: relative;
  margin-top: 20px;
}

.time-scale {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 12px;
  color: #606266;
}

.time-tick {
  flex: 1;
  text-align: center;
}

.state-legend {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.color-box {
  width: 16px;
  height: 16px;
  margin-right: 6px;
  border-radius: 3px;
}

.time-blocks {
  position: relative;
  height: 40px;
  background-color: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
}

.time-block {
  position: absolute;
  height: 100%;
  transition: all 0.3s;
  cursor: pointer;
}

.time-block:hover {
  opacity: 0.8;
  transform: scaleY(1.1);
}
</style>
