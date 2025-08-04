<template>
  <Layout title="设备验收">
    <el-steps :active="stepActive" finish-status="success" class="steps">
      <el-step title="到货确认" />
      <el-step title="质量检验" />
      <el-step title="验收完成" />
    </el-steps>

    <el-form v-if="stepActive === 0" :model="form" label-width="110px">
      <el-form-item label="到货单号">
        <el-input v-model="form.arrivalNo" />
      </el-form-item>
      <el-form-item label="到货日期">
        <el-date-picker v-model="form.arrivalDate" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="stepActive = 1">下一步</el-button>
      </el-form-item>
    </el-form>

    <el-form v-if="stepActive === 1" :model="form" label-width="110px">
      <el-form-item label="外观检查">
        <el-radio-group v-model="form.lookOk">
          <el-radio :label="true">合格</el-radio>
          <el-radio :label="false">不合格</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="性能检查">
        <el-radio-group v-model="form.funcOk">
          <el-radio :label="true">合格</el-radio>
          <el-radio :label="false">不合格</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="stepActive = 2">下一步</el-button>
        <el-button @click="stepActive = 0">上一步</el-button>
      </el-form-item>
    </el-form>

    <el-result
        v-if="stepActive === 2"
        icon="success"
        title="验收完成"
        sub-title="设备已转为固定资产，请继续转固流程"
    >
      <template #extra>
        <el-button type="primary" @click="$router.push('/asset/manage/life/capitalize')">
          去转固
        </el-button>
      </template>
    </el-result>
  </Layout>
</template>

<script setup>
import { ref, reactive } from 'vue'
import Layout from './Layout.vue'

const stepActive = ref(0)
const form = reactive({
  arrivalNo: '',
  arrivalDate: '',
  lookOk: true,
  funcOk: true
})
</script>

<style scoped>
.steps {
  margin-bottom: 20px;
}
</style>
