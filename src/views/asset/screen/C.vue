<template>
  <el-container style="height:100vh">
    <!-- 左侧：资产动态 + 饼图 -->
    <el-aside width="240px" style="background:#001529;color:#fff;padding:16px">
      <h3>资产动态</h3>
      <div v-for="s in statList" :key="s.label"
           style="display:flex;justify-content:space-between;margin:8px 0">
        <span>{{ s.label }}</span>
        <span :style="{color:s.color||'#fff'}">{{ s.value }}</span>
      </div>
      <el-divider style="border-color:#4c4d4f"/>
      <!-- 饼图 -->
      <div ref="pieRef" style="height:220px"></div>
    </el-aside>

    <!-- 中间主内容 -->
    <el-main style="padding:0">
      <!-- 顶部车间布局 -->
      <div style="height:200px;background:#f7f7f7;position:relative;border:1px solid #dcdcdc">
        <div v-for="w in workshops" :key="w.id"
             :style="{position:'absolute',left:w.x+'%',top:w.y+'%',
                      width:w.w+'%',height:w.h+'%',background:w.color,
                      border:'1px solid #409eff',display:'flex',
                      alignItems:'center',justifyContent:'center',
                      color:'#fff',fontSize:14}">
          {{ w.name }}
        </div>
      </div>

      <!-- 层级资产 -->
      <div style="padding:16px;overflow:auto;height:calc(100vh - 200px)">
        <div v-for="(workshops,factory) in tree" :key="factory" style="margin-bottom:24px">
          <h2>{{ factory }}</h2>
          <el-row :gutter="16">
            <el-col v-for="(lines,shop) in workshops" :key="shop" :xs="24" :sm="12" :md="8" :lg="6">
              <el-card shadow="hover" style="margin-bottom:16px">
                <template #header>{{ shop }}</template>

                <div v-for="(devices,line) in lines" :key="line" style="margin-bottom:8px">
                  <h5 style="margin:4px 0;font-size:14px;color:#666">{{ line }}</h5>
                  <el-space wrap>
                    <el-tag
                        v-for="dev in devices"
                        :key="dev"
                        @click="goDevice(dev)"
                        style="cursor:pointer">
                      {{ dev }}
                    </el-tag>
                  </el-space>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-main>

    <!-- 右侧：业务模块使用 -->
    <el-aside width="280px" style="padding:16px">
      <h3>业务模块使用</h3>
      <div ref="barRef" style="height:260px"></div>
    </el-aside>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 资产统计
const statList = [
  { label: '资产总数', value: 1260 },
  { label: '本月新增', value: 35, color: '#67C23A' },
  { label: '本月报废', value: 12, color: '#F56C6C' },
  { label: '完好率', value: '96.5%', color: '#409EFF' }
]

// 车间布局坐标
const workshops = [
  { id: 1, name: '车间1', x: 5,  y: 5,  w: 15, h: 40, color: '#409eff' },
  { id: 2, name: '车间2', x: 22, y: 5,  w: 15, h: 40, color: '#67c23a' },
  { id: 3, name: '车间3', x: 39, y: 5,  w: 15, h: 40, color: '#e6a23c' },
  { id: 4, name: '车间4', x: 56, y: 5,  w: 15, h: 40, color: '#909399' },
  { id: 5, name: '车间5', x: 73, y: 5,  w: 15, h: 40, color: '#f56c6c' },
  { id: 6, name: '车间6', x: 5,  y: 50, w: 83, h: 40, color: '#00c0ef' }
]

// 资产树（2厂区 6车间 6产线 几十台设备）
const tree = {
  '厂区A': {
    '车间1': {
      '产线1': ['A101','A102','A103','A104','A105'],
      '产线2': ['A201','A202','A203','A204'],
      '产线3': ['A301','A302','A303','A304','A305','A306']
    },
    '车间2': {
      '产线4': ['B101','B102','B103','B104'],
      '产线5': ['B201','B202','B203','B204','B205'],
      '产线6': ['B301','B302','B303','B304']
    },
    '车间3': {
      '产线1': ['C101','C102','C103'],
      '产线2': ['C201','C202','C203','C204'],
      '产线3': ['C301','C302','C303']
    }
  },
  '厂区B': {
    '车间4': {
      '产线4': ['D101','D102','D103','D104'],
      '产线5': ['D201','D202','D203'],
      '产线6': ['D301','D302','D303','D304','D305']
    },
    '车间5': {
      '产线1': ['E101','E102','E103','E104'],
      '产线2': ['E201','E202','E203'],
      '产线3': ['E301','E302','E303','E304']
    },
    '车间6': {
      '产线4': ['F101','F102','F103'],
      '产线5': ['F201','F202','F203','F204','F205'],
      '产线6': ['F301','F302','F303','F304']
    }
  }
}

// 设备履历路由
const goDevice = (dev) => {
  alert(`跳转到 /device/${dev} 设备履历页`)
  // router.push('/device/' + encodeURIComponent(dev))
}

// 图表
const pieRef = ref(null)
const barRef = ref(null)
onMounted(() => {
  // 台账类型&寿命饼图
  const pie = echarts.init(pieRef.value)
  pie.setOption({
    title: { text: '台账类型及寿命', left: 'center', textStyle: { color: '#fff' } },
    tooltip: { trigger: 'item', formatter: '{b}: {c}台<br/>寿命: {@life}年' },
    legend: { orient: 'vertical', left: 'left', textStyle: { color: '#fff' } },
    series: [{
      type: 'pie', radius: '60%',
      data: [
        { name: '生产设备', value: 820, life: 8 },
        { name: 'IT资产', value: 250, life: 5 },
        { name: '车辆', value: 90, life: 10 }
      ]
    }]
  })

  // 业务模块使用柱状图
  const bar = echarts.init(barRef.value)
  bar.setOption({
    title: { text: '业务模块使用', left: 'center' },
    tooltip: {},
    grid: { left: 60, right: 20 },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: ['设备台账', '点检保养', '维修管理', '备件仓库', '资产盘点'] },
    series: [{
      type: 'bar',
      data: [3500, 2800, 2600, 1900, 1700],
      itemStyle: { color: '#67C23A' }
    }]
  })
})
</script>
