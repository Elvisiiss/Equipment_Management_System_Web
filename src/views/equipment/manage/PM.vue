
<!--  5.3.1 PM工单复机检查创建-->
<template>
  <div>
    <el-button type="primary" @click="createPM">创建 PM 工单（自动带入复机检查）</el-button>
    <el-button type="success" @click="submitCheck">提交检查结果</el-button>

    <el-table :data="checkList" style="width:100%;margin-top:10px">
      <el-table-column prop="name" label="名称"/>
      <el-table-column prop="action" label="操作"/>
      <el-table-column prop="method" label="方法"/>
      <el-table-column prop="spec" label="规格"/>
      <el-table-column label="必检">
        <template #default="{row}">
          <el-checkbox v-model="row.required" disabled/>
        </template>
      </el-table-column>
      <el-table-column label="结果">
        <template #default="{row}">
          <el-select v-model="row.result" placeholder="请选择" style="width:90px">
            <el-option label="OK" value="OK"/>
            <el-option label="NG" value="NG"/>
            <el-option label="NA" value="NA"/>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="备注">
        <template #default="{row}">
          <el-input v-model="row.remark"/>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import eventBus from '@/utils/eventBus';

const checkList = ref([]);

// 创建 PM：弹窗选择位置后，把复机检查项拷贝为工单检查列表
function createPM() {
  ElMessageBox.prompt('请输入逻辑位置ID（示例 root）', '创建工单', {
    confirmButtonText: '生成',
    inputPattern:/\S/,
    inputErrorMessage:'不能为空'
  }).then(({ value }) => {
    eventBus.emit('need-recovery', value);
  });
}
// 监听复机检查返回
eventBus.on('send-recovery', (list) => {
  checkList.value = list.map(item => ({ ...item, result:'', remark:'' }));
});
// 提交
function submitCheck() {
  if (checkList.value.some(i => i.required && !i.result)) {
    ElMessage.warning('必检项未完成');
    return;
  }
  console.table(checkList.value);
  ElMessage.success('提交成功');
}
</script>
