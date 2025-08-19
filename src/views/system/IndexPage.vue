<template>
  <div class="system-settings">
    <el-page-header @back="handleBack" content="系统设置"></el-page-header>

    <div class="settings-content">
      <!-- 系统基础设置 -->
      <div class="settings-section">
        <div class="section-header">
          <el-icon class="section-icon"><Setting /></el-icon>
          <h2>系统基础设置</h2>
        </div>
        <el-row :gutter="20" class="settings-row">
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="系统名称">
              <el-input v-model="systemName" placeholder="设备管理系统"></el-input>
            </el-form-item>
          </el-col>
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="默认语言">
              <el-select v-model="defaultLang">
                <el-option label="简体中文" value="zh-CN"></el-option>
                <el-option label="English" value="en-US"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="自动锁屏时间">
              <el-select v-model="lockTime">
                <el-option label="5分钟" value="5"></el-option>
                <el-option label="10分钟" value="10"></el-option>
                <el-option label="30分钟" value="30"></el-option>
                <el-option label="永不锁屏" value="0"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="数据备份频率">
              <el-select v-model="backupFreq">
                <el-option label="每日" value="daily"></el-option>
                <el-option label="每周" value="weekly"></el-option>
                <el-option label="每月" value="monthly"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 审核管理设置 -->
      <div class="settings-section">
        <div class="section-header">
          <el-icon class="section-icon"><DocumentChecked /></el-icon>
          <h2>审核管理设置</h2>
        </div>
        <el-row :gutter="20" class="settings-row">
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="审核流程启用">
              <el-switch v-model="checkProcessEnabled" active-text="启用" inactive-text="禁用"></el-switch>
            </el-form-item>
          </el-col>
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="多级审核">
              <el-switch v-model="multiLevelCheck" active-text="启用" inactive-text="禁用"></el-switch>
            </el-form-item>
          </el-col>
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="审核超时时间">
              <el-input-number v-model="checkTimeout" :min="1" :max="72" :step="1" suffix="小时"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="自动通过设置">
              <el-select v-model="autoApprove">
                <el-option label="不自动通过" value="none"></el-option>
                <el-option label="超时自动通过" value="timeout"></el-option>
                <el-option label="默认自动通过" value="default"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 资产管理设置 -->
      <div class="settings-section">
        <div class="section-header">
          <el-icon class="section-icon"><Connection /></el-icon>
          <h2>资产管理设置</h2>
        </div>
        <el-row :gutter="20" class="settings-row">
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="资产编码规则">
              <el-select v-model="assetCodeRule">
                <el-option label="系统自动生成" value="auto"></el-option>
                <el-option label="手动输入" value="manual"></el-option>
                <el-option label="自定义规则" value="custom"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="资产状态提醒">
              <el-switch v-model="assetStatusAlert" active-text="启用" inactive-text="禁用"></el-switch>
            </el-form-item>
          </el-col>
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="资产台账同步">
              <el-select v-model="assetSyncFreq">
                <el-option label="实时同步" value="real-time"></el-option>
                <el-option label="每日同步" value="daily"></el-option>
                <el-option label="手动同步" value="manual"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="资产报废流程">
              <el-switch v-model="assetScrapProcess" active-text="启用" inactive-text="禁用"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 设备监控设置 -->
      <div class="settings-section">
        <div class="section-header">
          <el-icon class="section-icon"><Monitor /></el-icon>
          <h2>设备监控设置</h2>
        </div>
        <el-row :gutter="20" class="settings-row">
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="实时监控频率">
              <el-select v-model="monitorFreq">
                <el-option label="1秒" value="1s"></el-option>
                <el-option label="5秒" value="5s"></el-option>
                <el-option label="30秒" value="30s"></el-option>
                <el-option label="1分钟" value="1m"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="异常阈值提醒">
              <el-switch v-model="abnormalAlert" active-text="启用" inactive-text="禁用"></el-switch>
            </el-form-item>
          </el-col>
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="数据采样周期">
              <el-select v-model="dataSampleCycle">
                <el-option label="1分钟" value="1m"></el-option>
                <el-option label="5分钟" value="5m"></el-option>
                <el-option label="30分钟" value="30m"></el-option>
                <el-option label="1小时" value="1h"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="离线告警延迟">
              <el-input-number v-model="offlineAlertDelay" :min="0" :max="60" :step="1" suffix="分钟"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 点巡检管理设置 -->
      <div class="settings-section">
        <div class="section-header">
          <el-icon class="section-icon"><List /></el-icon>
          <h2>点巡检管理设置</h2>
        </div>
        <el-row :gutter="20" class="settings-row">
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="巡检提醒">
              <el-switch v-model="inspectionReminder" active-text="启用" inactive-text="禁用"></el-switch>
            </el-form-item>
          </el-col>
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="逾期预警时间">
              <el-input-number v-model="overdueWarningTime" :min="1" :max="72" :step="1" suffix="小时"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="异常自动升级">
              <el-switch v-model="abnormalAutoUpgrade" active-text="启用" inactive-text="禁用"></el-switch>
            </el-form-item>
          </el-col>
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="巡检数据保留">
              <el-select v-model="inspectionDataRetention">
                <el-option label="3个月" value="3m"></el-option>
                <el-option label="6个月" value="6m"></el-option>
                <el-option label="1年" value="1y"></el-option>
                <el-option label="永久" value="forever"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 模具/治工具管理设置 -->
      <div class="settings-section">
        <div class="section-header">
          <el-icon class="section-icon"><Tools /></el-icon>
          <h2>模具/治工具管理设置</h2>
        </div>
        <el-row :gutter="20" class="settings-row">
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="防错验证启用">
              <el-switch v-model="errorProofEnabled" active-text="启用" inactive-text="禁用"></el-switch>
            </el-form-item>
          </el-col>
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="生命周期管理">
              <el-switch v-model="lifeCycleManagement" active-text="启用" inactive-text="禁用"></el-switch>
            </el-form-item>
          </el-col>
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="维护提醒阈值">
              <el-input-number v-model="maintenanceReminder" :min="1" :max="1000" :step="1" suffix="次"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="库存预警值">
              <el-input-number v-model="inventoryWarningValue" :min="1" :max="100" :step="1" suffix="个"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 备件管理设置 -->
      <div class="settings-section">
        <div class="section-header">
          <el-icon class="section-icon"><Box /></el-icon>
          <h2>备件管理设置</h2>
        </div>
        <el-row :gutter="20" class="settings-row">
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="低库存预警">
              <el-switch v-model="lowStockWarning" active-text="启用" inactive-text="禁用"></el-switch>
            </el-form-item>
          </el-col>
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="安全库存比例">
              <el-input-number v-model="safetyStockRatio" :min="10" :max="100" :step="5" suffix="%"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="自动补货">
              <el-switch v-model="autoReplenish" active-text="启用" inactive-text="禁用"></el-switch>
            </el-form-item>
          </el-col>
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="BOM同步频率">
              <el-select v-model="bomSyncFreq">
                <el-option label="每日" value="daily"></el-option>
                <el-option label="每周" value="weekly"></el-option>
                <el-option label="每月" value="monthly"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 维修管理设置 -->
      <div class="settings-section">
        <div class="section-header">
          <el-icon class="section-icon"><EditPen /></el-icon>
          <h2>维修管理设置</h2>
        </div>
        <el-row :gutter="20" class="settings-row">
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="维修工单自动分配">
              <el-switch v-model="workOrderAutoAssign" active-text="启用" inactive-text="禁用"></el-switch>
            </el-form-item>
          </el-col>
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="响应超时提醒">
              <el-input-number v-model="responseTimeout" :min="0.5" :max="24" :step="0.5" suffix="小时"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="维修知识库更新">
              <el-select v-model="knowledgeBaseUpdate">
                <el-option label="自动更新" value="auto"></el-option>
                <el-option label="手动更新" value="manual"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="维修质量评级">
              <el-switch v-model="maintenanceQualityRating" active-text="启用" inactive-text="禁用"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 通知设置 -->
      <div class="settings-section">
        <div class="section-header">
          <el-icon class="section-icon"><Bell /></el-icon>
          <h2>通知设置</h2>
        </div>
        <el-row :gutter="20" class="settings-row">
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="设备告警通知">
              <el-switch v-model="alarmNotify" active-text="启用" inactive-text="禁用"></el-switch>
            </el-form-item>
          </el-col>
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="巡检提醒通知">
              <el-switch v-model="inspectionNotify" active-text="启用" inactive-text="禁用"></el-switch>
            </el-form-item>
          </el-col>
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="邮件通知">
              <el-switch v-model="emailNotify" active-text="启用" inactive-text="禁用"></el-switch>
            </el-form-item>
          </el-col>
          <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
          >
            <el-form-item label="短信通知">
              <el-switch v-model="smsNotify" active-text="启用" inactive-text="禁用"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </div>

    <div class="settings-actions">
      <el-button type="primary" @click="handleSave">保存设置</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  Setting,
  Bell,
  DocumentChecked,
  Connection,
  Monitor,
  List,
  Tools,
  Box,
  EditPen
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 系统基础设置
const systemName = ref('设备管理系统')
const defaultLang = ref('zh-CN')
const lockTime = ref('10')
const backupFreq = ref('daily')

// 审核管理设置
const checkProcessEnabled = ref(true)
const multiLevelCheck = ref(true)
const checkTimeout = ref(24)
const autoApprove = ref('timeout')

// 资产管理设置
const assetCodeRule = ref('auto')
const assetStatusAlert = ref(true)
const assetSyncFreq = ref('daily')
const assetScrapProcess = ref(true)

// 设备监控设置
const monitorFreq = ref('5s')
const abnormalAlert = ref(true)
const dataSampleCycle = ref('5m')
const offlineAlertDelay = ref(5)

// 点巡检管理设置
const inspectionReminder = ref(true)
const overdueWarningTime = ref(12)
const abnormalAutoUpgrade = ref(true)
const inspectionDataRetention = ref('1y')

// 模具/治工具管理设置
const errorProofEnabled = ref(true)
const lifeCycleManagement = ref(true)
const maintenanceReminder = ref(100)
const inventoryWarningValue = ref(10)

// 备件管理设置
const lowStockWarning = ref(true)
const safetyStockRatio = ref(30)
const autoReplenish = ref(false)
const bomSyncFreq = ref('weekly')

// 维修管理设置
const workOrderAutoAssign = ref(false)
const responseTimeout = ref(2)
const knowledgeBaseUpdate = ref('auto')
const maintenanceQualityRating = ref(true)

// 通知设置
const alarmNotify = ref(true)
const inspectionNotify = ref(true)
const emailNotify = ref(false)
const smsNotify = ref(true)

// 操作方法
const handleBack = () => {
  history.back()
}

const handleSave = () => {
  ElMessage.success('设置已保存（模拟操作）')
}

const handleReset = () => {
  ElMessage.info('已重置为默认值（模拟操作）')
}
</script>

<style scoped>
.system-settings {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
  box-sizing: border-box;
}

.settings-content {
  margin-top: 20px;
}

.settings-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.settings-section:hover {
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.12);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.section-icon {
  color: #165DFF;
  margin-right: 10px;
  font-size: 20px;
}

.section-header h2 {
  margin: 0;
  font-size: 16px;
  color: #303133;
  font-weight: 600;
}

.settings-row {
  width: 100%;
}

.el-form-item {
  margin-bottom: 20px;
}

/* 针对小屏幕优化表单标签 */
@media (max-width: 768px) {
  .el-form-item__label {
    font-size: 14px;
    padding-right: 10px;
  }

  .section-header h2 {
    font-size: 15px;
  }
}

/* 针对超小屏幕进一步优化 */
@media (max-width: 480px) {
  .system-settings {
    padding: 10px;
  }

  .settings-section {
    padding: 15px;
    margin-bottom: 15px;
  }

  .section-header {
    margin-bottom: 15px;
    padding-bottom: 8px;
  }

  .el-form-item {
    margin-bottom: 15px;
  }
}

.settings-actions {
  margin-top: 30px;
  text-align: right;
  padding: 0 20px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

/* 按钮在小屏幕上占满宽度 */
@media (max-width: 576px) {
  .settings-actions {
    flex-direction: column;
  }

  .settings-actions .el-button {
    width: 100%;
  }
}
</style>
