<template>
  <el-form :model="form" label-width="100px" inline>
    <el-form-item label="年份">
      <el-date-picker v-model="form.year" type="year" placeholder="选择年份" />
    </el-form-item>
    <el-form-item label="开始周">
      <el-input-number v-model="form.startWeek" :min="1" :max="53" placeholder="开始周" />
    </el-form-item>
    <el-form-item label="结束周">
      <el-input-number v-model="form.endWeek" :min="1" :max="53" placeholder="结束周" />
    </el-form-item>
    <el-form-item label="车间">
      <el-select v-model="form.workshop" placeholder="请选择车间">
        <el-option label="车间一" value="1" />
        <el-option label="车间二" value="2" />
      </el-select>
    </el-form-item>
    <el-form-item label="产线">
      <el-select v-model="form.productionLine" placeholder="请选择产线">
        <el-option label="产线A" value="A" />
        <el-option label="产线B" value="B" />
      </el-select>
    </el-form-item>
    <el-form-item label="工段">
      <el-select v-model="form.section" placeholder="请选择工段">
        <el-option label="工段1" value="1" />
        <el-option label="工段2" value="2" />
      </el-select>
    </el-form-item>
    <el-form-item label="设备编码">
      <el-input v-model="form.equipmentCode" placeholder="请输入设备编码" />
    </el-form-item>
    <el-form-item label="设备名称">
      <el-input v-model="form.equipmentName" placeholder="请输入设备名称" />
    </el-form-item>
    <el-form-item label="厂商">
      <el-select v-model="form.manufacturer" placeholder="请选择厂商">
        <el-option label="厂商A" value="A" />
        <el-option label="厂商B" value="B" />
      </el-select>
    </el-form-item>
    <el-form-item label="班次">
      <el-select v-model="form.shift" placeholder="请选择班次">
        <el-option label="白班" value="day" />
        <el-option label="夜班" value="night" />
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  year: '',
  startWeek: '',
  endWeek: '',
  workshop: '',
  productionLine: '',
  section: '',
  equipmentCode: '',
  equipmentName: '',
  manufacturer: '',
  shift: ''
})

defineExpose({
  getFormData: () => form.value,
  resetForm: () => {
    form.value = {
      year: '',
      startWeek: '',
      endWeek: '',
      workshop: '',
      productionLine: '',
      section: '',
      equipmentCode: '',
      equipmentName: '',
      manufacturer: '',
      shift: ''
    }
  }
})
</script>
