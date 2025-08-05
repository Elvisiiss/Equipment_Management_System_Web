<template>
  <el-card>
    <template #header>
      <div style="display:flex;align-items:center;">
        <span style="font-size:18px;font-weight:bold;">模具全生命周期管理</span>
        <el-steps
            :active="activeStep"
            finish-status="success"
            style="flex:1;margin-left:40px"
            @click="(e)=>e.target.dataset.index && (activeStep=Number(e.target.dataset.index))">
          <el-step v-for="(s,i) in steps" :key="i" :title="s" :data-index="i"/>
        </el-steps>
      </div>
    </template>

    <!-- 内容区 -->
    <div v-show="activeStep===0">
      <h3>1. 模具设计</h3>
      <el-form :model="design" label-width="100">
        <el-form-item label="模具编号"><el-input v-model="design.code"/></el-form-item>
        <el-form-item label="产品名称"><el-input v-model="design.product"/></el-form-item>
        <el-form-item label="设计图纸">
          <el-upload
              :limit="1"
              accept=".jpg,.png,.pdf"
              :auto-upload="false"
              :on-change="f=>design.file=f.raw">
            <el-button>选择文件</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="next">保存并下一步</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-show="activeStep===1">
      <h3>2. 模具制造</h3>
      <el-form :model="make" label-width="100">
        <el-form-item label="开模日期">
          <el-date-picker v-model="make.start" style="width:100%"/>
        </el-form-item>
        <el-form-item label="预计完成">
          <el-date-picker v-model="make.end" style="width:100%"/>
        </el-form-item>
        <el-form-item label="制造厂商"><el-input v-model="make.vendor"/></el-form-item>
        <el-form-item>
          <el-button @click="prev">上一步</el-button>
          <el-button type="primary" @click="next">保存并下一步</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-show="activeStep===2">
      <h3>3. 模具使用</h3>
      <el-table :data="usage.list" border style="width:100%;margin-bottom:10px">
        <el-table-column prop="wo" label="工单号"/>
        <el-table-column prop="qty" label="产量"/>
        <el-table-column prop="date" label="日期"/>
      </el-table>
      <el-button @click="prev">上一步</el-button>
      <el-button type="primary" @click="next">下一步</el-button>
    </div>

    <div v-show="activeStep===3">
      <h3>4. 维护保养</h3>
      <el-table :data="maint.list" border style="width:100%;margin-bottom:10px">
        <el-table-column prop="plan" label="保养计划"/>
        <el-table-column prop="date" label="执行日期"/>
        <el-table-column prop="result" label="结果"/>
      </el-table>
      <el-button @click="prev">上一步</el-button>
      <el-button type="primary" @click="next">下一步</el-button>
    </div>

    <div v-show="activeStep===4">
      <h3>5. 模具报废</h3>
      <el-form :model="scrap" label-width="100">
        <el-form-item label="报废原因">
          <el-select v-model="scrap.reason" placeholder="请选择" style="width:100%">
            <el-option label="寿命到期" value="life"/>
            <el-option label="严重损坏" value="damage"/>
            <el-option label="技术淘汰" value="obsolete"/>
          </el-select>
        </el-form-item>
        <el-form-item label="说明">
          <el-input type="textarea" :rows="3" v-model="scrap.note"/>
        </el-form-item>
        <el-form-item>
          <el-button @click="prev">上一步</el-button>
          <el-button type="danger" @click="submitScrap">确认报废</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-card>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const activeStep = ref(0)
const steps = ['模具设计', '模具制造', '模具使用', '维护保养', '模具报废']

// 各阶段数据
const design = reactive({ code:'', product:'', file:null })
const make   = reactive({ start:'', end:'', vendor:'' })
const usage  = reactive({ list:[{ wo:'WO2024001', qty:5000, date:'2025-08-01' }] })
const maint  = reactive({ list:[{ plan:'一级保养', date:'2025-08-03', result:'OK' }] })
const scrap  = reactive({ reason:'', note:'' })

const next = () => activeStep.value < 4 && activeStep.value++
const prev = () => activeStep.value > 0 && activeStep.value--
const submitScrap = () => {
  ElMessage.success('模具已标记为报废')
  // 可在此处调用接口
}
</script>
