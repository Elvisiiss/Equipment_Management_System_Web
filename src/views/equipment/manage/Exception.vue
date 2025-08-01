
<!--│　│　├─ 1.4.3 异常监控与通报-->
<!--│　│　└─ 1.4.4 异常经验库-->


<!--├─ 1.5.2 参数阈值管理-->
<!--│   └─ 1.5.3 运行/参数异常报警-->

<template>
  <el-card>
    <template #header>
      <span>设备异常监控中心 </span>
    </template>

    <!-- 实时参数监控 -->
    <el-row :gutter="20" style="margin-bottom:20px">
      <el-col :span="8">
        <el-statistic
            title="振动 (mm/s)"
            :value="realtime.vibration"
            :value-style="{ color: realtime.vibration > vibrationLimit ? '#f56c6c' : '' }"
        />
      </el-col>
      <el-col :span="8">
        <el-statistic
            title="温度 (°C)"
            :value="realtime.temperature"
            :value-style="{ color: realtime.temperature > temperatureLimit ? '#f56c6c' : '' }"
        />
      </el-col>
      <el-col :span="8">
        <el-statistic
            title="工艺量 (%)"
            :value="realtime.process"
            :value-style="{ color: realtime.process > processLimit ? '#f56c6c' : '' }"
        />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 异常监控 + 通报 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header><span>异常监控 & 通报</span></template>
          <el-table
              :data="exceptions"
              size="small"
              max-height="260"
              :row-class-name="({ row }) => (row.status === '未通报' ? 'danger-row' : '')"
          >
            <el-table-column prop="time" label="时间" width="135"/>
            <el-table-column prop="rule"  label="判异规则"/>
            <el-table-column prop="value" label="异常值"/>
            <el-table-column prop="owner" label="责任人"/>
            <el-table-column label="状态" width="80">
              <template #default="{row}">
                <el-tag size="small" :type="row.status==='未通报'?'danger':'success'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="通报" width="70">
              <template #default="{row}">
                <el-button
                    v-if="row.status==='未通报'"
                    size="small"
                    type="warning"
                    text
                    @click="openNotify(row)"
                >通报</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 实时报警列表 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header><span>运行/参数报警</span></template>
          <el-table
              :data="alarms"
              size="small"
              max-height="260"
              :row-class-name="() => 'danger-row'"
          >
            <el-table-column prop="time" label="时间" width="135"/>
            <el-table-column prop="type" label="报警类型"/>
            <el-table-column prop="param" label="参数"/>
            <el-table-column prop="value" label="当前值"/>
            <el-table-column prop="limit" label="阈值"/>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 通报责任人弹窗 -->
    <el-dialog v-model="notifyVisible" title="通报责任人" width="400">
      <el-form>
        <el-form-item label="责任人">
          <el-select v-model="selectedOwner" filterable style="width:100%">
            <el-option
                v-for="p in owners"
                :key="p"
                :label="p"
                :value="p"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="notifyVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmNotify">确认通报</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted } from 'vue'

/* ---------------- 阈值设定 ---------------- */
const vibrationLimit  = 4.5
const temperatureLimit = 60
const processLimit    = 95

/* ---------------- 实时数据 ---------------- */
const realtime = reactive({ vibration:2.3, temperature:45, process:87 })
const alarms   = ref([])
const exceptions = ref([
  { time:'2025-08-01 10:23', rule:'超出上限', value:'12.5', owner:'张三', status:'未通报' },
  { time:'2025-08-01 09:41', rule:'连续上升', value:'9.8',  owner:'李四', status:'已通报' }
])

let timer = null
onMounted(()=>{
  timer = setInterval(()=>{
    // 随机更新
    realtime.vibration  = +(Math.random()*6).toFixed(1)
    realtime.temperature = +(35+Math.random()*30).toFixed(1)
    realtime.process    = +(80+Math.random()*20).toFixed(1)

    // 实时报警
    checkAlarm('振动',  realtime.vibration,  vibrationLimit,  'mm/s')
    checkAlarm('温度',  realtime.temperature, temperatureLimit, '°C')
    checkAlarm('工艺量',realtime.process,    processLimit,    '%')
  },3000)
})
onUnmounted(()=>clearInterval(timer))

/* 报警检查 */
function checkAlarm(param,val,limit,unit){
  if(val>limit){
    const time = new Date().toLocaleTimeString('zh-CN',{hour12:false})
    // 去重：同一秒内同一参数只写一次
    if(!alarms.value.find(a=>a.param===param && a.time.endsWith(time))){
      alarms.value.unshift({ time, type:'参数异常', param, value:val+unit, limit:limit+unit })
    }
  }
}

/* ---------------- 通报功能 ---------------- */
const notifyVisible = ref(false)
const selectedOwner = ref('')
const owners = ['张三','李四','王工','赵工']
let currRow = null
function openNotify(row){
  currRow = row
  selectedOwner.value = row.owner
  notifyVisible.value = true
}
function confirmNotify(){
  currRow.status = '已通报'
  currRow.owner  = selectedOwner.value
  notifyVisible.value = false
}
</script>

<style scoped>
.danger-row {
  background-color: #fef0f0 !important;
}
</style>
