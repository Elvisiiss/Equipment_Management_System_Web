<template>
  <el-card>
    <template #header>
      <div style="display:flex;align-items:center;">
        <span style="font-size:18px;font-weight:bold;">模具全生命周期管理</span>
        <el-steps
            :active="activeStep"
            finish-status="success"
            style="flex:1;margin-left:40px"
            @click="handleStepClick">
          <el-step v-for="(s,i) in steps" :key="i" :title="s" :data-index="i"/>
        </el-steps>
      </div>
    </template>

    <!-- 内容区 -->
    <div v-if="activeStep === 0">
      <mold-installation @next="next" />
    </div>

    <div v-if="activeStep === 1">
      <mold-status @prev="prev" @next="next" />
    </div>

    <div v-if="activeStep === 2">
      <mold-maintenance @prev="prev" @next="next" />
    </div>

    <div v-if="activeStep === 3">
      <mold-repair @prev="prev" @next="next" />
    </div>

    <div v-if="activeStep === 4">
      <mold-scrap @prev="prev" @submit="submitScrap" />
    </div>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import MoldInstallation from '@/components/mold2/MoldInstallation.vue'
import MoldStatus from '@/components/mold2/MoldStatus.vue'
import MoldMaintenance from '@/components/mold2/MoldMaintenance.vue'
import MoldRepair from '@/components/mold2/MoldRepair.vue'
import MoldScrap from '@/components/mold2/MoldScrap.vue'

const activeStep = ref(0)
const steps = ['模具安装', '模具状态', '模具保养', '模具维修', '模具报废']

const next = () => activeStep.value < 4 && activeStep.value++
const prev = () => activeStep.value > 0 && activeStep.value--

const handleStepClick = (e) => {
  if (e.target.dataset.index) {
    activeStep.value = Number(e.target.dataset.index)
  }
}

const submitScrap = () => {
  ElMessage.success('模具已标记为报废')
}
</script>
