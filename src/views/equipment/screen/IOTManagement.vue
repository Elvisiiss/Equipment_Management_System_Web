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
            <div class="info-item"><span class="label">车间：</span>{{ device.workshop }}</div>
            <div class="info-item"><span class="label">产线：</span>{{ device.line }}</div>
            <div class="info-item"><span class="label">工段：</span>{{ device.section }}</div>
            <div class="info-item"><span class="label">设备型号：</span>{{ device.model }}</div>
            <div class="info-item"><span class="label">厂商：</span>{{ device.vendor }}</div>
            <div class="info-item"><span class="label">进场日期：</span>{{ device.inDate }}</div>
            <div class="info-item"><span class="label">责任工程师：</span>{{ device.owner }}</div>
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
        <el-col :span="12" class="rate-left">
          <div class="rate-date">
            <el-date-picker v-model="rateDate" type="date" placeholder="选择日期"/>
            <el-select v-model="rateShift" style="margin-left:8px">
              <el-option label="全部" value="all"/>
              <el-option label="白班" value="day"/>
              <el-option label="晚班" value="night"/>
            </el-select>
          </div>

          <div class="rate-box">
            <div class="ring-wrapper">
              <div class="ring" :style="ringStyle(85)"></div>
              <div class="ring-center">
                <div class="big">85%</div>
                <div class="small">总稼动率</div>
              </div>
            </div>

            <div class="ring-wrapper">
              <div class="ring" :style="ringStyle(75)"></div>
              <div class="ring-center">
                <div class="big">75%</div>
                <div class="small">净稼动率</div>
              </div>
            </div>
          </div>
        </el-col>

        <!-- 右侧 状态饼图 + 表格 -->
        <el-col :span="12" class="rate-right">
          <!-- 状态饼图 -->
          <div class="big-ring">
            <div class="ring" :style="multiRingStyle"></div>
            <div class="ring-center">
              <div class="big">60%</div>
              <div class="sub">进行 60%</div>
              <div class="sub">待机 15%</div>
              <div class="sub">报警 15%</div>
              <div class="sub">离线 10%</div>
            </div>
          </div>

          <!-- 状态表格 -->
          <el-table :data="stateTable" stripe style="margin-top:12px">
            <el-table-column prop="state" label="状态"/>
            <el-table-column prop="time" label="时间(h)"/>
            <el-table-column prop="percent" label="比例(%)"/>
          </el-table>
        </el-col>
      </el-row>
    </el-card>

    <!-- ================= 第四行：时间轴 ================= -->
    <el-card>
      <div class="timeline-header">
        <span>设备状态时间轴</span>
        <div>
          <el-date-picker v-model="timelineDate" type="date"/>
          <el-select v-model="timelineStart" style="margin-left:8px">
            <el-option label="7:30" value="7:30"/>
            <el-option label="0:00" value="0:00"/>
          </el-select>
        </div>
      </div>

      <div class="timeline-wrapper">
        <div
            v-for="(item,i) in timelineData"
            :key="i"
            class="timeline-node"
        >
          <div class="time">{{item.time}}</div>
          <div class="bar" :style="{width:item.percent+'%',backgroundColor:item.color}"></div>
          <div class="percent">{{item.percent}}%</div>
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
  workshop:'车间A',
  line:'产线1',
  section:'装配工段',
  model:'CXK-450',
  vendor:'某某机床有限公司',
  inDate:'2023-06-01',
  owner:'张三',
  qrText:'设备编码：EQ-20230601001\n设备名称：设备A'
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
  { state:'进行', time:'14.4', percent:60 },
  { state:'待机', time:'3.6',  percent:15 },
  { state:'报警', time:'3.6',  percent:15 },
  { state:'离线', time:'2.4',  percent:10 }
]
/* 环形进度条：单值 */
function ringStyle(percent){
  return {
    background:`conic-gradient(#409eff 0% ${percent}%, #e9ecef ${percent}% 100%)`
  }
}
/* 多色状态饼图 */
const multiRingStyle = computed(()=>{
  /* 进行 60 待机 15 报警 15 离线 10 */
  return {
    background:`conic-gradient(
      #67c23a 0% 60%,
      #909399 60% 75%,
      #e6a23c 75% 90%,
      #f56c6c 90% 100%)`
  }
})

/* 第四行时间轴 */
const timelineDate = ref(new Date())
const timelineStart = ref('7:30')
const timelineData = Array.from({length:24}, (_,i)=>({
  time:`${i.toString().padStart(2,'0')}:00`,
  percent:Math.floor(Math.random()*100),
  color:['#67c23a','#909399','#e6a23c','#f56c6c'][i%4]
}))

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
  font-size:24px;
  font-weight:bold;
  color:#409eff;
}
.small{
  font-size:12px;
  color:#606266;
}

/* 大状态饼图 */
.big-ring{
  position:relative;
  width:180px;
  height:180px;
  margin:0 auto;
}
.sub{
  font-size:12px;
  color:#606266;
  margin-top:2px;
}

/* 第四行 时间轴 */
.timeline-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:12px;
}
.timeline-wrapper{
  display:flex;
  overflow-x:auto;
}
.timeline-node{
  flex:0 0 4.166%;
  text-align:center;
  padding:4px;
  font-size:12px;
}
.bar{
  height:8px;
  margin:4px auto;
  border-radius:2px;
}
.percent{
  font-weight:bold;
}
</style>
