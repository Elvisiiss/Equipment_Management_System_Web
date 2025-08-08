<template>
  <div class="dashboard">
    <!-- 顶部栏 -->
    <div class="header">
      <span class="title">设备状态看板</span>
      <span class="time">{{ now }}</span>

      <el-select v-model="workshop" size="small" style="width:120px;margin-left:16px">
        <el-option label="全部" value="全部"/>
        <el-option label="C4前段01-11" value="C4前段01-11"/>
      </el-select>

      <el-button size="small" @click="openFieldDialog=true" style="margin-left:auto">设定字段</el-button>
      <el-button size="small" @click="openDeviceDialog=true">设定稼动率设备</el-button>
    </div>

    <!-- 统计栏 -->
    <div class="summary">
      <div>车间：<span>{{ workshop }}</span></div>
      <div>总稼动率：<span class="blue">{{ totalRate }}%</span></div>
      <div>自定义设备稼动率：<span class="blue">{{ customRate }}%</span></div>
    </div>

    <!-- 状态卡片 -->
    <div class="status-row">
      <div class="status-card run" @click="filterStatus='运行'">
        <div class="icon"><Monitor /></div>
        <div class="text">运行</div>
        <div class="num">{{ runCount }}</div>
      </div>

      <div class="status-card standby" @click="filterStatus='待机'">
        <div class="icon"><VideoPause /></div>
        <div class="text">待机</div>
        <div class="num">{{ standbyCount }}</div>
      </div>

      <div class="status-card alarm" @click="filterStatus='报警'">
        <div class="icon"><Warning /></div>
        <div class="text">报警</div>
        <div class="num">{{ alarmCount }}</div>
      </div>

      <div class="status-card offline" @click="filterStatus='离线'">
        <div class="icon"><SwitchButton /></div>
        <div class="text">离线</div>
        <div class="num">{{ offlineCount }}</div>
      </div>
    </div>

    <!-- 设备卡片单行 -->
    <div class="device-row" v-if="filterStatus">
      <div
          :class="['device-card', filterStatus]"
          v-for="dev in filteredList"
          :key="dev.code">
        <div class="dev-name">{{ dev.code }}</div>
        <div class="dev-rate">{{ dev.rate }}</div>
        <div>停机：{{ dev.down }}</div>
        <div>运行：{{ dev.run }}</div>
        <div>产量：{{ dev.output }}</div>
        <div>类型：{{ dev.type }}</div>
      </div>
    </div>

    <!-- 1. 设定字段弹窗 -->
    <el-dialog v-model="openFieldDialog" title="设定字段" width="680px" top="5vh">
      <el-table :data="fieldTable" max-height="60vh" border>
        <el-table-column label="是否展示" width="90">
          <template #default="scope">
            <el-checkbox v-model="scope.row.show"/>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="字段名称" width="220"/>
        <el-table-column label="自定义标题">
          <template #default="scope">
            <el-input v-model="scope.row.label" size="small"/>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 2. 配置自定义稼动率设备弹窗 -->
    <el-dialog v-model="openDeviceDialog" title="配置自定义稼动率设备" width="540px" top="8vh">
      <div style="margin-bottom:8px;font-size:13px;color:#666">
        已选中 {{ selectedDevice.length }} 台（最多50）
      </div>
      <el-transfer
          v-model="selectedDevice"
          :data="allDeviceOptions"
          filterable
          :titles="['全部设备','已选设备']"
          style="width:100%"/>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Monitor, VideoPause, Warning, SwitchButton } from '@element-plus/icons-vue'

/* ---------- 顶部信息 ---------- */
const now = new Date().toLocaleString('zh-CN', {
  year:'numeric', month:'2-digit', day:'2-digit',
  hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false
}).replace(/\//g,'-')
const workshop = ref('全部')
const totalRate = ref(29.52)
const customRate = ref(0)

/* ---------- 状态数量 ---------- */
const runCount    = ref(10)
const standbyCount = ref(12)
const alarmCount   = ref(3)
const offlineCount = ref(7)

/* ---------- 设备数据 ---------- */
interface Device {
  code:string, rate:string, down:string, run:string, output:number|string, type:string, status:'运行'|'待机'|'报警'|'离线'
}
const deviceList = ref<Device[]>([
  { code:'C4-51-01', rate:'99.07%', down:'04:27', run:'07:55', output:6454, type:'石山上料机', status:'运行' },
  { code:'C4-51-02', rate:'98.15%', down:'08:53', run:'07:51', output:6272, type:'高精度偏光片贴合', status:'待机' },
  { code:'C4-51-03', rate:'89.69%', down:'49:29', run:'07:10', output:6240, type:'高精度偏光片贴合', status:'待机' },
  { code:'C4-51-04', rate:'96.46%', down:'17:00', run:'07:43', output:6225, type:'清洗机EC-6001T', status:'待机' },
  { code:'C4-51-05', rate:'95.26%', down:'22:44', run:'07:37', output:6244, type:'全自动COG/SCL', status:'报警' },
  { code:'C4-51-07', rate:'97.61%', down:'11:29', run:'07:48', output:6268, type:'全自动FOG/SFB', status:'运行' },
  { code:'C4-51-08', rate:'97.31%', down:'12:55', run:'07:47', output:6277, type:'AOI LHP-901A', status:'离线' },
  { code:'C4-51-09', rate:'94.81%', down:'24:56', run:'07:35', output:63818, type:'智能点封胶机JT', status:'离线' },
  { code:'C4-51-11', rate:'98.56%', down:'06:56', run:'07:53', output:6203, type:'深圳众志前测二', status:'运行' }
])

const filterStatus = ref<'运行'|'待机'|'报警'|'离线'|null>(null)
const filteredList = computed(() =>
    filterStatus.value ? deviceList.value.filter(d => d.status === filterStatus.value) : []
)

/* ---------- 设定字段弹窗 ---------- */
const openFieldDialog = ref(false)
interface FieldRow { key:string, name:string, label:string, show:boolean }
const fieldTable = ref<FieldRow[]>([
  { key:'rate',  name:'设备稼动率', label:'设备稼动率', show:true },
  { key:'yield', name:'良率', label:'良率', show:false },
  { key:'pyield', name:'性能稼动率', label:'性能稼动率', show:true },
  { key:'oee', name:'设备OEE', label:'设备OEE', show:true },
  { key:'emp', name:'员工工号', label:'员工工号', show:false },
  { key:'reach', name:'达成率', label:'达成率', show:true },
  { key:'batch', name:'当班产品/理论班产', label:'当班产品/理论班产', show:false },
  { key:'stopNum', name:'当班停机次数', label:'当班停机次数', show:true },
  { key:'warnNum', name:'当班黄灯+红灯次数', label:'当班黄灯+红灯次数', show:false },
  { key:'eff', name:'生产效率', label:'生产效率', show:false },
  { key:'stopTime', name:'当班停机时长', label:'当班停机时长', show:true },
  { key:'runTime', name:'当班运行时长', label:'当班运行时长', show:true },
  { key:'orderNum', name:'订单数量', label:'订单数量', show:false },
  { key:'holdTime', name:'持球时长', label:'持球时长', show:false },
  { key:'empName', name:'员工姓名', label:'员工姓名', show:false },
  { key:'theory', name:'理论班产', label:'理论班产', show:false },
  { key:'prodCode', name:'产品代码', label:'产品代码', show:false },
  { key:'prodModel', name:'产品型号', label:'产品型号', show:false },
  { key:'greenTime', name:'绿灯时长', label:'绿灯时长', show:false },
  { key:'redNum', name:'红灯次数', label:'红灯次数', show:false },
  { key:'yellowNum', name:'黄灯次数', label:'黄灯次数', show:false },
  { key:'redTime', name:'红灯时长', label:'红灯时长', show:false },
  { key:'yellowTime', name:'黄灯时长', label:'黄灯时长', show:false },
  { key:'bootTime', name:'开机时长', label:'开机时长', show:false },
  { key:'serial', name:'设备序列号', label:'设备序列号', show:false },
  { key:'factory', name:'工厂', label:'工厂', show:false },
  { key:'station', name:'工站名', label:'工站名', show:false },
  { key:'stationZh', name:'工站中文', label:'工站中文', show:false },
  { key:'remark', name:'报修备注', label:'报修备注', show:false },
  { key:'orderId', name:'订单编号', label:'订单编号', show:false },
  { key:'actual', name:'当班产量', label:'当班产量', show:true }
])

/* ---------- 配置自定义稼动率设备弹窗 ---------- */
const openDeviceDialog = ref(false)
const allDeviceOptions = ref(deviceList.value.map(d => ({ key:d.code, label:d.code })))
const selectedDevice = ref<string[]>([])
</script>

<style scoped>
.dashboard{
  background:#001529;
  color:#fff;
  min-height:100vh;
  padding:16px;
  font-family:-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif;
}
.header{
  display:flex;
  align-items:center;
  font-size:18px;
  font-weight:bold;
}
.time{
  margin-left:12px;
  font-size:14px;
  color:#aaa;
}
.summary{
  margin:12px 0;
  font-size:14px;
}
.summary > div{
  display:inline-block;
  margin-right:24px;
}
.blue{
  color:#1890ff;
}

/* 状态卡片 */
.status-row{
  display:flex;
  gap:16px;
}
.status-card{
  flex:1;
  height:100px;
  border-radius:6px;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  cursor:pointer;
  font-size:14px;
}
.status-card.run   { background:#52c41a33; color:#52c41a; }
.status-card.standby{ background:#faad1433; color:#faad14; }
.status-card.alarm  { background:#ff4f4f33; color:#ff4f4f; }
.status-card.offline{ background:#d9d9d933; color:#d9d9d9; }
.icon{ font-size:24px; margin-bottom:4px; }
.num{ font-size:22px; font-weight:bold; }

/* 设备卡片单行 */
.device-row{
  display:flex;
  gap:12px;
  overflow-x:auto;
  padding-bottom:8px;
  margin-top:12px;
}
.device-card{
  flex:0 0 260px;
  padding:8px 12px;
  border-radius:6px;
  font-size:13px;
  line-height:1.7;
}
.device-card.run   { background:#52c41a22; }
.device-card.standby{ background:#faad1422; }
.device-card.alarm  { background:#ff4f4f22; }
.device-card.offline{ background:#d9d9d922; }
.dev-name{
  font-weight:bold;
  font-size:15px;
}
.dev-rate{
  color:#1890ff;
}
</style>
