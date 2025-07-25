<template>
  <div class="dashboard-container">
    <!-- 顶部标题和时间 -->
    <div class="header">
      <h1>智能制造数据监控中心</h1>
      <div class="time-display">
        <span>{{ currentDate }}</span>
        <span>{{ currentTime }}</span>
      </div>
    </div>

    <!-- 第一行：概览数据 -->
    <div class="row overview-row">
      <div class="card overview-card">
        <div class="card-title">设备总数</div>
        <div class="card-content">
          <div class="big-number">{{ summaryData.totalDevices }}</div>
          <div class="compare">
            <span :class="['trend', summaryData.deviceChangeTrend]">
              <i :class="summaryData.deviceChangeIcon"></i>
              {{ summaryData.deviceChangePercent }}
            </span>
            较上月
          </div>
        </div>
      </div>

      <div class="card overview-card">
        <div class="card-title">运行设备</div>
        <div class="card-content">
          <div class="big-number">{{ summaryData.runningDevices }}</div>
          <div class="status-ratio">
            <div class="status-item">
              <span class="status-dot running"></span>
              <span>运行中 {{ summaryData.runningPercent }}%</span>
            </div>
            <div class="status-item">
              <span class="status-dot idle"></span>
              <span>待机中 {{ summaryData.idlePercent }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card overview-card">
        <div class="card-title">今日OEE</div>
        <div class="card-content">
          <div class="big-number">{{ summaryData.todayOEE }}%</div>
          <div class="oee-detail">
            <div>性能: {{ summaryData.performance }}%</div>
            <div>质量: {{ summaryData.quality }}%</div>
            <div>时间: {{ summaryData.availability }}%</div>
          </div>
        </div>
      </div>

      <div class="card overview-card">
        <div class="card-title">异常设备</div>
        <div class="card-content">
          <div class="big-number warning">{{ summaryData.abnormalDevices }}</div>
          <div class="abnormal-types">
            <div v-for="(item, index) in summaryData.abnormalTypes" :key="index" class="abnormal-item">
              <span class="type-dot" :style="{backgroundColor: item.color}"></span>
              <span>{{ item.name }}: {{ item.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 第二行：左侧设备状态履历图，右侧OEE趋势 -->
    <div class="row chart-row">
      <div class="card status-history-card">
        <div class="card-title">
          设备状态履历图
          <div class="filter">
            <el-select v-model="selectedDevice" placeholder="选择设备" size="mini">
              <el-option
                  v-for="item in deviceList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
            <el-date-picker
                v-model="statusDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                size="mini"
                style="width: 240px; margin-left: 10px;">
            </el-date-picker>
          </div>
        </div>
        <div class="card-content">
          <div class="status-history-chart" ref="statusHistoryChart"></div>
        </div>
      </div>

      <div class="card oee-trend-card">
        <div class="card-title">
          OEE趋势分析
          <div class="time-range">
            <el-radio-group v-model="oeeTimeRange" size="mini">
              <el-radio-button label="day">日</el-radio-button>
              <el-radio-button label="week">周</el-radio-button>
              <el-radio-button label="month">月</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div class="card-content">
          <div class="oee-trend-chart" ref="oeeTrendChart"></div>
        </div>
      </div>
    </div>

    <!-- 第三行：稼动率报表 -->
    <div class="row">
      <div class="card utilization-card">
        <div class="card-title">
          稼动率报表
          <div class="tabs">
            <el-tabs v-model="activeTab" type="card">
              <el-tab-pane label="时间稼动率" name="availability"></el-tab-pane>
              <el-tab-pane label="性能稼动率" name="performance"></el-tab-pane>
              <el-tab-pane label="质量稼动率" name="quality"></el-tab-pane>
            </el-tabs>
          </div>
        </div>
        <div class="card-content">
          <div class="utilization-chart" ref="utilizationChart"></div>
          <div class="utilization-table">
            <el-table
                :data="utilizationTableData"
                style="width: 100%"
                height="250"
                border
                size="mini">
              <el-table-column
                  prop="date"
                  label="日期"
                  width="120">
              </el-table-column>
              <el-table-column
                  prop="device"
                  label="设备"
                  width="120">
              </el-table-column>
              <el-table-column
                  prop="value"
                  :label="activeTab === 'availability' ? '时间稼动率(%)' : activeTab === 'performance' ? '性能稼动率(%)' : '质量稼动率(%)'"
                  width="120">
                <template slot-scope="scope">
                  <span :class="{'warning-text': scope.row.value < 85}">{{ scope.row.value }}%</span>
                </template>
              </el-table-column>
              <el-table-column
                  prop="trend"
                  label="趋势">
                <template slot-scope="scope">
                  <i :class="scope.row.trendIcon" :style="{color: scope.row.trendColor}"></i>
                  <span :style="{color: scope.row.trendColor}">{{ scope.row.trendText }}</span>
                </template>
              </el-table-column>
              <el-table-column
                  prop="standard"
                  label="标准值"
                  width="120">
                <template slot-scope="scope">
                  {{ scope.row.standard }}%
                </template>
              </el-table-column>
              <el-table-column
                  prop="difference"
                  label="差异"
                  width="120">
                <template slot-scope="scope">
                  <span :class="{'warning-text': scope.row.difference < 0}">
                    {{ scope.row.difference > 0 ? '+' : '' }}{{ scope.row.difference }}%
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>

    <!-- 第四行：设备停机管理 -->
    <div class="row">
      <div class="card downtime-card">
        <div class="card-title">
          设备停机管理
          <div class="filter">
            <el-select v-model="downtimeType" placeholder="停机类型" size="mini">
              <el-option
                  v-for="item in downtimeTypes"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
            <el-date-picker
                v-model="downtimeDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                size="mini"
                style="width: 240px; margin-left: 10px;">
            </el-date-picker>
          </div>
        </div>
        <div class="card-content">
          <div class="downtime-chart" ref="downtimeChart"></div>
          <div class="downtime-table">
            <el-table
                :data="downtimeTableData"
                style="width: 100%"
                height="250"
                border
                size="mini">
              <el-table-column
                  prop="id"
                  label="ID"
                  width="80">
              </el-table-column>
              <el-table-column
                  prop="device"
                  label="设备"
                  width="120">
              </el-table-column>
              <el-table-column
                  prop="type"
                  label="停机类型"
                  width="120">
              </el-table-column>
              <el-table-column
                  prop="startTime"
                  label="开始时间"
                  width="180">
              </el-table-column>
              <el-table-column
                  prop="endTime"
                  label="结束时间"
                  width="180">
              </el-table-column>
              <el-table-column
                  prop="duration"
                  label="持续时间(min)"
                  width="120">
                <template slot-scope="scope">
                  <span :class="{'warning-text': scope.row.duration > 30}">{{ scope.row.duration }}</span>
                </template>
              </el-table-column>
              <el-table-column
                  prop="reason"
                  label="原因"
                  width="180">
              </el-table-column>
              <el-table-column
                  prop="action"
                  label="处理措施"
                  width="180">
              </el-table-column>
              <el-table-column
                  prop="status"
                  label="状态"
                  width="120">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.status === '已解决' ? 'success' : 'danger'" size="mini">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { format } from 'date-fns'

export default {
  name: 'Dashboard',
  data() {
    return {
      currentDate: '',
      currentTime: '',
      timer: null,

      // 概览数据
      summaryData: {
        totalDevices: 56,
        runningDevices: 42,
        abnormalDevices: 7,
        todayOEE: 82.5,
        performance: 88.3,
        quality: 93.2,
        availability: 85.6,
        runningPercent: 75,
        idlePercent: 25,
        deviceChangePercent: '5.2%',
        deviceChangeTrend: 'up',
        deviceChangeIcon: 'el-icon-top',
        abnormalTypes: [
          { name: '机械故障', count: 3, color: '#F56C6C' },
          { name: '电气故障', count: 2, color: '#E6A23C' },
          { name: '程序错误', count: 1, color: '#67C23A' },
          { name: '物料短缺', count: 1, color: '#409EFF' }
        ]
      },

      // 设备状态履历图
      selectedDevice: 'device1',
      deviceList: [
        { value: 'device1', label: 'CNC-001' },
        { value: 'device2', label: 'CNC-002' },
        { value: 'device3', label: 'CNC-003' },
        { value: 'device4', label: 'CNC-004' },
        { value: 'device5', label: 'CNC-005' }
      ],
      statusDateRange: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()],
      statusHistoryChart: null,

      // OEE趋势
      oeeTimeRange: 'week',
      oeeTrendChart: null,

      // 稼动率报表
      activeTab: 'availability',
      utilizationChart: null,
      utilizationTableData: [
        {
          date: '2023-05-01',
          device: 'CNC-001',
          value: 87,
          trendIcon: 'el-icon-bottom',
          trendColor: '#F56C6C',
          trendText: '下降 2%',
          standard: 90,
          difference: -3
        },
        {
          date: '2023-05-01',
          device: 'CNC-002',
          value: 92,
          trendIcon: 'el-icon-top',
          trendColor: '#67C23A',
          trendText: '上升 1%',
          standard: 90,
          difference: 2
        },
        {
          date: '2023-05-02',
          device: 'CNC-001',
          value: 85,
          trendIcon: 'el-icon-bottom',
          trendColor: '#F56C6C',
          trendText: '下降 2%',
          standard: 90,
          difference: -5
        },
        {
          date: '2023-05-02',
          device: 'CNC-002',
          value: 93,
          trendIcon: 'el-icon-top',
          trendColor: '#67C23A',
          trendText: '上升 1%',
          standard: 90,
          difference: 3
        },
        {
          date: '2023-05-03',
          device: 'CNC-001',
          value: 88,
          trendIcon: 'el-icon-top',
          trendColor: '#67C23A',
          trendText: '上升 3%',
          standard: 90,
          difference: -2
        },
        {
          date: '2023-05-03',
          device: 'CNC-002',
          value: 91,
          trendIcon: 'el-icon-bottom',
          trendColor: '#E6A23C',
          trendText: '下降 2%',
          standard: 90,
          difference: 1
        }
      ],

      // 设备停机管理
      downtimeType: 'all',
      downtimeTypes: [
        { value: 'all', label: '全部' },
        { value: 'mechanical', label: '机械故障' },
        { value: 'electrical', label: '电气故障' },
        { value: 'program', label: '程序错误' },
        { value: 'material', label: '物料短缺' },
        { value: 'other', label: '其他' }
      ],
      downtimeDateRange: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()],
      downtimeChart: null,
      downtimeTableData: [
        {
          id: '001',
          device: 'CNC-001',
          type: '机械故障',
          startTime: '2023-05-01 08:23:45',
          endTime: '2023-05-01 09:15:32',
          duration: 52,
          reason: '主轴轴承损坏',
          action: '更换轴承',
          status: '已解决'
        },
        {
          id: '002',
          device: 'CNC-002',
          type: '电气故障',
          startTime: '2023-05-01 10:05:12',
          endTime: '2023-05-01 10:35:48',
          duration: 31,
          reason: '伺服驱动器报警',
          action: '重置驱动器参数',
          status: '已解决'
        },
        {
          id: '003',
          device: 'CNC-003',
          type: '程序错误',
          startTime: '2023-05-02 13:42:15',
          endTime: '2023-05-02 14:05:30',
          duration: 23,
          reason: 'G代码错误',
          action: '修改程序',
          status: '已解决'
        },
        {
          id: '004',
          device: 'CNC-001',
          type: '物料短缺',
          startTime: '2023-05-03 09:12:33',
          endTime: '2023-05-03 10:45:22',
          duration: 93,
          reason: '原材料不足',
          action: '补充原材料',
          status: '已解决'
        },
        {
          id: '005',
          device: 'CNC-004',
          type: '机械故障',
          startTime: '2023-05-03 15:20:10',
          endTime: '2023-05-03 16:50:45',
          duration: 90,
          reason: '导轨磨损',
          action: '更换导轨',
          status: '处理中'
        },
        {
          id: '006',
          device: 'CNC-002',
          type: '其他',
          startTime: '2023-05-04 11:05:22',
          endTime: '2023-05-04 11:25:18',
          duration: 20,
          reason: '停电',
          action: '等待供电恢复',
          status: '已解决'
        }
      ]
    }
  },
  mounted() {
    this.updateTime()
    this.timer = setInterval(this.updateTime, 1000)

    this.$nextTick(() => {
      this.initStatusHistoryChart()
      this.initOeeTrendChart()
      this.initUtilizationChart()
      this.initDowntimeChart()
    })

    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    clearInterval(this.timer)
    window.removeEventListener('resize', this.handleResize)

    if (this.statusHistoryChart) {
      this.statusHistoryChart.dispose()
    }
    if (this.oeeTrendChart) {
      this.oeeTrendChart.dispose()
    }
    if (this.utilizationChart) {
      this.utilizationChart.dispose()
    }
    if (this.downtimeChart) {
      this.downtimeChart.dispose()
    }
  },
  methods: {
    updateTime() {
      const now = new Date()
      this.currentDate = format(now, 'yyyy年MM月dd日')
      this.currentTime = format(now, 'HH:mm:ss')
    },

    handleResize() {
      if (this.statusHistoryChart) {
        this.statusHistoryChart.resize()
      }
      if (this.oeeTrendChart) {
        this.oeeTrendChart.resize()
      }
      if (this.utilizationChart) {
        this.utilizationChart.resize()
      }
      if (this.downtimeChart) {
        this.downtimeChart.resize()
      }
    },

    initStatusHistoryChart() {
      this.statusHistoryChart = echarts.init(this.$refs.statusHistoryChart)

      const option = {
        tooltip: {
          formatter: function(params) {
            return `${params.marker} ${params.seriesName}<br/>
            时间: ${params.value[0]}<br/>
            状态: ${params.value[2] === 1 ? '运行' : params.value[2] === 2 ? '待机' : '故障'}`
          }
        },
        legend: {
          data: ['运行', '待机', '故障'],
          right: 10,
          top: 10
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'time',
          axisLabel: {
            formatter: function(value) {
              return format(new Date(value), 'MM-dd HH:mm')
            }
          }
        },
        yAxis: {
          type: 'value',
          show: false
        },
        series: [
          {
            name: '运行',
            type: 'scatter',
            symbolSize: 10,
            data: this.generateStatusData('running')
          },
          {
            name: '待机',
            type: 'scatter',
            symbolSize: 10,
            data: this.generateStatusData('idle')
          },
          {
            name: '故障',
            type: 'scatter',
            symbolSize: 10,
            data: this.generateStatusData('error')
          }
        ]
      }

      this.statusHistoryChart.setOption(option)
    },

    generateStatusData(type) {
      const data = []
      const now = new Date()
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      let current = new Date(start)
      while (current < now) {
        const duration = Math.random() * 4 * 60 * 60 * 1000 // 最长4小时
        const end = new Date(current.getTime() + duration)

        if (type === 'running') {
          data.push({
            value: [current, 1, 1],
            itemStyle: {
              color: '#67C23A'
            }
          })
        } else if (type === 'idle') {
          data.push({
            value: [current, 1, 2],
            itemStyle: {
              color: '#E6A23C'
            }
          })
        } else if (type === 'error') {
          if (Math.random() > 0.9) { // 10%概率出现故障
            const errorDuration = Math.min(Math.random() * 60 * 60 * 1000, duration) // 最长1小时
            const errorEnd = new Date(current.getTime() + errorDuration)

            data.push({
              value: [current, 1, 3],
              itemStyle: {
                color: '#F56C6C'
              }
            })

            current = errorEnd
            continue
          }
        }

        current = end
      }

      return data
    },

    initOeeTrendChart() {
      this.oeeTrendChart = echarts.init(this.$refs.oeeTrendChart)

      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['OEE', '性能稼动率', '质量稼动率', '时间稼动率'],
          right: 10,
          top: 10
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: {
          type: 'value',
          min: 50,
          max: 100,
          axisLabel: {
            formatter: '{value}%'
          }
        },
        series: [
          {
            name: 'OEE',
            type: 'line',
            data: [78, 82, 85, 83, 86, 80, 75],
            smooth: true,
            lineStyle: {
              width: 3,
              color: '#409EFF'
            },
            symbolSize: 8,
            itemStyle: {
              color: '#409EFF'
            }
          },
          {
            name: '性能稼动率',
            type: 'line',
            data: [85, 88, 90, 87, 89, 85, 80],
            smooth: true,
            lineStyle: {
              width: 2,
              color: '#67C23A'
            },
            symbolSize: 6,
            itemStyle: {
              color: '#67C23A'
            }
          },
          {
            name: '质量稼动率',
            type: 'line',
            data: [92, 93, 94, 95, 96, 94, 93],
            smooth: true,
            lineStyle: {
              width: 2,
              color: '#E6A23C'
            },
            symbolSize: 6,
            itemStyle: {
              color: '#E6A23C'
            }
          },
          {
            name: '时间稼动率',
            type: 'line',
            data: [80, 85, 82, 83, 84, 78, 75],
            smooth: true,
            lineStyle: {
              width: 2,
              color: '#F56C6C'
            },
            symbolSize: 6,
            itemStyle: {
              color: '#F56C6C'
            }
          }
        ]
      }

      this.oeeTrendChart.setOption(option)
    },

    initUtilizationChart() {
      this.utilizationChart = echarts.init(this.$refs.utilizationChart)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['CNC-001', 'CNC-002', 'CNC-003', 'CNC-004', 'CNC-005'],
          axisLabel: {
            interval: 0,
            rotate: 0
          }
        },
        yAxis: {
          type: 'value',
          min: 70,
          max: 100,
          axisLabel: {
            formatter: '{value}%'
          }
        },
        series: [
          {
            name: '时间稼动率',
            type: 'bar',
            barWidth: '30%',
            data: [85, 92, 88, 90, 87],
            itemStyle: {
              color: '#409EFF'
            }
          },
          {
            name: '性能稼动率',
            type: 'bar',
            barWidth: '30%',
            data: [88, 93, 90, 92, 89],
            itemStyle: {
              color: '#67C23A'
            }
          },
          {
            name: '质量稼动率',
            type: 'bar',
            barWidth: '30%',
            data: [93, 95, 94, 96, 92],
            itemStyle: {
              color: '#E6A23C'
            }
          }
        ]
      }

      this.utilizationChart.setOption(option)
    },

    initDowntimeChart() {
      this.downtimeChart = echarts.init(this.$refs.downtimeChart)

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          data: ['机械故障', '电气故障', '程序错误', '物料短缺', '其他']
        },
        series: [
          {
            name: '停机原因',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: 35, name: '机械故障', itemStyle: { color: '#F56C6C' } },
              { value: 25, name: '电气故障', itemStyle: { color: '#E6A23C' } },
              { value: 15, name: '程序错误', itemStyle: { color: '#67C23A' } },
              { value: 15, name: '物料短缺', itemStyle: { color: '#409EFF' } },
              { value: 10, name: '其他', itemStyle: { color: '#909399' } }
            ]
          }
        ]
      }

      this.downtimeChart.setOption(option)
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #f0f2f5;
  overflow: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.time-display {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.time-display span:first-child {
  font-size: 16px;
  color: #666;
}

.time-display span:last-child {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.row {
  display: flex;
  margin-bottom: 20px;
}

.overview-row {
  justify-content: space-between;
}

.overview-card {
  flex: 1;
  margin-right: 20px;
}

.overview-card:last-child {
  margin-right: 0;
}

.chart-row {
  justify-content: space-between;
}

.status-history-card {
  flex: 2;
  margin-right: 20px;
}

.oee-trend-card {
  flex: 1;
}

.utilization-card, .downtime-card {
  width: 100%;
}

.card {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-title {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  padding: 20px;
}

.big-number {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.big-number.warning {
  color: #F56C6C;
}

.compare {
  font-size: 14px;
  color: #909399;
}

.trend {
  margin-right: 5px;
}

.trend.up {
  color: #67C23A;
}

.trend.down {
  color: #F56C6C;
}

.status-ratio {
  display: flex;
  flex-direction: column;
}

.status-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  font-size: 14px;
  color: #606266;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-dot.running {
  background-color: #67C23A;
}

.status-dot.idle {
  background-color: #E6A23C;
}

.oee-detail {
  font-size: 14px;
  color: #606266;
}

.oee-detail div {
  margin-bottom: 5px;
}

.abnormal-types {
  display: flex;
  flex-wrap: wrap;
}

.abnormal-item {
  display: flex;
  align-items: center;
  margin-right: 15px;
  margin-bottom: 5px;
  font-size: 14px;
  color: #606266;
}

.type-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-history-chart, .oee-trend-chart, .utilization-chart, .downtime-chart {
  width: 100%;
  height: 300px;
}

.utilization-table, .downtime-table {
  margin-top: 20px;
}

.warning-text {
  color: #F56C6C;
}

.filter, .time-range, .tabs {
  display: flex;
  align-items: center;
}
</style>
