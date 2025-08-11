
状态规则与策略
│　├─ 2.1 状态切换规则
│　├─ 2.2 策略管理（启动/变更/初始化）
│　└─ 2.3 报警配置（自动/人工/广播）
<template>
  <el-row :gutter="16">
    <!-- 左侧策略 -->
    <el-col :span="12">
      <el-card title="策略管理">
        <el-tabs tab-position="left">
          <el-tab-pane label="系统启动">
            <h4>系统启动策略</h4>
            <el-form label-width="160px">
              <el-form-item label="默认初始状态">
                <el-select v-model="policy.startup.defaultState">
                  <el-option label="闲置" value="IDLE"/>
                  <el-option label="无排程" value="NO_SCHEDULE"/>
                </el-select>
              </el-form-item>
              <el-form-item label="异常关机后动作">
                <el-radio-group v-model="policy.startup.abnormalAction">
                  <el-radio label="TO_CONFIRM">进入待确认</el-radio>
                  <el-radio label="ALARM">仅报警</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="产品变更">
            <h4>产品变更报警原则</h4>
            <el-form label-width="160px">
              <el-form-item label="允许切换状态">
                <el-checkbox-group v-model="policy.productChange.allowStates">
                  <el-checkbox label="IDLE"/>
                  <el-checkbox label="NO_SCHEDULE"/>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item label="超时升级(min)">
                <el-input-number v-model="policy.productChange.timeout" :min="1"/>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="设备初始化">
            <h4>设备初始化原则</h4>
            <el-form label-width="160px">
              <el-form-item label="自检通过才能切运行">
                <el-switch v-model="policy.init.mustCheck"/>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </el-col>

    <!-- 右侧报警与广播 -->
    <el-col :span="12">
      <el-card title="自动切换与报警">
        <el-form label-width="120px">
          <el-form-item label="自动切换">
            <el-switch v-model="policy.autoSwitch.enable"/>
          </el-form-item>
          <el-form-item label="报警通道">
            <el-checkbox-group v-model="policy.alarm.channels">
              <el-checkbox label="站内消息"/>
              <el-checkbox label="邮件"/>
              <el-checkbox label="短信"/>
              <el-checkbox label="广播"/>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="savePolicy">保存策略</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

const policy = reactive({
  startup: {
    defaultState: 'IDLE',
    abnormalAction: 'TO_CONFIRM'
  },
  productChange: {
    allowStates: ['IDLE', 'NO_SCHEDULE'],
    timeout: 5
  },
  init: { mustCheck: true },
  autoSwitch: { enable: true },
  alarm: { channels: ['站内消息', '广播'] }
})

function savePolicy () {
  // 此处可调用接口
  ElMessage.success('策略已保存')
}
</script>
