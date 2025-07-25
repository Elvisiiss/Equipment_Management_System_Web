<template>
  <div class="utilization-report-system">
    <div class="header">
      <h1>稼动率报表管理系统</h1>
      <div class="report-type-selector">
        <label for="report-type">报表类型：</label>
        <select id="report-type" v-model="selectedReportType">
          <option value="time">时间稼动率</option>
          <option value="performance">性能稼动率</option>
          <option value="quality">质量稼动率</option>
        </select>
      </div>
    </div>

    <div class="content">
      <!-- 时间稼动率报表 -->
      <div v-if="selectedReportType === 'time'" class="time-utilization">
        <div class="time-period-selector">
          <button
              v-for="period in timePeriods"
              :key="period.value"
              :class="{ active: selectedTimePeriod === period.value }"
              @click="selectedTimePeriod = period.value"
          >
            {{ period.label }}
          </button>
          <date-picker
              v-model="customDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
          />
        </div>

        <div class="report-container">
          <div class="report-tabs">
            <button
                v-for="tab in timeReportTabs"
                :key="tab.value"
                :class="{ active: selectedTimeTab === tab.value }"
                @click="selectedTimeTab = tab.value"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="report-content">
            <!-- 日稼动率趋势表 -->
            <div v-if="selectedTimeTab === 'daily'" class="report-item">
              <h3>日稼动率趋势表 (01n0)</h3>
              <div class="chart-container">
                <line-chart :data="dailyTimeUtilizationData" />
              </div>
              <div class="report-actions">
                <button @click="exportReport('excel')">导出Excel</button>
                <button @click="exportReport('csv')">导出CSV</button>
                <button @click="exportReport('word')">导出Word</button>
              </div>
            </div>

            <!-- 周稼动率趋势表 -->
            <div v-if="selectedTimeTab === 'weekly'" class="report-item">
              <h3>周稼动率趋势表 (WUTC)</h3>
              <div class="chart-container">
                <line-chart :data="weeklyTimeUtilizationData" />
              </div>
              <div class="report-actions">
                <button @click="exportReport('excel')">导出Excel</button>
                <button @click="exportReport('csv')">导出CSV</button>
                <button @click="exportReport('word')">导出Word</button>
              </div>
            </div>

            <!-- 月稼动率趋势表 -->
            <div v-if="selectedTimeTab === 'monthly'" class="report-item">
              <h3>月稼动率趋势表 (MUTC)</h3>
              <div class="chart-container">
                <line-chart :data="monthlyTimeUtilizationData" />
              </div>
              <div class="report-actions">
                <button @click="exportReport('excel')">导出Excel</button>
                <button @click="exportReport('csv')">导出CSV</button>
                <button @click="exportReport('word')">导出Word</button>
              </div>
            </div>

            <!-- 时间稼动率管理 -->
            <div v-if="selectedTimeTab === 'management'" class="report-item">
              <h3>时间稼动率管理 (IN3Wd 10)</h3>
              <div class="management-container">
                <div class="filter-section">
                  <div class="filter-item">
                    <label>设备选择：</label>
                    <select v-model="selectedEquipment" multiple>
                      <option v-for="eq in equipmentList" :key="eq.id" :value="eq.id">
                        {{ eq.name }}
                      </option>
                    </select>
                  </div>
                  <div class="filter-item">
                    <label>时间范围：</label>
                    <select v-model="selectedTimeRange">
                      <option value="today">今日</option>
                      <option value="yesterday">昨天</option>
                      <option value="last7days">近7天</option>
                      <option value="last30days">近30天</option>
                      <option value="thisMonth">本月</option>
                      <option value="lastMonth">上月</option>
                      <option value="custom">自定义</option>
                    </select>
                    <date-picker
                        v-if="selectedTimeRange === 'custom'"
                        v-model="customManagementDateRange"
                        type="daterange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                    />
                  </div>
                </div>
                <div class="data-table">
                  <table>
                    <thead>
                    <tr>
                      <th>设备名称</th>
                      <th>日期</th>
                      <th>计划运行时间</th>
                      <th>实际运行时间</th>
                      <th>停机时间</th>
                      <th>时间稼动率</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="item in timeManagementData" :key="item.id">
                      <td>{{ item.equipmentName }}</td>
                      <td>{{ item.date }}</td>
                      <td>{{ item.plannedTime }}小时</td>
                      <td>{{ item.actualTime }}小时</td>
                      <td>{{ item.downTime }}小时</td>
                      <td>{{ item.utilizationRate }}%</td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- 稼动率报表管理 -->
            <div v-if="selectedTimeTab === 'reportManagement'" class="report-item">
              <h3>稼动率报表管理 (UDR)</h3>
              <div class="report-management-container">
                <div class="report-list">
                  <table>
                    <thead>
                    <tr>
                      <th>报表名称</th>
                      <th>类型</th>
                      <th>生成时间</th>
                      <th>操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="report in reportList" :key="report.id">
                      <td>{{ report.name }}</td>
                      <td>{{ report.type }}</td>
                      <td>{{ report.createdAt }}</td>
                      <td>
                        <button @click="downloadReport(report.id)">下载</button>
                        <button @click="deleteReport(report.id)">删除</button>
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- 稼动率趋势总览 -->
            <div v-if="selectedTimeTab === 'trendOverview'" class="report-item">
              <h3>稼动率趋势总览 (UTC)</h3>
              <div class="trend-overview-container">
                <div class="overview-chart">
                  <line-chart :data="trendOverviewData" />
                </div>
                <div class="overview-stats">
                  <div class="stat-item">
                    <h4>平均稼动率</h4>
                    <p>{{ averageUtilization }}%</p>
                  </div>
                  <div class="stat-item">
                    <h4>最高稼动率</h4>
                    <p>{{ maxUtilization }}%</p>
                  </div>
                  <div class="stat-item">
                    <h4>最低稼动率</h4>
                    <p>{{ minUtilization }}%</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 稼动率趋势明细 -->
            <div v-if="selectedTimeTab === 'trendDetail'" class="report-item">
              <h3>稼动率趋势明细 (UTR)</h3>
              <div class="trend-detail-container">
                <div class="detail-table">
                  <table>
                    <thead>
                    <tr>
                      <th>日期</th>
                      <th>设备名称</th>
                      <th>班次</th>
                      <th>计划时间</th>
                      <th>实际时间</th>
                      <th>稼动率</th>
                      <th>异常时间</th>
                      <th>异常原因</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="detail in trendDetailData" :key="detail.id">
                      <td>{{ detail.date }}</td>
                      <td>{{ detail.equipmentName }}</td>
                      <td>{{ detail.shift }}</td>
                      <td>{{ detail.plannedTime }}小时</td>
                      <td>{{ detail.actualTime }}小时</td>
                      <td>{{ detail.utilizationRate }}%</td>
                      <td>{{ detail.abnormalTime }}分钟</td>
                      <td>{{ detail.abnormalReason }}</td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- 运行时间趋势表 -->
            <div v-if="selectedTimeTab === 'runTimeTable'" class="report-item">
              <h3>运行时间趋势表 (RSTR)</h3>
              <div class="run-time-table-container">
                <div class="run-time-table">
                  <table>
                    <thead>
                    <tr>
                      <th>设备名称</th>
                      <th>日期</th>
                      <th>早班运行时间</th>
                      <th>中班运行时间</th>
                      <th>晚班运行时间</th>
                      <th>总运行时间</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="item in runTimeTableData" :key="item.id">
                      <td>{{ item.equipmentName }}</td>
                      <td>{{ item.date }}</td>
                      <td>{{ item.morningShift }}小时</td>
                      <td>{{ item.afternoonShift }}小时</td>
                      <td>{{ item.nightShift }}小时</td>
                      <td>{{ item.totalTime }}小时</td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- 运行时间趋势图 -->
            <div v-if="selectedTimeTab === 'runTimeChart'" class="report-item">
              <h3>运行时间趋势图 (RSTC)</h3>
              <div class="run-time-chart-container">
                <bar-chart :data="runTimeChartData" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 性能稼动率报表 -->
      <div v-if="selectedReportType === 'performance'" class="performance-utilization">
        <div class="performance-period-selector">
          <button
              v-for="period in performancePeriods"
              :key="period.value"
              :class="{ active: selectedPerformancePeriod === period.value }"
              @click="selectedPerformancePeriod = period.value"
          >
            {{ period.label }}
          </button>
          <date-picker
              v-model="customPerformanceDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
          />
        </div>

        <div class="performance-report-container">
          <!-- 日性能稼动率报表 -->
          <div v-if="selectedPerformancePeriod === 'daily'" class="performance-report-item">
            <h3>日性能稼动率报表</h3>
            <div class="performance-chart-container">
              <line-chart :data="dailyPerformanceData" />
            </div>
            <div class="performance-table-container">
              <table>
                <thead>
                <tr>
                  <th>日期</th>
                  <th>设备名称</th>
                  <th>标准产能</th>
                  <th>实际产能</th>
                  <th>性能稼动率</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="item in dailyPerformanceTableData" :key="item.id">
                  <td>{{ item.date }}</td>
                  <td>{{ item.equipmentName }}</td>
                  <td>{{ item.standardOutput }}</td>
                  <td>{{ item.actualOutput }}</td>
                  <td>{{ item.performanceRate }}%</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 周性能稼动率报表 -->
          <div v-if="selectedPerformancePeriod === 'weekly'" class="performance-report-item">
            <h3>周性能稼动率报表</h3>
            <div class="performance-chart-container">
              <line-chart :data="weeklyPerformanceData" />
            </div>
            <div class="performance-table-container">
              <table>
                <thead>
                <tr>
                  <th>周次</th>
                  <th>设备名称</th>
                  <th>标准产能</th>
                  <th>实际产能</th>
                  <th>性能稼动率</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="item in weeklyPerformanceTableData" :key="item.id">
                  <td>{{ item.week }}</td>
                  <td>{{ item.equipmentName }}</td>
                  <td>{{ item.standardOutput }}</td>
                  <td>{{ item.actualOutput }}</td>
                  <td>{{ item.performanceRate }}%</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 月性能稼动率报表 -->
          <div v-if="selectedPerformancePeriod === 'monthly'" class="performance-report-item">
            <h3>月性能稼动率报表</h3>
            <div class="performance-chart-container">
              <line-chart :data="monthlyPerformanceData" />
            </div>
            <div class="performance-table-container">
              <table>
                <thead>
                <tr>
                  <th>月份</th>
                  <th>设备名称</th>
                  <th>标准产能</th>
                  <th>实际产能</th>
                  <th>性能稼动率</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="item in monthlyPerformanceTableData" :key="item.id">
                  <td>{{ item.month }}</td>
                  <td>{{ item.equipmentName }}</td>
                  <td>{{ item.standardOutput }}</td>
                  <td>{{ item.actualOutput }}</td>
                  <td>{{ item.performanceRate }}%</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 年性能稼动率报表 -->
          <div v-if="selectedPerformancePeriod === 'yearly'" class="performance-report-item">
            <h3>年性能稼动率报表</h3>
            <div class="performance-chart-container">
              <line-chart :data="yearlyPerformanceData" />
            </div>
            <div class="performance-table-container">
              <table>
                <thead>
                <tr>
                  <th>年份</th>
                  <th>设备名称</th>
                  <th>标准产能</th>
                  <th>实际产能</th>
                  <th>性能稼动率</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="item in yearlyPerformanceTableData" :key="item.id">
                  <td>{{ item.year }}</td>
                  <td>{{ item.equipmentName }}</td>
                  <td>{{ item.standardOutput }}</td>
                  <td>{{ item.actualOutput }}</td>
                  <td>{{ item.performanceRate }}%</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- 质量稼动率报表 -->
      <div v-if="selectedReportType === 'quality'" class="quality-utilization">
        <div class="quality-period-selector">
          <button
              v-for="period in qualityPeriods"
              :key="period.value"
              :class="{ active: selectedQualityPeriod === period.value }"
              @click="selectedQualityPeriod = period.value"
          >
            {{ period.label }}
          </button>
          <date-picker
              v-model="customQualityDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
          />
        </div>

        <div class="quality-report-container">
          <!-- 日良品趋势报表 -->
          <div v-if="selectedQualityPeriod === 'daily'" class="quality-report-item">
            <h3>日良品趋势报表</h3>
            <div class="quality-chart-container">
              <line-chart :data="dailyQualityData" />
            </div>
            <div class="quality-table-container">
              <table>
                <thead>
                <tr>
                  <th>日期</th>
                  <th>设备名称</th>
                  <th>生产总数</th>
                  <th>良品数</th>
                  <th>不良品数</th>
                  <th>良品率</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="item in dailyQualityTableData" :key="item.id">
                  <td>{{ item.date }}</td>
                  <td>{{ item.equipmentName }}</td>
                  <td>{{ item.totalOutput }}</td>
                  <td>{{ item.goodOutput }}</td>
                  <td>{{ item.badOutput }}</td>
                  <td>{{ item.qualityRate }}%</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 周良品趋势报表 -->
          <div v-if="selectedQualityPeriod === 'weekly'" class="quality-report-item">
            <h3>周良品趋势报表</h3>
            <div class="quality-chart-container">
              <line-chart :data="weeklyQualityData" />
            </div>
            <div class="quality-table-container">
              <table>
                <thead>
                <tr>
                  <th>周次</th>
                  <th>设备名称</th>
                  <th>生产总数</th>
                  <th>良品数</th>
                  <th>不良品数</th>
                  <th>良品率</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="item in weeklyQualityTableData" :key="item.id">
                  <td>{{ item.week }}</td>
                  <td>{{ item.equipmentName }}</td>
                  <td>{{ item.totalOutput }}</td>
                  <td>{{ item.goodOutput }}</td>
                  <td>{{ item.badOutput }}</td>
                  <td>{{ item.qualityRate }}%</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 月良品趋势报表 -->
          <div v-if="selectedQualityPeriod === 'monthly'" class="quality-report-item">
            <h3>月良品趋势报表</h3>
            <div class="quality-chart-container">
              <line-chart :data="monthlyQualityData" />
            </div>
            <div class="quality-table-container">
              <table>
                <thead>
                <tr>
                  <th>月份</th>
                  <th>设备名称</th>
                  <th>生产总数</th>
                  <th>良品数</th>
                  <th>不良品数</th>
                  <th>良品率</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="item in monthlyQualityTableData" :key="item.id">
                  <td>{{ item.month }}</td>
                  <td>{{ item.equipmentName }}</td>
                  <td>{{ item.totalOutput }}</td>
                  <td>{{ item.goodOutput }}</td>
                  <td>{{ item.badOutput }}</td>
                  <td>{{ item.qualityRate }}%</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import DatePicker from 'vue-datepicker-next';
import 'vue-datepicker-next/index.css';
import LineChart from '../../components/charts/LineChart.vue';
import BarChart from '../../components/charts/BarChart.vue';

export default {
  components: {
    DatePicker,
    LineChart,
    BarChart
  },
  setup() {
    // 报表类型选择
    const selectedReportType = ref('time');

    // 时间稼动率相关状态
    const selectedTimePeriod = ref('daily');
    const selectedTimeTab = ref('daily');
    const customDateRange = ref([new Date(), new Date()]);
    const selectedEquipment = ref([]);
    const selectedTimeRange = ref('today');
    const customManagementDateRange = ref([new Date(), new Date()]);
    const customPerformanceDateRange = ref([new Date(), new Date()]);
    const customQualityDateRange = ref([new Date(), new Date()]);
    const selectedPerformancePeriod = ref('daily');
    const selectedQualityPeriod = ref('daily');

    // 选项数据
    const timePeriods = [
      { label: '日报表', value: 'daily' },
      { label: '周报表', value: 'weekly' },
      { label: '月报表', value: 'monthly' }
    ];

    const timeReportTabs = [
      { label: '日稼动率趋势表', value: 'daily' },
      { label: '周稼动率趋势表', value: 'weekly' },
      { label: '月稼动率趋势表', value: 'monthly' },
      { label: '时间稼动率管理', value: 'management' },
      { label: '稼动率报表管理', value: 'reportManagement' },
      { label: '稼动率趋势总览', value: 'trendOverview' },
      { label: '稼动率趋势明细', value: 'trendDetail' },
      { label: '运行时间趋势表', value: 'runTimeTable' },
      { label: '运行时间趋势图', value: 'runTimeChart' }
    ];

    const performancePeriods = [
      { label: '日报表', value: 'daily' },
      { label: '周报表', value: 'weekly' },
      { label: '月报表', value: 'monthly' },
      { label: '年报表', value: 'yearly' }
    ];

    const qualityPeriods = [
      { label: '日报表', value: 'daily' },
      { label: '周报表', value: 'weekly' },
      { label: '月报表', value: 'monthly' }
    ];

    // 模拟数据
    const equipmentList = [
      { id: 1, name: '设备A' },
      { id: 2, name: '设备B' },
      { id: 3, name: '设备C' },
      { id: 4, name: '设备D' }
    ];

    // 时间稼动率数据
    const dailyTimeUtilizationData = ref({
      labels: ['1日', '2日', '3日', '4日', '5日', '6日', '7日'],
      datasets: [
        {
          label: '设备A',
          data: [85, 82, 88, 90, 87, 85, 89],
          borderColor: '#4CAF50'
        },
        {
          label: '设备B',
          data: [78, 80, 82, 85, 83, 81, 84],
          borderColor: '#2196F3'
        }
      ]
    });

    const weeklyTimeUtilizationData = ref({
      labels: ['第1周', '第2周', '第3周', '第4周'],
      datasets: [
        {
          label: '设备A',
          data: [86, 88, 87, 89],
          borderColor: '#4CAF50'
        },
        {
          label: '设备B',
          data: [80, 82, 83, 84],
          borderColor: '#2196F3'
        }
      ]
    });

    const monthlyTimeUtilizationData = ref({
      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
      datasets: [
        {
          label: '设备A',
          data: [85, 86, 87, 88, 89, 90],
          borderColor: '#4CAF50'
        },
        {
          label: '设备B',
          data: [80, 81, 82, 83, 84, 85],
          borderColor: '#2196F3'
        }
      ]
    });

    const timeManagementData = ref([
      { id: 1, equipmentName: '设备A', date: '2023-01-01', plannedTime: 24, actualTime: 22, downTime: 2, utilizationRate: 91.67 },
      { id: 2, equipmentName: '设备B', date: '2023-01-01', plannedTime: 24, actualTime: 20, downTime: 4, utilizationRate: 83.33 },
      { id: 3, equipmentName: '设备A', date: '2023-01-02', plannedTime: 24, actualTime: 23, downTime: 1, utilizationRate: 95.83 },
      { id: 4, equipmentName: '设备B', date: '2023-01-02', plannedTime: 24, actualTime: 21, downTime: 3, utilizationRate: 87.50 }
    ]);

    const reportList = ref([
      { id: 1, name: '2023年1月稼动率报表', type: '月报表', createdAt: '2023-02-01 10:00:00' },
      { id: 2, name: '2023年第1周稼动率报表', type: '周报表', createdAt: '2023-01-08 10:00:00' },
      { id: 3, name: '2023-01-01稼动率报表', type: '日报表', createdAt: '2023-01-02 10:00:00' }
    ]);

    const trendOverviewData = ref({
      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
      datasets: [
        {
          label: '平均稼动率',
          data: [85, 86, 87, 88, 89, 90],
          borderColor: '#FF9800'
        }
      ]
    });

    const trendDetailData = ref([
      { id: 1, date: '2023-01-01', equipmentName: '设备A', shift: '早班', plannedTime: 8, actualTime: 7.5, utilizationRate: 93.75, abnormalTime: 30, abnormalReason: '设备维护' },
      { id: 2, date: '2023-01-01', equipmentName: '设备A', shift: '中班', plannedTime: 8, actualTime: 8, utilizationRate: 100, abnormalTime: 0, abnormalReason: '' },
      { id: 3, date: '2023-01-01', equipmentName: '设备B', shift: '早班', plannedTime: 8, actualTime: 7, utilizationRate: 87.5, abnormalTime: 60, abnormalReason: '原料短缺' }
    ]);

    const runTimeTableData = ref([
      { id: 1, equipmentName: '设备A', date: '2023-01-01', morningShift: 7.5, afternoonShift: 8, nightShift: 7, totalTime: 22.5 },
      { id: 2, equipmentName: '设备B', date: '2023-01-01', morningShift: 7, afternoonShift: 7, nightShift: 6, totalTime: 20 }
    ]);

    const runTimeChartData = ref({
      labels: ['早班', '中班', '晚班'],
      datasets: [
        {
          label: '设备A',
          data: [7.5, 8, 7],
          backgroundColor: '#4CAF50'
        },
        {
          label: '设备B',
          data: [7, 7, 6],
          backgroundColor: '#2196F3'
        }
      ]
    });

    // 性能稼动率数据
    const dailyPerformanceData = ref({
      labels: ['1日', '2日', '3日', '4日', '5日', '6日', '7日'],
      datasets: [
        {
          label: '设备A性能稼动率',
          data: [92, 90, 93, 95, 94, 93, 95],
          borderColor: '#4CAF50'
        },
        {
          label: '设备B性能稼动率',
          data: [88, 89, 90, 91, 90, 89, 92],
          borderColor: '#2196F3'
        }
      ]
    });

    const dailyPerformanceTableData = ref([
      { id: 1, date: '2023-01-01', equipmentName: '设备A', standardOutput: 1000, actualOutput: 920, performanceRate: 92 },
      { id: 2, date: '2023-01-01', equipmentName: '设备B', standardOutput: 800, actualOutput: 704, performanceRate: 88 }
    ]);

    const weeklyPerformanceData = ref({
      labels: ['第1周', '第2周', '第3周', '第4周'],
      datasets: [
        {
          label: '设备A性能稼动率',
          data: [92, 93, 94, 95],
          borderColor: '#4CAF50'
        },
        {
          label: '设备B性能稼动率',
          data: [89, 90, 91, 92],
          borderColor: '#2196F3'
        }
      ]
    });

    const weeklyPerformanceTableData = ref([
      { id: 1, week: '第1周', equipmentName: '设备A', standardOutput: 7000, actualOutput: 6440, performanceRate: 92 },
      { id: 2, week: '第1周', equipmentName: '设备B', standardOutput: 5600, actualOutput: 4984, performanceRate: 89 }
    ]);

    const monthlyPerformanceData = ref({
      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
      datasets: [
        {
          label: '设备A性能稼动率',
          data: [92, 93, 94, 95, 96, 97],
          borderColor: '#4CAF50'
        },
        {
          label: '设备B性能稼动率',
          data: [89, 90, 91, 92, 93, 94],
          borderColor: '#2196F3'
        }
      ]
    });

    const monthlyPerformanceTableData = ref([
      { id: 1, month: '1月', equipmentName: '设备A', standardOutput: 31000, actualOutput: 28520, performanceRate: 92 },
      { id: 2, month: '1月', equipmentName: '设备B', standardOutput: 24800, actualOutput: 22072, performanceRate: 89 }
    ]);

    const yearlyPerformanceData = ref({
      labels: ['2020', '2021', '2022', '2023'],
      datasets: [
        {
          label: '设备A性能稼动率',
          data: [88, 90, 92, 94],
          borderColor: '#4CAF50'
        },
        {
          label: '设备B性能稼动率',
          data: [85, 87, 89, 91],
          borderColor: '#2196F3'
        }
      ]
    });

    const yearlyPerformanceTableData = ref([
      { id: 1, year: '2023', equipmentName: '设备A', standardOutput: 372000, actualOutput: 349680, performanceRate: 94 },
      { id: 2, year: '2023', equipmentName: '设备B', standardOutput: 297600, actualOutput: 270816, performanceRate: 91 }
    ]);

    // 质量稼动率数据
    const dailyQualityData = ref({
      labels: ['1日', '2日', '3日', '4日', '5日', '6日', '7日'],
      datasets: [
        {
          label: '设备A良品率',
          data: [98, 97, 98, 99, 98, 97, 99],
          borderColor: '#4CAF50'
        },
        {
          label: '设备B良品率',
          data: [95, 96, 97, 98, 97, 96, 98],
          borderColor: '#2196F3'
        }
      ]
    });

    const dailyQualityTableData = ref([
      { id: 1, date: '2023-01-01', equipmentName: '设备A', totalOutput: 1000, goodOutput: 980, badOutput: 20, qualityRate: 98 },
      { id: 2, date: '2023-01-01', equipmentName: '设备B', totalOutput: 800, goodOutput: 760, badOutput: 40, qualityRate: 95 }
    ]);

    const weeklyQualityData = ref({
      labels: ['第1周', '第2周', '第3周', '第4周'],
      datasets: [
        {
          label: '设备A良品率',
          data: [98, 98.5, 99, 99.5],
          borderColor: '#4CAF50'
        },
        {
          label: '设备B良品率',
          data: [96, 97, 98, 99],
          borderColor: '#2196F3'
        }
      ]
    });

    const weeklyQualityTableData = ref([
      { id: 1, week: '第1周', equipmentName: '设备A', totalOutput: 7000, goodOutput: 6860, badOutput: 140, qualityRate: 98 },
      { id: 2, week: '第1周', equipmentName: '设备B', totalOutput: 5600, goodOutput: 5376, badOutput: 224, qualityRate: 96 }
    ]);

    const monthlyQualityData = ref({
      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
      datasets: [
        {
          label: '设备A良品率',
          data: [98, 98.5, 99, 99.5, 99.8, 100],
          borderColor: '#4CAF50'
        },
        {
          label: '设备B良品率',
          data: [96, 97, 98, 99, 99.5, 100],
          borderColor: '#2196F3'
        }
      ]
    });

    const monthlyQualityTableData = ref([
      { id: 1, month: '1月', equipmentName: '设备A', totalOutput: 31000, goodOutput: 30380, badOutput: 620, qualityRate: 98 },
      { id: 2, month: '1月', equipmentName: '设备B', totalOutput: 24800, goodOutput: 23808, badOutput: 992, qualityRate: 96 }
    ]);

    // 计算属性
    const averageUtilization = computed(() => {
      const sum = trendOverviewData.value.datasets[0].data.reduce((a, b) => a + b, 0);
      return (sum / trendOverviewData.value.datasets[0].data.length).toFixed(2);
    });

    const maxUtilization = computed(() => {
      return Math.max(...trendOverviewData.value.datasets[0].data);
    });

    const minUtilization = computed(() => {
      return Math.min(...trendOverviewData.value.datasets[0].data);
    });

    // 方法
    const exportReport = (format) => {
      alert(`导出${format}格式报表`);
    };

    const downloadReport = (id) => {
      alert(`下载报表ID: ${id}`);
    };

    const deleteReport = (id) => {
      alert(`删除报表ID: ${id}`);
    };

    return {
      selectedReportType,
      selectedTimePeriod,
      selectedTimeTab,
      customDateRange,
      selectedEquipment,
      selectedTimeRange,
      customManagementDateRange,
      customPerformanceDateRange,
      customQualityDateRange,
      selectedPerformancePeriod,
      selectedQualityPeriod,
      timePeriods,
      timeReportTabs,
      performancePeriods,
      qualityPeriods,
      equipmentList,
      dailyTimeUtilizationData,
      weeklyTimeUtilizationData,
      monthlyTimeUtilizationData,
      timeManagementData,
      reportList,
      trendOverviewData,
      trendDetailData,
      runTimeTableData,
      runTimeChartData,
      dailyPerformanceData,
      dailyPerformanceTableData,
      weeklyPerformanceData,
      weeklyPerformanceTableData,
      monthlyPerformanceData,
      monthlyPerformanceTableData,
      yearlyPerformanceData,
      yearlyPerformanceTableData,
      dailyQualityData,
      dailyQualityTableData,
      weeklyQualityData,
      weeklyQualityTableData,
      monthlyQualityData,
      monthlyQualityTableData,
      averageUtilization,
      maxUtilization,
      minUtilization,
      exportReport,
      downloadReport,
      deleteReport
    };
  }
};
</script>

<style scoped>
.utilization-report-system {
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.report-type-selector {
  display: flex;
  align-items: center;
}

.report-type-selector select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.time-period-selector,
.performance-period-selector,
.quality-period-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.time-period-selector button,
.performance-period-selector button,
.quality-period-selector button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background-color: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
}

.time-period-selector button.active,
.performance-period-selector button.active,
.quality-period-selector button.active {
  background-color: #2196F3;
  color: white;
  border-color: #2196F3;
}

.report-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.report-tabs button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background-color: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
}

.report-tabs button.active {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.report-item {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.chart-container {
  height: 400px;
  margin: 20px 0;
}

.report-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.report-actions button {
  padding: 8px 16px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.management-container {
  margin-top: 20px;
}

.filter-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.filter-item {
  display: flex;
  align-items: center;
}

.filter-item label {
  margin-right: 10px;
  min-width: 80px;
}

.filter-item select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  min-width: 200px;
}

.data-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

th {
  background-color: #f5f5f5;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

.trend-overview-container {
  display: flex;
  gap: 20px;
}

.overview-chart {
  flex: 2;
}

.overview-stats {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stat-item {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.stat-item h4 {
  margin-top: 0;
  color: #666;
}

.stat-item p {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 0;
  color: #2196F3;
}

.performance-report-item,
.quality-report-item {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.performance-chart-container,
.quality-chart-container {
  height: 300px;
  margin: 20px 0;
}

.performance-table-container,
.quality-table-container {
  margin-top: 20px;
  overflow-x: auto;
}
</style>
